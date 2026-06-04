"use client";

import { useMemo, useRef } from "react";
import { UploadCloud } from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";

type PayoutCycle = "DAILY" | "WEEKLY" | "MONTHLY" | "MANUAL";

type FeatureItem = {
  key: string;
  label: string;
};

type FeaturesVatForm = {
  features: Record<string, boolean>;
  vatEnabled: boolean;
  vatPercentage: string;
  vatLabel: string;
  payoutCycle: PayoutCycle;
  termsDocumentUrl: string;
  termsDocumentPreviewUrl: string;
};

type StepFeaturesVatProps = {
  form: FeaturesVatForm;
  featureCatalogData?: unknown;
  onChange: <K extends keyof FeaturesVatForm>(
    key: K,
    value: FeaturesVatForm[K]
  ) => void;
};

const labelClass =
  "text-xs font-semibold uppercase tracking-[0.06em] text-[#684848]";

const fallbackFeatures: FeatureItem[] = [
  { key: "orderManagement", label: "Order management" },
  { key: "customerAnalytics", label: "Customer Analytics" },
  { key: "posCashRegister", label: "POS/Cash register" },
  { key: "multiBranches", label: "Multi-Branches" },
  { key: "tableBooking", label: "Table booking" },
  { key: "mobileApp", label: "Mobile app" },
  { key: "prioritySupport", label: "Priority Support" },
  { key: "selfDelivery", label: "Self Delivery" },
  { key: "chat", label: "Chat" },
  { key: "takeAway", label: "Take Away" },
  { key: "adminDelivery", label: "Admin delivery" },
];

const formatFeatureLabel = (value: string) => {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
};

const getCatalogArray = (data: unknown): unknown[] => {
  if (Array.isArray(data)) return data;

  if (typeof data !== "object" || data === null) return [];

  const record = data as Record<string, unknown>;

  if (Array.isArray(record.data)) return record.data;
  if (Array.isArray(record.items)) return record.items;

  if (
    typeof record.data === "object" &&
    record.data !== null &&
    Array.isArray((record.data as Record<string, unknown>).items)
  ) {
    return (record.data as Record<string, unknown>).items as unknown[];
  }

  return [];
};

const normalizeFeatureCatalog = (data: unknown): FeatureItem[] => {
  const source = getCatalogArray(data);

  const normalized = source
    .map((item): FeatureItem | null => {
      if (typeof item === "string") {
        return {
          key: item,
          label: formatFeatureLabel(item),
        };
      }

      if (typeof item !== "object" || item === null) return null;

      const record = item as Record<string, unknown>;
      const keyValue =
        record.key ?? record.code ?? record.name ?? record.module ?? record.id;

      if (!keyValue) return null;

      const key = String(keyValue);
      const labelValue =
        record.label ?? record.title ?? record.name ?? record.module ?? key;

      return {
        key,
        label: String(labelValue),
      };
    })
    .filter((item): item is FeatureItem => Boolean(item?.key));

  return normalized.length > 0 ? normalized : fallbackFeatures;
};

export default function StepFeaturesVat({
  form,
  featureCatalogData,
  onChange,
}: StepFeaturesVatProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { uploadFile, uploading, progress } = useFileUpload();

  const features = useMemo(
    () => normalizeFeatureCatalog(featureCatalogData),
    [featureCatalogData]
  );

  const previewUrl = form.termsDocumentPreviewUrl || form.termsDocumentUrl;

  const toggleFeature = (key: string) => {
    onChange("features", {
      ...form.features,
      [key]: !form.features[key],
    });
  };

  const handleTermsFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const localPreviewUrl = URL.createObjectURL(file);
    onChange("termsDocumentPreviewUrl", localPreviewUrl);

    const uploadedUrl = await uploadFile(file);
    if (uploadedUrl) {
      onChange("termsDocumentUrl", uploadedUrl);
    }

    event.target.value = "";
  };

  return (
    <div className="w-full space-y-6">
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#1F2328]">Included Features</h2>
        <p className="mt-1 text-sm text-[#684848]">
          Select the tools and modules accessible to subscribers in this tier.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {features.map((feature) => {
            const isSelected = Boolean(form.features[feature.key]);

            return (
              <button
                key={feature.key}
                type="button"
                onClick={() => toggleFeature(feature.key)}
                className={`
                  rounded-full border px-5 py-2 text-sm transition
                  ${
                    isSelected
                      ? "border-primary bg-red-50 text-primary"
                      : "border-red-100 bg-white text-slate-500 hover:border-primary hover:text-primary"
                  }
                `}
              >
                {feature.label}
              </button>
            );
          })}

          {/* <button
            type="button"
            className="rounded-full border border-red-100 bg-white px-5 py-2 text-sm text-slate-500 hover:border-primary hover:text-primary"
          >
            Add More
          </button> */}
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#1F2328]">
              VAT Configuration
            </h2>
            <p className="mt-1 text-sm text-[#684848]">
              VAT is applied by the Super Admin to invoices issued to restaurant
              owners.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onChange("vatEnabled", !form.vatEnabled)}
            className="flex items-center gap-3"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.06em] text-[#1F2328]">
              Apply VAT
            </span>

            <span
              className={`
                flex h-7 w-12 items-center rounded-full p-1 transition
                ${form.vatEnabled ? "bg-primary" : "bg-slate-300"}
              `}
            >
              <span
                className={`
                  size-5 rounded-full bg-white transition
                  ${form.vatEnabled ? "translate-x-5" : ""}
                `}
              />
            </span>
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass}>VAT rate (%)</label>

            <div className="mt-2 flex h-12 overflow-hidden rounded-lg border border-slate-200">
              <input
                type="number"
                min="0"
                disabled={!form.vatEnabled}
                value={form.vatPercentage}
                onChange={(event) =>
                  onChange("vatPercentage", event.target.value)
                }
                className="h-full flex-1 px-4 text-sm outline-none disabled:bg-slate-100"
              />
              <div className="flex h-full w-12 items-center justify-center text-sm text-slate-400">
                %
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>VAT label on invoice</label>

            <input
              value={form.vatLabel}
              disabled={!form.vatEnabled}
              onChange={(event) => onChange("vatLabel", event.target.value)}
              placeholder="Standard Rate"
              className="mt-2 h-12 w-full rounded-lg border border-slate-200 px-4 text-sm outline-none transition focus:border-primary disabled:bg-slate-100"
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#1F2328]">
          Payout & Adjustments
        </h2>
        <p className="mt-1 text-sm text-[#684848]">
          Allow manual invoice adjustments and define payout cycle.
        </p>

        <div className="mt-6 max-w-xs">
          <label className={labelClass}>Payout cycle</label>

          <select
            value={form.payoutCycle}
            onChange={(event) =>
              onChange("payoutCycle", event.target.value as PayoutCycle)
            }
            className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-primary"
          >
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
            <option value="MANUAL">Manual</option>
          </select>
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#1F2328]">
          Terms & Conditions
        </h2>
        <p className="mt-1 text-sm text-[#684848]">
          Upload plan terms document.
        </p>

        <div className="mt-8 flex justify-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleTermsFileChange}
          />

          <div className="flex min-h-[180px] w-full max-w-[360px] flex-col items-center justify-center rounded-xl border border-dashed border-red-200 bg-[#F7F7F7] p-6 text-center">
            <UploadCloud size={28} className="text-primary" />

            <p className="mt-4 text-sm font-bold text-[#684848]">
              {uploading ? `Uploading ${progress}%` : "Upload PDF"}
            </p>

            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="mt-5 rounded-md border border-primary px-4 py-2 text-xs font-bold uppercase tracking-[0.04em] text-primary transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Select File
            </button>

            {previewUrl && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 max-w-full truncate text-xs font-semibold text-primary underline"
              >
                Preview uploaded PDF
              </a>
            )}

            {form.termsDocumentUrl && (
              <p className="mt-2 text-xs font-medium text-emerald-600">
                Storage URL saved successfully
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}