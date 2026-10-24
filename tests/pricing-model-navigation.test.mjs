import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  getPricingModelFieldVisibility,
  getPricingModelPayloadAmounts,
  getPricingModelValidationError,
  getWizardStepState,
} from "../lib/pricing-model-wizard.ts";

const readSource = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("pricing model sidebar is a direct plans-listing link without a submenu", async () => {
  const [menuSource, permissionsSource, englishMessages] = await Promise.all([
    readSource("constants/sidebarItems.ts"),
    readSource("lib/sidebar-permissions.ts"),
    readSource("messages/en.json").then(JSON.parse),
  ]);

  const pricingItem = menuSource.match(
    /titleKey: "navigation\.pricingModel",[\s\S]*?permissionAccess: "payment-settings",\n  }/
  );

  assert.ok(pricingItem, "pricing menu item should keep payment-settings access");
  assert.match(pricingItem[0], /href: "\/pricing-model\/plans-listing"/);
  assert.match(pricingItem[0], /activePathPrefix: "\/pricing-model"/);
  assert.doesNotMatch(pricingItem[0], /children:/);
  assert.doesNotMatch(menuSource, /navigation\.(createNewPlan|plansListing)"/);
  assert.match(
    permissionsSource,
    /const accessPath = item\.activePathPrefix \?\? item\.href/
  );
  assert.equal(englishMessages.navigation.pricingModel, "Pricing model");
});

test("wizard permits keyboard-accessible back navigation but disables current and future steps", async () => {
  assert.deepEqual(getWizardStepState(3, 2), {
    isActive: false,
    isCompleted: true,
    isInteractive: true,
  });
  assert.equal(getWizardStepState(2, 2).isInteractive, false);
  assert.equal(getWizardStepState(2, 3).isInteractive, false);

  const wizardSource = await readSource(
    "app/(site)/pricing-model/create-new-plan/page.tsx"
  );
  assert.match(wizardSource, /<button[\s\S]*?disabled={!isInteractive}/);
  assert.match(wizardSource, /aria-current={isActive \? "step" : undefined}/);
  assert.ok(wizardSource.includes("onClick={() => goToStep(item.value)}"));
  assert.match(wizardSource, /cursor-pointer/);
  assert.match(wizardSource, /cursor-not-allowed/);
});

test("plan, commission, and hybrid models expose distinct fields", () => {
  assert.deepEqual(getPricingModelFieldVisibility("PLAN"), {
    showSubscriptionFields: true,
    showCommissionFields: false,
  });
  assert.deepEqual(getPricingModelFieldVisibility("COMMISSION"), {
    showSubscriptionFields: false,
    showCommissionFields: true,
  });
  assert.deepEqual(getPricingModelFieldVisibility("HYBRID"), {
    showSubscriptionFields: true,
    showCommissionFields: true,
  });
});

test("payload amounts preserve backend billing-model invariants", () => {
  const base = {
    planPrice: 49,
    commissionChargeType: "FIXED",
    commissionPercentage: 7,
    commissionFixedFee: 2,
    commissionCapAmount: 100,
    applyCommissionCap: true,
  };

  assert.deepEqual(
    getPricingModelPayloadAmounts({ ...base, pricingModel: "PLAN" }),
    {
      planPrice: 49,
      commissionType: "PERCENTAGE",
      commissionPercentage: 0,
      commissionFixedAmount: 0,
      commissionCapAmount: 0,
    }
  );
  assert.equal(
    getPricingModelPayloadAmounts({ ...base, pricingModel: "COMMISSION" })
      .planPrice,
    0
  );
  assert.deepEqual(
    getPricingModelPayloadAmounts({ ...base, pricingModel: "HYBRID" }),
    {
      planPrice: 49,
      commissionType: "FIXED",
      commissionPercentage: 0,
      commissionFixedAmount: 2,
      commissionCapAmount: 0,
    }
  );
});

test("model-specific validation prevents invalid forward progress", () => {
  const valid = {
    pricingModel: "HYBRID",
    planPrice: 49,
    commissionChargeType: "PERCENTAGE",
    commissionPercentage: 5,
    commissionFixedFee: 0,
  };

  assert.equal(getPricingModelValidationError(valid), null);
  assert.equal(
    getPricingModelValidationError({ ...valid, planPrice: 0 }),
    "planPriceGreaterThanZero"
  );
  assert.equal(
    getPricingModelValidationError({ ...valid, commissionPercentage: 0 }),
    "commissionPercentageGreaterThanZero"
  );
  assert.equal(
    getPricingModelValidationError({
      ...valid,
      commissionChargeType: "FIXED",
      commissionFixedFee: 0,
    }),
    "fixedFeeGreaterThanZero"
  );
});

test("English and German validation message keys stay aligned", async () => {
  const [english, german] = await Promise.all([
    readSource("messages/en.json").then(JSON.parse),
    readSource("messages/de.json").then(JSON.parse),
  ]);

  for (const key of [
    "planPriceGreaterThanZero",
    "fixedFeeGreaterThanZero",
    "commissionPercentageGreaterThanZero",
  ]) {
    assert.equal(typeof english.validation[key], "string");
    assert.equal(typeof german.validation[key], "string");
  }
});
