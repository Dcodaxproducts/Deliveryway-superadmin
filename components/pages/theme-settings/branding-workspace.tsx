"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Check, ImageIcon, Palette, RotateCcw, Save, Type } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { useTranslations } from "next-intl";

import { PremiumImageDropzone } from "@/components/forms/PremiumImageDropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFileUpload } from "@/hooks/useFileUpload";
import {
  useGetRestaurant,
  useGetRestaurants,
  useUpdateRestaurantBranding,
} from "@/hooks/useRestaurant";
import { getStorageViewUrl } from "@/services/storage";
import type { Restaurant } from "@/types/restaurant";

type AssetKey = "logoUrl" | "coverImage" | "faviconUrl";

type BrandingDraft = {
  logoUrl: string;
  coverImage: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  headingFontFamily: string;
  fontFamily: string;
  borderRadius: string;
};

const DEFAULT_DRAFT: BrandingDraft = {
  logoUrl: "",
  coverImage: "",
  faviconUrl: "",
  primaryColor: "#CE181B",
  secondaryColor: "#FDEEE9",
  accentColor: "#FF9F0D",
  backgroundColor: "#FFFFFF",
  textColor: "#171717",
  headingFontFamily: "Arial",
  fontFamily: "Arial",
  borderRadius: "0.75rem",
};

const FONT_OPTIONS = [
  "Arial",
  "Georgia",
  "Inter",
  "Manrope",
  "Poppins",
  "Verdana",
];
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const readString = (
  source: Record<string, unknown>,
  key: string,
  fallback: string,
) =>
  typeof source[key] === "string" && source[key]
    ? String(source[key])
    : fallback;

const readNestedRecord = (source: Record<string, unknown>, key: string) =>
  isRecord(source[key]) ? source[key] : {};

const createDraft = (restaurant?: Restaurant): BrandingDraft => {
  if (!restaurant) return DEFAULT_DRAFT;

  const branding = isRecord(restaurant.branding) ? restaurant.branding : {};
  const theme = readNestedRecord(branding, "theme");
  const assets = readNestedRecord(branding, "assets");

  return {
    logoUrl: restaurant.logoUrl ?? readString(assets, "logoUrl", ""),
    coverImage:
      restaurant.coverImage ?? readString(assets, "heroBannerUrl", ""),
    faviconUrl: readString(
      assets,
      "faviconUrl",
      readString(branding, "faviconUrl", ""),
    ),
    primaryColor: readString(
      theme,
      "primaryColor",
      readString(branding, "primaryColor", DEFAULT_DRAFT.primaryColor),
    ),
    secondaryColor: readString(
      theme,
      "secondaryColor",
      readString(branding, "secondaryColor", DEFAULT_DRAFT.secondaryColor),
    ),
    accentColor: readString(
      theme,
      "accentColor",
      readString(branding, "accentColor", DEFAULT_DRAFT.accentColor),
    ),
    backgroundColor: readString(
      theme,
      "backgroundColor",
      readString(branding, "backgroundColor", DEFAULT_DRAFT.backgroundColor),
    ),
    textColor: readString(
      theme,
      "textColor",
      readString(branding, "textColor", DEFAULT_DRAFT.textColor),
    ),
    headingFontFamily: readString(
      theme,
      "headingFontFamily",
      readString(
        branding,
        "headingFontFamily",
        DEFAULT_DRAFT.headingFontFamily,
      ),
    ),
    fontFamily: readString(
      theme,
      "fontFamily",
      readString(branding, "fontFamily", DEFAULT_DRAFT.fontFamily),
    ),
    borderRadius: readString(
      theme,
      "borderRadius",
      readString(branding, "borderRadius", DEFAULT_DRAFT.borderRadius),
    ),
  };
};

const resolvePreview = async (value: string) =>
  value ? getStorageViewUrl(value) : "";

export default function BrandingWorkspace() {
  const t = useTranslations("themeSettings");
  const common = useTranslations("common");
  const restaurantsQuery = useGetRestaurants({
    limit: 100,
    includeInactive: false,
  });
  const restaurants = useMemo(
    () => (restaurantsQuery.data?.data ?? []) as Restaurant[],
    [restaurantsQuery.data?.data],
  );
  const [restaurantId, setRestaurantId] = useState("");
  const restaurantQuery = useGetRestaurant(restaurantId);
  const updateBranding = useUpdateRestaurantBranding();
  const { uploadFile, uploading, progress } = useFileUpload();
  const [uploadingAsset, setUploadingAsset] = useState<AssetKey | null>(null);
  const [savedDraft, setSavedDraft] = useState(DEFAULT_DRAFT);
  const [draft, setDraft] = useState(DEFAULT_DRAFT);
  const [previews, setPreviews] = useState<Record<AssetKey, string>>({
    logoUrl: "",
    coverImage: "",
    faviconUrl: "",
  });

  useEffect(() => {
    if (!restaurantId && restaurants[0]?.id) {
      setRestaurantId(restaurants[0].id);
    }
  }, [restaurantId, restaurants]);

  useEffect(() => {
    if (!restaurantQuery.data) return;

    const nextDraft = createDraft(restaurantQuery.data);
    setSavedDraft(nextDraft);
    setDraft(nextDraft);

    let active = true;
    void Promise.all([
      resolvePreview(nextDraft.logoUrl),
      resolvePreview(nextDraft.coverImage),
      resolvePreview(nextDraft.faviconUrl),
    ]).then(([logoUrl, coverImage, faviconUrl]) => {
      if (active) setPreviews({ logoUrl, coverImage, faviconUrl });
    });

    return () => {
      active = false;
    };
  }, [restaurantQuery.data]);

  const hasInvalidColor = [
    draft.primaryColor,
    draft.secondaryColor,
    draft.accentColor,
    draft.backgroundColor,
    draft.textColor,
  ].some((color) => !HEX_COLOR.test(color));
  const isDirty = JSON.stringify(draft) !== JSON.stringify(savedDraft);

  const updateDraft = <Key extends keyof BrandingDraft>(
    key: Key,
    value: BrandingDraft[Key],
  ) => setDraft((current) => ({ ...current, [key]: value }));

  const restoreSavedDraft = () => {
    setDraft(savedDraft);
    void Promise.all([
      resolvePreview(savedDraft.logoUrl),
      resolvePreview(savedDraft.coverImage),
      resolvePreview(savedDraft.faviconUrl),
    ]).then(([logoUrl, coverImage, faviconUrl]) => {
      setPreviews({ logoUrl, coverImage, faviconUrl });
    });
  };

  const uploadAsset = async (asset: AssetKey, file: File) => {
    setUploadingAsset(asset);
    try {
      const fileUrl = await uploadFile(file);
      if (!fileUrl) return;
      updateDraft(asset, fileUrl);
      const preview = await resolvePreview(fileUrl);
      setPreviews((current) => ({
        ...current,
        [asset]: preview,
      }));
    } finally {
      setUploadingAsset(null);
    }
  };

  const removeAsset = (asset: AssetKey) => {
    updateDraft(asset, "");
    setPreviews((current) => ({ ...current, [asset]: "" }));
  };

  const handleSave = () => {
    const restaurant = restaurantQuery.data;
    if (!restaurant || hasInvalidColor) return;

    const currentBranding = isRecord(restaurant.branding)
      ? restaurant.branding
      : {};
    const currentTheme = readNestedRecord(currentBranding, "theme");
    const currentAssets = readNestedRecord(currentBranding, "assets");
    const currentLogos = readNestedRecord(currentAssets, "logos");
    const currentLogo = readNestedRecord(currentBranding, "logo");

    updateBranding.mutate(
      {
        id: restaurant.id,
        data: {
          logoUrl: draft.logoUrl,
          coverImage: draft.coverImage,
          branding: {
            ...currentBranding,
            primaryColor: draft.primaryColor,
            secondaryColor: draft.secondaryColor,
            accentColor: draft.accentColor,
            backgroundColor: draft.backgroundColor,
            textColor: draft.textColor,
            fontFamily: draft.fontFamily,
            headingFontFamily: draft.headingFontFamily,
            borderRadius: draft.borderRadius,
            radius: draft.borderRadius,
            faviconUrl: draft.faviconUrl,
            theme: {
              ...currentTheme,
              primaryColor: draft.primaryColor,
              secondaryColor: draft.secondaryColor,
              accentColor: draft.accentColor,
              backgroundColor: draft.backgroundColor,
              textColor: draft.textColor,
              fontFamily: draft.fontFamily,
              headingFontFamily: draft.headingFontFamily,
              borderRadius: draft.borderRadius,
              radius: draft.borderRadius,
            },
            assets: {
              ...currentAssets,
              logoUrl: draft.logoUrl,
              coverImage: draft.coverImage,
              heroBannerUrl: draft.coverImage,
              faviconUrl: draft.faviconUrl,
              logos: {
                ...currentLogos,
                primaryLogoUrl: draft.logoUrl,
                faviconUrl: draft.faviconUrl,
              },
            },
            logo: {
              ...currentLogo,
              light: draft.logoUrl,
              dark: draft.logoUrl,
              default: draft.logoUrl,
            },
          },
        },
      },
      { onSuccess: () => setSavedDraft(draft) },
    );
  };

  const previewTextColor = HEX_COLOR.test(draft.textColor)
    ? draft.textColor
    : DEFAULT_DRAFT.textColor;
  const previewBackground = HEX_COLOR.test(draft.backgroundColor)
    ? draft.backgroundColor
    : DEFAULT_DRAFT.backgroundColor;
  const previewPrimary = HEX_COLOR.test(draft.primaryColor)
    ? draft.primaryColor
    : DEFAULT_DRAFT.primaryColor;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 lg:p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-2xl">
            <Label
              htmlFor="branding-restaurant"
              className="text-base font-semibold"
            >
              {t("chooseRestaurantTitle")}
            </Label>
            <p className="mt-1 text-sm text-gray">
              {t("chooseRestaurantDescription")}
            </p>
            <Select value={restaurantId} onValueChange={setRestaurantId}>
              <SelectTrigger
                id="branding-restaurant"
                className="mt-3 h-12 w-full max-w-xl rounded-xl"
              >
                <SelectValue placeholder={t("selectRestaurant")} />
              </SelectTrigger>
              <SelectContent>
                {restaurants.map((restaurant) => (
                  <SelectItem key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {restaurantsQuery.isLoading ? (
              <p className="mt-2 text-sm text-gray">
                {t("loadingRestaurants")}
              </p>
            ) : null}
            {!restaurantsQuery.isLoading && restaurants.length === 0 ? (
              <p className="mt-2 text-sm text-gray">{t("noRestaurants")}</p>
            ) : null}
          </div>
          {isDirty ? (
            <span className="inline-flex w-fit items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
              <span className="size-2 rounded-full bg-amber-500" />
              {t("unsaved")}
            </span>
          ) : null}
        </div>
      </section>

      {restaurantQuery.isError ? (
        <div className="rounded-2xl bg-red-50 p-5 text-sm text-red-700">
          {t("loadFailed")}
        </div>
      ) : null}

      {!restaurantId ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray">
          {t("selectFirst")}
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.72fr)]">
          <div className="space-y-6">
            <SettingsPanel
              icon={ImageIcon}
              title={t("brandAssets")}
              description={t("assetsDescription")}
            >
              <div className="grid gap-5 md:grid-cols-2">
                <AssetUploader
                  title={t("logo")}
                  hint={t("logoHint")}
                  preview={previews.logoUrl}
                  progress={uploadingAsset === "logoUrl" ? progress : 0}
                  uploading={uploading && uploadingAsset === "logoUrl"}
                  onSelect={(file) => void uploadAsset("logoUrl", file)}
                  onRemove={() => removeAsset("logoUrl")}
                />
                <AssetUploader
                  title={t("favicon")}
                  hint={t("faviconHint")}
                  preview={previews.faviconUrl}
                  progress={uploadingAsset === "faviconUrl" ? progress : 0}
                  uploading={uploading && uploadingAsset === "faviconUrl"}
                  onSelect={(file) => void uploadAsset("faviconUrl", file)}
                  onRemove={() => removeAsset("faviconUrl")}
                  compact
                />
                <div className="md:col-span-2">
                  <AssetUploader
                    title={t("cover")}
                    hint={t("coverHint")}
                    preview={previews.coverImage}
                    progress={uploadingAsset === "coverImage" ? progress : 0}
                    uploading={uploading && uploadingAsset === "coverImage"}
                    onSelect={(file) => void uploadAsset("coverImage", file)}
                    onRemove={() => removeAsset("coverImage")}
                    wide
                  />
                </div>
              </div>
            </SettingsPanel>

            <SettingsPanel
              icon={Palette}
              title={t("colorScheme")}
              description={t("paletteDescription")}
            >
              <div className="grid gap-5 md:grid-cols-2">
                <ColorField
                  label={t("primaryBrandColor")}
                  value={draft.primaryColor}
                  onChange={(value) => updateDraft("primaryColor", value)}
                />
                <ColorField
                  label={t("secondaryColor")}
                  value={draft.secondaryColor}
                  onChange={(value) => updateDraft("secondaryColor", value)}
                />
                <ColorField
                  label={t("accentColor")}
                  value={draft.accentColor}
                  onChange={(value) => updateDraft("accentColor", value)}
                />
                <ColorField
                  label={t("backgroundColor")}
                  value={draft.backgroundColor}
                  onChange={(value) => updateDraft("backgroundColor", value)}
                />
                <ColorField
                  label={t("textColor")}
                  value={draft.textColor}
                  onChange={(value) => updateDraft("textColor", value)}
                />
              </div>
              {hasInvalidColor ? (
                <p className="mt-4 text-sm text-red-600">{t("invalidColor")}</p>
              ) : null}
            </SettingsPanel>

            <SettingsPanel
              icon={Type}
              title={t("typography")}
              description={t("typographyDescription")}
            >
              <div className="grid gap-5 md:grid-cols-3">
                <SelectField
                  label={t("headingFont")}
                  value={draft.headingFontFamily}
                  options={FONT_OPTIONS}
                  onChange={(value) => updateDraft("headingFontFamily", value)}
                />
                <SelectField
                  label={t("bodyFont")}
                  value={draft.fontFamily}
                  options={FONT_OPTIONS}
                  onChange={(value) => updateDraft("fontFamily", value)}
                />
                <SelectField
                  label={t("cornerStyle")}
                  value={draft.borderRadius}
                  options={["0.25rem", "0.75rem", "1.25rem"]}
                  optionLabels={[
                    t("cornerSquare"),
                    t("cornerSoft"),
                    t("cornerRounded"),
                  ]}
                  onChange={(value) => updateDraft("borderRadius", value)}
                />
              </div>
            </SettingsPanel>
          </div>

          <aside className="xl:sticky xl:top-24 xl:self-start">
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
              <div className="border-b border-gray-100 px-5 py-4">
                <h2 className="font-semibold text-dark">{t("livePreview")}</h2>
                <p className="mt-1 text-sm text-gray">
                  {t("previewDescriptionShort")}
                </p>
              </div>
              <div
                style={{
                  backgroundColor: previewBackground,
                  color: previewTextColor,
                  fontFamily: draft.fontFamily,
                }}
              >
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  {previews.coverImage ? (
                    <img
                      src={previews.coverImage}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                  <div className="absolute inset-x-5 bottom-5 flex items-end gap-3">
                    <div className="flex size-14 items-center justify-center overflow-hidden rounded-xl bg-white shadow">
                      {previews.logoUrl ? (
                        <img
                          src={previews.logoUrl}
                          alt=""
                          className="size-full object-contain"
                        />
                      ) : (
                        <ImageIcon className="text-gray-400" />
                      )}
                    </div>
                    <div className="min-w-0 text-white">
                      <p
                        className="truncate text-xl font-semibold"
                        style={{ fontFamily: draft.headingFontFamily }}
                      >
                        {restaurantQuery.data?.name ?? t("previewTitle")}
                      </p>
                      <p className="text-sm text-white/80">
                        {restaurantQuery.data?.tagline ||
                          t("previewDescriptionShort")}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-5 p-5">
                  <div className="grid grid-cols-3 gap-2">
                    {[t("featured"), t("new"), t("popular")].map(
                      (label, index) => (
                        <div
                          key={label}
                          className="h-20 p-3 text-xs font-semibold"
                          style={{
                            borderRadius: draft.borderRadius,
                            backgroundColor:
                              index === 0
                                ? draft.secondaryColor
                                : `${previewPrimary}12`,
                            color: previewTextColor,
                          }}
                        >
                          {label}
                        </div>
                      ),
                    )}
                  </div>
                  <div className="flex gap-3">
                    <span
                      className="flex h-11 flex-1 items-center justify-center px-4 text-sm font-semibold text-white"
                      style={{
                        backgroundColor: previewPrimary,
                        borderRadius: draft.borderRadius,
                      }}
                    >
                      {t("previewMenu")}
                    </span>
                    <span
                      className="flex h-11 flex-1 items-center justify-center border px-4 text-sm font-semibold"
                      style={{
                        borderColor: previewPrimary,
                        color: previewPrimary,
                        borderRadius: draft.borderRadius,
                      }}
                    >
                      {t("previewCart")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {restaurantId ? (
        <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-2xl bg-white/95 p-4 shadow-lg ring-1 ring-black/10 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray">{t("savedHint")}</p>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={!isDirty || updateBranding.isPending || uploading}
              onClick={restoreSavedDraft}
            >
              <RotateCcw size={16} /> {t("discard")}
            </Button>
            <Button
              type="button"
              disabled={
                !isDirty ||
                hasInvalidColor ||
                updateBranding.isPending ||
                uploading
              }
              onClick={handleSave}
            >
              {updateBranding.isPending ? (
                <Save size={16} className="animate-pulse" />
              ) : (
                <Check size={16} />
              )}
              {updateBranding.isPending ? t("saving") : t("save")}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SettingsPanel({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Palette;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 lg:p-6">
      <div className="mb-6 flex gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-primary">
          <Icon size={19} />
        </span>
        <div>
          <h2 className="font-semibold text-dark">{title}</h2>
          <p className="mt-1 text-sm text-gray">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function AssetUploader({
  title,
  hint,
  preview,
  progress,
  uploading,
  onSelect,
  onRemove,
  compact = false,
  wide = false,
}: {
  title: string;
  hint: string;
  preview: string;
  progress: number;
  uploading: boolean;
  onSelect: (file: File) => void;
  onRemove: () => void;
  compact?: boolean;
  wide?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div>
        <Label>{title}</Label>
        <p className="mt-1 text-xs leading-5 text-gray">{hint}</p>
      </div>
      <PremiumImageDropzone
        accept=".png,.jpg,.jpeg,.webp,.svg,.ico"
        alt={title}
        emptyHint={hint}
        emptyTitle={title}
        onFileSelect={onSelect}
        onRemove={onRemove}
        preview={preview}
        progress={progress}
        selectedText={title}
        uploading={uploading}
        variant={compact ? "logo" : wide ? "cover" : "card"}
      />
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <button
          type="button"
          aria-label={label}
          className="size-12 shrink-0 rounded-xl border border-gray-200 shadow-inner"
          style={{
            backgroundColor: HEX_COLOR.test(value) ? value : "transparent",
          }}
          onClick={() => setOpen((current) => !current)}
        />
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          className="h-12 font-mono uppercase"
          aria-invalid={!HEX_COLOR.test(value)}
        />
      </div>
      {open ? (
        <div className="relative z-30">
          <div className="absolute top-1 rounded-xl bg-white p-3 shadow-xl ring-1 ring-black/10">
            <HexColorPicker
              color={HEX_COLOR.test(value) ? value : DEFAULT_DRAFT.primaryColor}
              onChange={(color) => onChange(color.toUpperCase())}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  optionLabels,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  optionLabels?: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-12 rounded-xl">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option, index) => (
            <SelectItem key={option} value={option}>
              {optionLabels?.[index] ?? option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
