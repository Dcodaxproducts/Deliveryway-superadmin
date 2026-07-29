"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import Container from "@/components/container";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { changePassword } from "@/services/auth";

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

export default function ChangePasswordPage() {
  const t = useTranslations("changePassword");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const passwordsMatch = newPassword === confirmPassword;
  const canSubmit =
    currentPassword.length >= 8 &&
    newPassword.length >= 8 &&
    passwordsMatch;
  const mutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success(t("success"));
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message ?? t("error"));
    },
  });

  return (
    <Container>
      <Header title={t("title")} description={t("description")} />
      <form
        className="mt-6 max-w-xl space-y-5 rounded-[14px] border border-[#e9eaee] bg-white p-6"
        onSubmit={(event) => {
          event.preventDefault();
          if (!canSubmit) return;
          mutation.mutate({ currentPassword, newPassword });
        }}
      >
        <label className="block space-y-2">
          <Label htmlFor="current-password">{t("currentPassword")}</Label>
          <PasswordInput
            id="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            autoComplete="current-password"
          />
        </label>
        <label className="block space-y-2">
          <Label htmlFor="new-password">{t("newPassword")}</Label>
          <PasswordInput
            id="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            autoComplete="new-password"
          />
        </label>
        <label className="block space-y-2">
          <Label htmlFor="confirm-password">{t("confirmPassword")}</Label>
          <PasswordInput
            id="confirm-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
          />
          {confirmPassword && !passwordsMatch ? (
            <span className="text-xs text-red-600">{t("passwordMismatch")}</span>
          ) : null}
        </label>
        <p className="text-xs text-gray">{t("requirements")}</p>
        <Button type="submit" disabled={!canSubmit || mutation.isPending}>
          {mutation.isPending ? t("saving") : t("save")}
        </Button>
      </form>
    </Container>
  );
}
