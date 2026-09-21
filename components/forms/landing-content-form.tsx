"use client";

import {
  ArrowDown,
  ArrowUp,
  Building2,
  FileText,
  Languages,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  ReceiptText,
  Save,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { LandingRichTextEditor } from "@/components/forms/landing-rich-text-editor";
import { PremiumImageDropzone } from "@/components/forms/PremiumImageDropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  useLandingPageSettings,
  useUpdateLandingPageSettings,
} from "@/hooks/useLandingPageSettings";
import { useFileUpload } from "@/hooks/useFileUpload";
import type {
  LandingHomeSettings,
  GlobalLegalProfile,
  LandingPageFaq,
  LandingPageHero,
  LandingPagePages,
  LandingPageSettings,
} from "@/services/globalSettings";
import { getRestaurants } from "@/services/restaurant";

type PageKey = keyof LandingPagePages;
type Language = "en" | "de";
type RestaurantChoice = { id: string; name: string };
type ManagedImageKey =
  "logo" | "hero" | "growth" | "orderManagement" | "appDownload";

const PAGE_KEYS: PageKey[] = [
  "services",
  "pricing",
  "about",
  "privacyPolicy",
  "support",
  "termsOfService",
  "contact",
];

const RICH_TEXT_PAGE_KEYS = new Set<PageKey>([
  "about",
  "privacyPolicy",
  "support",
  "termsOfService",
]);

const EMPTY_GLOBAL_LEGAL_PROFILE: GlobalLegalProfile = {
  ownerName: null,
  legalBusinessName: null,
  taxNumber: null,
  businessAddress: {
    street: null,
    shopNumber: null,
    postalCode: null,
    city: null,
    country: null,
  },
  contractText: null,
};

export function LandingContentForm() {
  const t = useTranslations("landingContent");
  const { data, isLoading, isError } = useLandingPageSettings();
  const { mutate, isPending } = useUpdateLandingPageSettings();
  const { uploadFile, uploading, progress } = useFileUpload();
  const [draft, setDraft] = useState<LandingPageSettings | null>(null);
  const [uploadingImage, setUploadingImage] = useState<ManagedImageKey | null>(
    null,
  );
  const [activePage, setActivePage] = useState<PageKey>("about");
  const [language, setLanguage] = useState<Language>("de");
  const [restaurantChoices, setRestaurantChoices] = useState<
    RestaurantChoice[]
  >([]);

  useEffect(() => {
    if (data) {
      setDraft({
        ...data,
        legalProfile: data.legalProfile ?? EMPTY_GLOBAL_LEGAL_PROFILE,
      });
    }
  }, [data]);

  useEffect(() => {
    void getRestaurants({ page: 1, limit: 100 })
      .then((response: unknown) => {
        const record =
          response && typeof response === "object"
            ? (response as Record<string, unknown>)
            : {};
        const items = Array.isArray(record.data)
          ? record.data
          : Array.isArray(response)
            ? response
            : [];
        setRestaurantChoices(
          items
            .filter(
              (item): item is Record<string, unknown> =>
                Boolean(item) && typeof item === "object",
            )
            .map((item) => ({
              id: String(item.id ?? ""),
              name: String(item.name ?? item.restaurantName ?? item.id ?? ""),
            }))
            .filter((item) => item.id),
        );
      })
      .catch(() => setRestaurantChoices([]));
  }, []);

  if (isError) {
    return (
      <div className="rounded-[18px] border border-red-200 bg-red-50 p-6 text-sm font-medium text-red-700">
        {t("loadFailed")}
      </div>
    );
  }

  if (isLoading || !draft) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-[18px] border border-[#EAECF0] bg-white">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  const page = draft.pages[activePage];
  const heroSuffix = language === "de" ? "De" : "En";
  const eyebrowKey = `eyebrow${heroSuffix}` as keyof LandingPageHero;
  const headingKey = `heading${heroSuffix}` as keyof LandingPageHero;
  const subheadingKey = `subheading${heroSuffix}` as keyof LandingPageHero;
  const contentKey = language === "de" ? "contentDe" : "contentEn";
  const hasInvalidFaq = draft.faqs.some(
    (faq) =>
      !faq.questionEn.trim() ||
      !faq.answerEn.trim() ||
      !faq.questionDe.trim() ||
      !faq.answerDe.trim(),
  );

  const updateHero = (key: keyof LandingPageHero, value: string) => {
    setDraft((current) => {
      if (!current) return current;
      return {
        ...current,
        pages: {
          ...current.pages,
          [activePage]: {
            ...current.pages[activePage],
            hero: {
              ...current.pages[activePage].hero,
              [key]: value,
            },
          },
        },
      };
    });
  };

  const updatePageContent = (value: string) => {
    setDraft((current) => {
      if (!current) return current;
      return {
        ...current,
        pages: {
          ...current.pages,
          [activePage]: {
            ...current.pages[activePage],
            [contentKey]: value,
          },
        },
      };
    });
  };

  const updateContact = (
    key: "supportEmail" | "supportPhone" | "address",
    value: string,
  ) => {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  };

  const updateManagedImage = (
    key: ManagedImageKey,
    imageUrl: string | null,
  ) => {
    setDraft((current) => {
      if (!current) return current;
      if (key === "logo") return { ...current, logoUrl: imageUrl };
      if (key === "hero") {
        return {
          ...current,
          home: {
            ...current.home,
            hero: { ...current.home.hero, imageUrl },
          },
        };
      }
      if (key === "appDownload") {
        return {
          ...current,
          home: {
            ...current.home,
            appDownload: {
              ...current.home.appDownload,
              backgroundImageUrl: imageUrl,
            },
          },
        };
      }
      return {
        ...current,
        home: {
          ...current.home,
          [key]: { ...current.home[key], imageUrl },
        },
      };
    });
  };

  const uploadManagedImage = async (key: ManagedImageKey, file: File) => {
    setUploadingImage(key);
    try {
      const imageUrl = await uploadFile(file);
      if (imageUrl) updateManagedImage(key, imageUrl);
    } finally {
      setUploadingImage(null);
    }
  };

  const updateFaq = (
    id: string,
    updates: Partial<Omit<LandingPageFaq, "id">>,
  ) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            faqs: current.faqs.map((faq) =>
              faq.id === id ? { ...faq, ...updates } : faq,
            ),
          }
        : current,
    );
  };

  const addFaq = () => {
    setDraft((current) => {
      if (!current) return current;
      const index = current.faqs.length;
      return {
        ...current,
        faqs: [
          ...current.faqs,
          {
            id: `faq-${Date.now()}-${index}`,
            questionEn: "",
            answerEn: "",
            questionDe: "",
            answerDe: "",
            isActive: true,
            sortOrder: index,
          },
        ],
      };
    });
  };

  const removeFaq = (id: string) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            faqs: current.faqs
              .filter((faq) => faq.id !== id)
              .map((faq, index) => ({ ...faq, sortOrder: index })),
          }
        : current,
    );
  };

  const moveFaq = (id: string, direction: -1 | 1) => {
    setDraft((current) => {
      if (!current) return current;
      const faqs = [...current.faqs];
      const currentIndex = faqs.findIndex((faq) => faq.id === id);
      const nextIndex = currentIndex + direction;
      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= faqs.length) {
        return current;
      }

      [faqs[currentIndex], faqs[nextIndex]] = [
        faqs[nextIndex],
        faqs[currentIndex],
      ];
      return {
        ...current,
        faqs: faqs.map((faq, index) => ({ ...faq, sortOrder: index })),
      };
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[18px] border border-[#EAECF0] bg-white p-5 shadow-sm lg:p-7">
        <div>
          <h2 className="text-lg font-semibold text-dark">
            {t("brandAndFooter")}
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray">
            {t("brandAndFooterDescription")}
          </p>
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[280px_1fr]">
          <PremiumImageDropzone
            alt={t("businessLogo")}
            emptyTitle={t("uploadImage")}
            emptyHint={t("uploadImageHint")}
            selectedText={t("imageSelected")}
            uploadText={t("uploadingImage")}
            removeLabel={t("removeImage")}
            preview={draft.logoUrl ?? undefined}
            uploading={uploading && uploadingImage === "logo"}
            progress={progress}
            variant="logo"
            onFileSelect={(file) => void uploadManagedImage("logo", file)}
            onRemove={() => updateManagedImage("logo", null)}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <ContentInput
              label={t("businessName")}
              value={draft.businessName}
              onChange={(businessName) =>
                setDraft((current) =>
                  current ? { ...current, businessName } : current,
                )
              }
              maxLength={200}
            />
            <ContentInput
              label={t("copyrightText")}
              value={draft.copyrightText}
              onChange={(copyrightText) =>
                setDraft((current) =>
                  current ? { ...current, copyrightText } : current,
                )
              }
              maxLength={300}
            />
            <div className="md:col-span-2">
              <Label>{t("footerDescription")}</Label>
              <Textarea
                value={draft.footerDescription ?? ""}
                onChange={(event) =>
                  setDraft((current) =>
                    current
                      ? { ...current, footerDescription: event.target.value }
                      : current,
                  )
                }
                rows={3}
                className="mt-2"
              />
            </div>
            {(["facebook", "twitter", "instagram", "youtube"] as const).map(
              (network) => (
                <ContentInput
                  key={network}
                  label={t(`social.${network}`)}
                  value={draft.socialLinks[network] ?? ""}
                  onChange={(value) =>
                    setDraft((current) =>
                      current
                        ? {
                            ...current,
                            socialLinks: {
                              ...current.socialLinks,
                              [network]: value || null,
                            },
                          }
                        : current,
                    )
                  }
                  maxLength={1000}
                />
              ),
            )}
          </div>
        </div>
      </section>

      <HomepageSettingsEditor
        home={draft.home}
        language={language}
        onLanguageChange={setLanguage}
        restaurantChoices={restaurantChoices}
        onChange={(home) =>
          setDraft((current) => (current ? { ...current, home } : current))
        }
        uploading={uploading}
        uploadingImage={uploadingImage}
        progress={progress}
        onImageUpload={uploadManagedImage}
        onImageRemove={(key) => updateManagedImage(key, null)}
      />

      <GlobalLegalProfileEditor
        profile={draft.legalProfile}
        disabled={isPending}
        onChange={(legalProfile) =>
          setDraft((current) =>
            current ? { ...current, legalProfile } : current,
          )
        }
      />

      <section className="overflow-hidden rounded-[18px] border border-[#EAECF0] bg-white shadow-sm">
        <div className="border-b border-[#EAECF0] bg-[linear-gradient(135deg,#fff7f7_0%,#ffffff_52%,#f8fafc_100%)] p-5 lg:p-7">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-[14px] bg-primary text-white shadow-[0_12px_28px_rgba(220,38,38,0.22)]">
              <FileText className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-dark">
                {t("pageContent")}
              </h2>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-gray">
                {t("pageContentDescription")}
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 lg:p-7">
          <div className="flex flex-wrap gap-2">
            {PAGE_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setActivePage(key)}
                className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                  activePage === key
                    ? "bg-primary text-white shadow-sm"
                    : "border border-[#EAECF0] bg-[#F8FAFC] text-[#475467] hover:border-primary/30 hover:text-dark"
                }`}
              >
                {t(`pages.${key}`)}
              </button>
            ))}
          </div>

          <div className="mt-6 flex w-fit items-center gap-1 rounded-[12px] border border-[#EAECF0] bg-[#F8FAFC] p-1">
            <Languages className="ml-2 size-4 text-[#667085]" />
            {(["de", "en"] as const).map((locale) => (
              <button
                key={locale}
                type="button"
                onClick={() => setLanguage(locale)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  language === locale
                    ? "bg-white text-dark shadow-sm"
                    : "text-[#667085]"
                }`}
              >
                {t(`languages.${locale}`)}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-5 rounded-[16px] border border-[#EAECF0] bg-[#FCFCFD] p-5 md:grid-cols-2">
            <ContentInput
              label={t("eyebrow")}
              value={page.hero[eyebrowKey] ?? ""}
              onChange={(value) => updateHero(eyebrowKey, value)}
              maxLength={100}
            />
            <ContentInput
              label={t("heading")}
              value={page.hero[headingKey] ?? ""}
              onChange={(value) => updateHero(headingKey, value)}
              maxLength={200}
            />
            <div className="md:col-span-2">
              <Label>{t("subheading")}</Label>
              <Textarea
                value={page.hero[subheadingKey] ?? ""}
                onChange={(event) =>
                  updateHero(subheadingKey, event.target.value)
                }
                maxLength={500}
                rows={3}
                className="mt-2 resize-y rounded-[12px] border-[#D0D5DD] bg-white"
              />
            </div>
          </div>

          {RICH_TEXT_PAGE_KEYS.has(activePage) ? (
            <div className="mt-6">
              <div className="mb-3">
                <Label>{t("richTextBody")}</Label>
                <p className="mt-1 text-sm text-gray">
                  {t("richTextDescription")}
                </p>
              </div>
              <LandingRichTextEditor
                value={page[contentKey] ?? ""}
                onChange={updatePageContent}
                placeholder={t("richTextPlaceholder")}
                disabled={isPending}
              />
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-[18px] border border-[#EAECF0] bg-white p-5 shadow-sm lg:p-7">
        <div>
          <h2 className="text-lg font-semibold text-dark">
            {t("contactDetails")}
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray">
            {t("contactDetailsDescription")}
          </p>
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <ContactInput
            icon={Mail}
            label={t("supportEmail")}
            value={draft.supportEmail ?? ""}
            onChange={(value) => updateContact("supportEmail", value)}
          />
          <ContactInput
            icon={Phone}
            label={t("supportPhone")}
            value={draft.supportPhone ?? ""}
            onChange={(value) => updateContact("supportPhone", value)}
          />
          <div className="md:col-span-2">
            <ContactInput
              icon={MapPin}
              label={t("address")}
              value={draft.address ?? ""}
              onChange={(value) => updateContact("address", value)}
            />
          </div>
        </div>
      </section>

      <section className="rounded-[18px] border border-[#EAECF0] bg-white p-5 shadow-sm lg:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-dark">{t("faqs")}</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-gray">
              {t("faqsDescription")}
            </p>
          </div>
          <Button type="button" variant="outline" onClick={addFaq}>
            <Plus className="size-4" />
            {t("addFaq")}
          </Button>
        </div>

        <div className="mt-5 space-y-4">
          {draft.faqs.length === 0 ? (
            <div className="rounded-[14px] border border-dashed border-[#D0D5DD] bg-[#F8FAFC] px-5 py-10 text-center text-sm text-gray">
              {t("noFaqs")}
            </div>
          ) : (
            draft.faqs.map((faq, index) => (
              <div
                key={faq.id}
                className="rounded-[16px] border border-[#EAECF0] bg-[#F8FAFC] p-4"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-dark shadow-sm">
                      {t("faqNumber", { number: index + 1 })}
                    </span>
                    <Switch
                      checked={faq.isActive}
                      onCheckedChange={(isActive) =>
                        updateFaq(faq.id, { isActive })
                      }
                    />
                    <span className="text-sm text-gray">
                      {faq.isActive ? t("active") : t("inactive")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <IconButton
                      label={t("moveUp")}
                      disabled={index === 0}
                      onClick={() => moveFaq(faq.id, -1)}
                      icon={ArrowUp}
                    />
                    <IconButton
                      label={t("moveDown")}
                      disabled={index === draft.faqs.length - 1}
                      onClick={() => moveFaq(faq.id, 1)}
                      icon={ArrowDown}
                    />
                    <IconButton
                      label={t("removeFaq")}
                      onClick={() => removeFaq(faq.id)}
                      icon={Trash2}
                      danger
                    />
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <FaqLanguageFields
                    language={t("languages.en")}
                    question={faq.questionEn}
                    answer={faq.answerEn}
                    questionLabel={t("question")}
                    answerLabel={t("answer")}
                    onQuestionChange={(questionEn) =>
                      updateFaq(faq.id, { questionEn })
                    }
                    onAnswerChange={(answerEn) =>
                      updateFaq(faq.id, { answerEn })
                    }
                  />
                  <FaqLanguageFields
                    language={t("languages.de")}
                    question={faq.questionDe}
                    answer={faq.answerDe}
                    questionLabel={t("question")}
                    answerLabel={t("answer")}
                    onQuestionChange={(questionDe) =>
                      updateFaq(faq.id, { questionDe })
                    }
                    onAnswerChange={(answerDe) =>
                      updateFaq(faq.id, { answerDe })
                    }
                  />
                </div>
              </div>
            ))
          )}
        </div>
        {hasInvalidFaq ? (
          <p className="mt-3 text-sm font-medium text-red-600">
            {t("faqRequired")}
          </p>
        ) : null}
      </section>

      <div className="sticky bottom-4 z-20 flex justify-end">
        <Button
          type="button"
          variant="primary"
          disabled={isPending || uploading || hasInvalidFaq}
          onClick={() => mutate(draft)}
          className="h-12 min-w-44 rounded-[12px] px-7 shadow-[0_16px_34px_rgba(220,38,38,0.24)]"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {isPending ? t("saving") : t("save")}
        </Button>
      </div>
    </div>
  );
}

function GlobalLegalProfileEditor({
  profile,
  disabled,
  onChange,
}: {
  profile: GlobalLegalProfile;
  disabled: boolean;
  onChange: (profile: GlobalLegalProfile) => void;
}) {
  const t = useTranslations("landingContent");
  const updateField = (
    key: "ownerName" | "legalBusinessName" | "taxNumber",
    value: string,
  ) => onChange({ ...profile, [key]: value || null });
  const updateAddress = (
    key: keyof GlobalLegalProfile["businessAddress"],
    value: string,
  ) =>
    onChange({
      ...profile,
      businessAddress: {
        ...profile.businessAddress,
        [key]: value || null,
      },
    });

  return (
    <section className="overflow-hidden rounded-[18px] border border-[#EAECF0] bg-white shadow-sm">
      <div className="border-b border-[#EAECF0] bg-[linear-gradient(135deg,#fff7f7_0%,#ffffff_52%,#f8fafc_100%)] p-5 lg:p-7">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-[14px] bg-primary text-white shadow-[0_12px_28px_rgba(220,38,38,0.22)]">
            <ReceiptText className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-dark">
              {t("globalLegalTitle")}
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-gray">
              {t("globalLegalDescription")}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-5 lg:p-7">
        <div className="grid gap-4 md:grid-cols-3">
          <ContentInput
            label={t("legalOwnerName")}
            value={profile.ownerName ?? ""}
            onChange={(value) => updateField("ownerName", value)}
            maxLength={300}
          />
          <ContentInput
            label={t("legalBusinessName")}
            value={profile.legalBusinessName ?? ""}
            onChange={(value) => updateField("legalBusinessName", value)}
            maxLength={300}
          />
          <ContentInput
            label={t("legalTaxNumber")}
            value={profile.taxNumber ?? ""}
            onChange={(value) => updateField("taxNumber", value)}
            maxLength={200}
          />
        </div>

        <div className="rounded-[16px] border border-[#EAECF0] bg-[#FCFCFD] p-5">
          <div className="flex items-center gap-3">
            <Building2 className="size-5 text-primary" />
            <h3 className="font-semibold text-dark">{t("legalAddress")}</h3>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {(
              [
                ["street", "legalStreet"],
                ["shopNumber", "legalShopNumber"],
                ["postalCode", "legalPostalCode"],
                ["city", "legalCity"],
                ["country", "legalCountry"],
              ] as const
            ).map(([key, label]) => (
              <ContentInput
                key={key}
                label={t(label)}
                value={profile.businessAddress[key] ?? ""}
                onChange={(value) => updateAddress(key, value)}
                maxLength={key === "street" ? 300 : 200}
              />
            ))}
          </div>
        </div>

        <div>
          <Label>{t("globalLegalText")}</Label>
          <p className="mb-3 mt-1 text-sm text-gray">
            {t("globalLegalTextDescription")}
          </p>
          <LandingRichTextEditor
            value={profile.contractText ?? ""}
            onChange={(contractText) =>
              onChange({ ...profile, contractText: contractText || null })
            }
            placeholder={t("globalLegalTextPlaceholder")}
            disabled={disabled}
          />
        </div>
      </div>
    </section>
  );
}

function HomepageSettingsEditor({
  home,
  language,
  onLanguageChange,
  restaurantChoices,
  onChange,
  uploading,
  uploadingImage,
  progress,
  onImageUpload,
  onImageRemove,
}: {
  home: LandingHomeSettings;
  language: Language;
  onLanguageChange: (language: Language) => void;
  restaurantChoices: RestaurantChoice[];
  onChange: (home: LandingHomeSettings) => void;
  uploading: boolean;
  uploadingImage: ManagedImageKey | null;
  progress: number;
  onImageUpload: (key: ManagedImageKey, file: File) => Promise<void>;
  onImageRemove: (key: ManagedImageKey) => void;
}) {
  const t = useTranslations("landingContent");
  const suffix = language === "de" ? "De" : "En";
  const headingKey = `heading${suffix}` as "headingEn" | "headingDe";
  const descriptionKey = `description${suffix}` as
    "descriptionEn" | "descriptionDe";
  const checklistKey = `checklist${suffix}` as "checklistEn" | "checklistDe";
  const updateBlock = (
    key: "growth" | "orderManagement",
    updates: Partial<LandingHomeSettings[typeof key]>,
  ) => onChange({ ...home, [key]: { ...home[key], ...updates } });

  return (
    <section className="rounded-[18px] border border-[#EAECF0] bg-white p-5 shadow-sm lg:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-dark">
            {t("homepageTitle")}
          </h2>
          <p className="mt-1 text-sm text-gray">{t("homepageDescription")}</p>
        </div>
        <div className="flex items-center gap-1 rounded-[12px] border border-[#EAECF0] bg-[#F8FAFC] p-1">
          {(["de", "en"] as const).map((locale) => (
            <button
              key={locale}
              type="button"
              onClick={() => onLanguageChange(locale)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                language === locale
                  ? "bg-white text-dark shadow-sm"
                  : "text-gray"
              }`}
            >
              {t(`languages.${locale}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <HomePanel title={t("heroTitle")}>
          <div className="grid gap-4 md:grid-cols-2">
            <ContentInput
              label={t("badge")}
              value={home.hero[`badge${suffix}`] ?? ""}
              onChange={(value) =>
                onChange({
                  ...home,
                  hero: { ...home.hero, [`badge${suffix}`]: value },
                })
              }
              maxLength={100}
            />
            <ContentInput
              label={t("heading")}
              value={home.hero[headingKey] ?? ""}
              onChange={(value) =>
                onChange({
                  ...home,
                  hero: { ...home.hero, [headingKey]: value },
                })
              }
              maxLength={250}
            />
            <ContentInput
              label={t("subheading")}
              value={home.hero[`subheading${suffix}`] ?? ""}
              onChange={(value) =>
                onChange({
                  ...home,
                  hero: { ...home.hero, [`subheading${suffix}`]: value },
                })
              }
              maxLength={600}
            />
            <ManagedImageDropzone
              label={t("heroImage")}
              preview={home.hero.imageUrl}
              imageKey="hero"
              uploading={uploading}
              uploadingImage={uploadingImage}
              progress={progress}
              onImageUpload={onImageUpload}
              onImageRemove={onImageRemove}
            />
            <ContentInput
              label={t("primaryButtonLabel")}
              value={home.hero[`primaryCta${suffix}`] ?? ""}
              onChange={(value) =>
                onChange({
                  ...home,
                  hero: { ...home.hero, [`primaryCta${suffix}`]: value },
                })
              }
              maxLength={100}
            />
            <ContentInput
              label={t("primaryButtonUrl")}
              value={home.hero.primaryCtaUrl ?? ""}
              onChange={(primaryCtaUrl) =>
                onChange({ ...home, hero: { ...home.hero, primaryCtaUrl } })
              }
              maxLength={1000}
            />
            <ContentInput
              label={t("secondaryButtonLabel")}
              value={home.hero[`secondaryCta${suffix}`] ?? ""}
              onChange={(value) =>
                onChange({
                  ...home,
                  hero: { ...home.hero, [`secondaryCta${suffix}`]: value },
                })
              }
              maxLength={100}
            />
            <ContentInput
              label={t("secondaryButtonUrl")}
              value={home.hero.secondaryCtaUrl ?? ""}
              onChange={(secondaryCtaUrl) =>
                onChange({ ...home, hero: { ...home.hero, secondaryCtaUrl } })
              }
              maxLength={1000}
            />
          </div>
        </HomePanel>

        <HomePanel title={t("featuredRestaurantsTitle")}>
          <div className="grid gap-4 md:grid-cols-2">
            <ContentInput
              label={t("sectionHeading")}
              value={home.featuredRestaurants[headingKey] ?? ""}
              onChange={(value) =>
                onChange({
                  ...home,
                  featuredRestaurants: {
                    ...home.featuredRestaurants,
                    [headingKey]: value,
                  },
                })
              }
              maxLength={250}
            />
            <label className="flex items-center gap-3 text-sm font-medium">
              <Switch
                checked={home.featuredRestaurants.isVisible}
                onCheckedChange={(isVisible) =>
                  onChange({
                    ...home,
                    featuredRestaurants: {
                      ...home.featuredRestaurants,
                      isVisible,
                    },
                  })
                }
              />
              {t("showSection")}
            </label>
          </div>
          <Label className="mt-4 block">{t("restaurants")}</Label>
          <select
            multiple
            value={home.featuredRestaurants.restaurantIds}
            onChange={(event) =>
              onChange({
                ...home,
                featuredRestaurants: {
                  ...home.featuredRestaurants,
                  restaurantIds: Array.from(
                    event.currentTarget.selectedOptions,
                    (option) => option.value,
                  ),
                },
              })
            }
            className="mt-2 min-h-40 w-full rounded-[12px] border border-[#D0D5DD] bg-white p-3 text-sm"
          >
            {restaurantChoices.map((restaurant) => (
              <option key={restaurant.id} value={restaurant.id}>
                {restaurant.name}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-gray">{t("multiSelectHint")}</p>
        </HomePanel>

        {(["growth", "orderManagement"] as const).map((key) => (
          <HomePanel
            key={key}
            title={
              key === "growth"
                ? t("growthSectionTitle")
                : t("orderManagementSectionTitle")
            }
          >
            <div className="grid gap-4 md:grid-cols-2">
              <ContentInput
                label={t("heading")}
                value={home[key][headingKey] ?? ""}
                onChange={(value) => updateBlock(key, { [headingKey]: value })}
                maxLength={250}
              />
              <ManagedImageDropzone
                label={t("sectionImage")}
                preview={home[key].imageUrl}
                imageKey={key}
                uploading={uploading}
                uploadingImage={uploadingImage}
                progress={progress}
                onImageUpload={onImageUpload}
                onImageRemove={onImageRemove}
              />
              <div>
                <Label>{t("sectionDescription")}</Label>
                <Textarea
                  value={home[key][descriptionKey] ?? ""}
                  onChange={(event) =>
                    updateBlock(key, { [descriptionKey]: event.target.value })
                  }
                  rows={4}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>{t("checklist")}</Label>
                <Textarea
                  value={home[key][checklistKey].join("\n")}
                  onChange={(event) =>
                    updateBlock(key, {
                      [checklistKey]: event.target.value
                        .split("\n")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    })
                  }
                  rows={4}
                  className="mt-2"
                />
              </div>
            </div>
            <label className="mt-4 flex items-center gap-3 text-sm font-medium">
              <Switch
                checked={home[key].isVisible}
                onCheckedChange={(isVisible) => updateBlock(key, { isVisible })}
              />
              {t("showSection")}
            </label>
          </HomePanel>
        ))}

        <HomePanel title={t("appDownloadSectionTitle")}>
          <div className="grid gap-4 md:grid-cols-2">
            <ContentInput
              label={t("heading")}
              value={home.appDownload[headingKey] ?? ""}
              onChange={(value) =>
                onChange({
                  ...home,
                  appDownload: { ...home.appDownload, [headingKey]: value },
                })
              }
              maxLength={250}
            />
            <ManagedImageDropzone
              label={t("backgroundImage")}
              preview={home.appDownload.backgroundImageUrl}
              imageKey="appDownload"
              uploading={uploading}
              uploadingImage={uploadingImage}
              progress={progress}
              onImageUpload={onImageUpload}
              onImageRemove={onImageRemove}
            />
            <ContentInput
              label={t("sectionDescription")}
              value={home.appDownload[descriptionKey] ?? ""}
              onChange={(value) =>
                onChange({
                  ...home,
                  appDownload: {
                    ...home.appDownload,
                    [descriptionKey]: value,
                  },
                })
              }
              maxLength={600}
            />
            <ContentInput
              label={t("googlePlayUrl")}
              value={home.appDownload.googlePlayUrl ?? ""}
              onChange={(googlePlayUrl) =>
                onChange({
                  ...home,
                  appDownload: { ...home.appDownload, googlePlayUrl },
                })
              }
              maxLength={1000}
            />
            <ContentInput
              label={t("appStoreUrl")}
              value={home.appDownload.appStoreUrl ?? ""}
              onChange={(appStoreUrl) =>
                onChange({
                  ...home,
                  appDownload: { ...home.appDownload, appStoreUrl },
                })
              }
              maxLength={1000}
            />
          </div>
          <label className="mt-4 flex items-center gap-3 text-sm font-medium">
            <Switch
              checked={home.appDownload.isVisible}
              onCheckedChange={(isVisible) =>
                onChange({
                  ...home,
                  appDownload: { ...home.appDownload, isVisible },
                })
              }
            />
            {t("showSection")}
          </label>
        </HomePanel>
      </div>
    </section>
  );
}

function ManagedImageDropzone({
  label,
  preview,
  imageKey,
  uploading,
  uploadingImage,
  progress,
  onImageUpload,
  onImageRemove,
}: {
  label: string;
  preview: string | null;
  imageKey: ManagedImageKey;
  uploading: boolean;
  uploadingImage: ManagedImageKey | null;
  progress: number;
  onImageUpload: (key: ManagedImageKey, file: File) => Promise<void>;
  onImageRemove: (key: ManagedImageKey) => void;
}) {
  const t = useTranslations("landingContent");

  return (
    <div>
      <Label>{label}</Label>
      <PremiumImageDropzone
        alt={label}
        className="mt-2"
        emptyTitle={t("uploadImage")}
        emptyHint={t("uploadImageHint")}
        selectedText={t("imageSelected")}
        uploadText={t("uploadingImage")}
        removeLabel={t("removeImage")}
        preview={preview ?? undefined}
        uploading={uploading && uploadingImage === imageKey}
        progress={progress}
        variant="cover"
        onFileSelect={(file) => void onImageUpload(imageKey, file)}
        onRemove={() => onImageRemove(imageKey)}
      />
    </div>
  );
}

function HomePanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[16px] border border-[#EAECF0] bg-[#FCFCFD] p-5">
      <h3 className="mb-4 font-semibold text-dark">{title}</h3>
      {children}
    </div>
  );
}

function ContentInput({
  label,
  value,
  onChange,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={maxLength}
        className="mt-2 h-11 rounded-[12px] border-[#D0D5DD] bg-white"
      />
    </div>
  );
}

function ContactInput({
  icon: Icon,
  label,
  value,
  onChange,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="relative mt-2">
        <Icon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#98A2B3]" />
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 rounded-[12px] border-[#D0D5DD] pl-10"
        />
      </div>
    </div>
  );
}

function FaqLanguageFields({
  language,
  question,
  answer,
  questionLabel,
  answerLabel,
  onQuestionChange,
  onAnswerChange,
}: {
  language: string;
  question: string;
  answer: string;
  questionLabel: string;
  answerLabel: string;
  onQuestionChange: (value: string) => void;
  onAnswerChange: (value: string) => void;
}) {
  return (
    <div className="space-y-3 rounded-[14px] border border-[#EAECF0] bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
        {language}
      </p>
      <div>
        <Label>{questionLabel}</Label>
        <Input
          value={question}
          onChange={(event) => onQuestionChange(event.target.value)}
          maxLength={500}
          className="mt-2 rounded-[12px] border-[#D0D5DD]"
        />
      </div>
      <div>
        <Label>{answerLabel}</Label>
        <Textarea
          value={answer}
          onChange={(event) => onAnswerChange(event.target.value)}
          maxLength={5000}
          rows={4}
          className="mt-2 resize-y rounded-[12px] border-[#D0D5DD]"
        />
      </div>
    </div>
  );
}

function IconButton({
  label,
  icon: Icon,
  onClick,
  disabled = false,
  danger = false,
}: {
  label: string;
  icon: typeof ArrowUp;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex size-9 items-center justify-center rounded-lg transition disabled:opacity-30 ${
        danger
          ? "text-red-600 hover:bg-red-50"
          : "text-[#667085] hover:bg-white hover:text-dark"
      }`}
    >
      <Icon className="size-4" />
    </button>
  );
}
