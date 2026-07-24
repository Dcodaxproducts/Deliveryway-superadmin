"use client";

import {
  ArrowDown,
  ArrowUp,
  FileText,
  Languages,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { LandingRichTextEditor } from "@/components/forms/landing-rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  useLandingPageSettings,
  useUpdateLandingPageSettings,
} from "@/hooks/useLandingPageSettings";
import type {
  LandingPageFaq,
  LandingPageHero,
  LandingPagePages,
  LandingPageSettings,
} from "@/services/globalSettings";

type PageKey = keyof LandingPagePages;
type Language = "en" | "de";

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

export function LandingContentForm() {
  const t = useTranslations("landingContent");
  const { data, isLoading, isError } = useLandingPageSettings();
  const { mutate, isPending } = useUpdateLandingPageSettings();
  const [draft, setDraft] = useState<LandingPageSettings | null>(null);
  const [activePage, setActivePage] = useState<PageKey>("about");
  const [language, setLanguage] = useState<Language>("de");

  useEffect(() => {
    if (data) setDraft(data);
  }, [data]);

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
          disabled={isPending || hasInvalidFaq}
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
