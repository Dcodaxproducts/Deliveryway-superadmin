"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Loader2, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreatePermissionModule,
  usePermissionModules,
  useUpdatePermissionModule,
} from "@/hooks/useRbac";
import type { PermissionModule } from "@/services/rbac";

type PermissionModuleForm = {
  id?: string;
  accessKey: string;
  name: string;
  description: string;
  defaultActions: string;
  sortOrder: string;
  isActive: boolean;
};

const defaultForm: PermissionModuleForm = {
  accessKey: "",
  name: "",
  description: "",
  defaultActions: "read,write",
  sortOrder: "0",
  isActive: true,
};

const toActions = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

const toForm = (module: PermissionModule): PermissionModuleForm => ({
  id: module.id,
  accessKey: module.accessKey,
  name: module.name,
  description: module.description || "",
  defaultActions: (module.defaultActions || []).join(","),
  sortOrder: String(module.sortOrder ?? 0),
  isActive: Boolean(module.isActive),
});

export function PermissionModulesDialog() {
  const rbac = useTranslations("rbac");
  const { data: modules = [], isLoading } = usePermissionModules({ limit: 100 });
  const createModule = useCreatePermissionModule();
  const updateModule = useUpdatePermissionModule();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<PermissionModuleForm>(defaultForm);

  useEffect(() => {
    if (!open) setForm(defaultForm);
  }, [open]);

  const editing = Boolean(form.id);
  const loading = createModule.isPending || updateModule.isPending;
  const submitDisabled = loading || !form.name.trim() || !toActions(form.defaultActions).length || (!editing && !form.accessKey.trim());

  const setField = <K extends keyof PermissionModuleForm>(key: K, value: PermissionModuleForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async () => {
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      defaultActions: toActions(form.defaultActions),
      sortOrder: Number(form.sortOrder) || 0,
      isActive: form.isActive,
    };

    if (editing && form.id) {
      await updateModule.mutateAsync({ id: form.id, payload });
    } else {
      await createModule.mutateAsync({
        ...payload,
        accessKey: form.accessKey.trim().toLowerCase(),
      });
    }
    setForm(defaultForm);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{rbac("managePermissionModules")}</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-none bg-[#F5F5F5] p-6 sm:max-w-[960px]">
        <DialogHeader>
          <DialogTitle>{rbac("permissionModules")}</DialogTitle>
          <DialogDescription>{rbac("permissionModulesDescription")}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[14px] bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-dark">
              {editing ? rbac("editPermissionModule") : rbac("createPermissionModule")}
            </h3>
            <div className="mt-4 grid gap-4">
              <Field label={rbac("accessKey")}>
                <Input
                  value={form.accessKey}
                  onChange={(event) => setField("accessKey", event.target.value)}
                  disabled={editing}
                  placeholder="kitchen-display"
                />
              </Field>
              <Field label={rbac("moduleName")}>
                <Input value={form.name} onChange={(event) => setField("name", event.target.value)} />
              </Field>
              <Field label={rbac("moduleDescription")}>
                <Input value={form.description} onChange={(event) => setField("description", event.target.value)} />
              </Field>
              <Field label={rbac("defaultActions")}>
                <Input value={form.defaultActions} onChange={(event) => setField("defaultActions", event.target.value)} placeholder="read,write,manage" />
              </Field>
              <Field label={rbac("sortOrder")}>
                <Input type="number" value={form.sortOrder} onChange={(event) => setField("sortOrder", event.target.value)} />
              </Field>
              <label className="flex items-center gap-2 text-sm text-dark">
                <input type="checkbox" checked={form.isActive} onChange={(event) => setField("isActive", event.target.checked)} className="accent-primary" />
                {rbac("active")}
              </label>
            </div>
            <Button type="button" variant="primary" className="mt-5" disabled={submitDisabled} onClick={handleSubmit}>
              {loading ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Plus size={16} className="mr-2" />}
              {editing ? rbac("update") : rbac("create")}
            </Button>
          </div>

          <div className="rounded-[14px] bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-dark">{rbac("permissionModules")}</h3>
            <div className="mt-4 space-y-3">
              {isLoading ? (
                <p className="text-sm text-gray">{rbac("loadingPermissions")}</p>
              ) : modules.length === 0 ? (
                <p className="text-sm text-gray">{rbac("noPermissionModules")}</p>
              ) : modules.map((module) => (
                <button
                  key={module.id}
                  type="button"
                  onClick={() => setForm(toForm(module))}
                  className="w-full rounded-xl border border-gray-100 bg-gray-50 p-4 text-left transition hover:border-primary/30 hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-dark">{module.name}</p>
                      <p className="mt-1 text-xs text-gray">{module.accessKey} · {(module.defaultActions || []).join(", ")}</p>
                      {module.description ? <p className="mt-2 text-xs text-gray">{module.description}</p> : null}
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs ${module.isActive ? "bg-green/10 text-green" : "bg-gray-100 text-gray"}`}>
                      {module.isActive ? rbac("active") : rbac("inactive")}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <Label className="text-xs font-semibold text-gray">{label}</Label>
      <div className="mt-2">{children}</div>
    </div>
  );
}
