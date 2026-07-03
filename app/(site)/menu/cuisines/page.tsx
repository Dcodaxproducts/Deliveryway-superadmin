"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Edit2, Layers3, Plus, Search, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import Container from "@/components/container";
import Header from "@/components/header";
import TableSkeleton from "@/components/skeleton/table-skeleton";
import { DataTable } from "@/components/custom/data-table";
import DeleteDialog from "@/components/dialogs/delete-dialog";
import { PremiumImageDropzone } from "@/components/forms/PremiumImageDropzone";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TableCell, TableHead } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from "@/hooks/useDebounce";
import { useFileUpload } from "@/hooks/useFileUpload";
import {
  useCreateCuisine,
  useDeleteCuisine,
  useGetCuisines,
  useUpdateCuisine,
} from "@/hooks/useCuisine";
import { getImageUrl } from "@/utils/getImageUrl";
import { createCuisineSchema, type CuisineFormValues } from "@/validations/cuisine";
import type { Cuisine, CuisinePayload } from "@/types/cuisine";

type StatusFilter = "active" | "all" | "inactive";
type FormMode = "create" | "edit";

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  const apiError = error as ApiError;
  return apiError.response?.data?.message || fallback;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const toCuisinePayload = (values: CuisineFormValues): CuisinePayload => ({
  name: values.name.trim(),
  slug: values.slug.trim(),
  description: values.description?.trim() || undefined,
  imageUrl: values.imageUrl?.trim() || undefined,
  isActive: Boolean(values.isActive),
});


export default function CuisinesPage() {
  const common = useTranslations("common");
  const cuisinesText = useTranslations("cuisines");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [selectedCuisine, setSelectedCuisine] = useState<Cuisine | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Cuisine | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const debouncedSearch = useDebounce(search, 500);
  const listParams = useMemo(
    () => ({
      page,
      limit: 10,
      search: debouncedSearch || undefined,
      sortBy: "createdAt",
      sortOrder: "DESC" as const,
      all: statusFilter === "all" ? true : undefined,
      inactive: statusFilter === "inactive" ? true : undefined,
      includeInactive: statusFilter === "all" ? true : undefined,
    }),
    [debouncedSearch, page, statusFilter]
  );

  const { data, isError, isLoading } = useGetCuisines(listParams);
  const deleteMutation = useDeleteCuisine();
  const cuisines = data?.data ?? [];

  const openCreate = () => {
    setFormMode("create");
    setSelectedCuisine(null);
    setFormOpen(true);
  };

  const openEdit = (cuisine: Cuisine) => {
    setFormMode("edit");
    setSelectedCuisine(cuisine);
    setFormOpen(true);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;

    setDeleteError("");
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
      },
      onError: (error) => {
        setDeleteError(getApiErrorMessage(error, cuisinesText("deleteBlocked")));
      },
    });
  };


  return (
    <Container>
      <Header title={cuisinesText("title")} description={cuisinesText("description")} />

      <section className="space-y-[24px] rounded-[14px] bg-white p-4 lg:p-[30px]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid gap-3 md:grid-cols-[minmax(260px,1fr)_220px] xl:min-w-[560px]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder={cuisinesText("searchPlaceholder")}
                className="pl-10"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value as StatusFilter);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{cuisinesText("activeOnly")}</SelectItem>
                <SelectItem value="all">{cuisinesText("allCuisines")}</SelectItem>
                <SelectItem value="inactive">{cuisinesText("inactiveOnly")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button type="button" variant="primary" onClick={openCreate}>
              <Plus size={16} />
              {cuisinesText("addCuisine")}
            </Button>
          </div>
        </div>

        {isError ? (
          <Alert variant="destructive">
            <AlertDescription>{cuisinesText("loadError")}</AlertDescription>
          </Alert>
        ) : isLoading ? (
          <TableSkeleton cols={6} rows={8} />
        ) : (
          <DataTable
            data={cuisines}
            headers={
              <>
                <TableHead>{cuisinesText("image")}</TableHead>
                <TableHead>{cuisinesText("name")}</TableHead>
                <TableHead>{cuisinesText("descriptionLabel")}</TableHead>
                <TableHead>{cuisinesText("items")}</TableHead>
                <TableHead className="text-center">{common("status")}</TableHead>
                <TableHead className="text-center">{common("actions")}</TableHead>
              </>
            }
            row={(cuisine) => (
              <>
                <TableCell>
                  <CuisineImage cuisine={cuisine} />
                </TableCell>
                <TableCell>
                  <div className="font-semibold text-dark">{cuisine.name}</div>
                </TableCell>
                <TableCell>
                  <p className="line-clamp-2 max-w-[360px] text-sm leading-5 text-gray">
                    {cuisine.description || common("notAvailable")}
                  </p>
                </TableCell>
                <TableCell>
                  <Badge className="rounded-[8px] bg-primary/10 px-2.5 py-1 text-primary">
                    {cuisine._count?.itemLinks ?? 0}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    className={
                      cuisine.isActive
                        ? "rounded-[8px] bg-green/10 px-2.5 py-1 text-green"
                        : "rounded-[8px] bg-gray-200 px-2.5 py-1 text-gray-600"
                    }
                  >
                    {cuisine.isActive ? common("active") : common("inactive")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-3 text-[#A3A3A3]">
                    <button
                      type="button"
                      className="cursor-pointer transition-colors hover:text-dark"
                      onClick={() => openEdit(cuisine)}
                      aria-label={common("edit")}
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      type="button"
                      className="cursor-pointer transition-colors hover:text-primary"
                      onClick={() => {
                        setDeleteError("");
                        setDeleteTarget(cuisine);
                      }}
                      aria-label={common("delete")}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </TableCell>
              </>
            )}
            pagination={data?.meta ? { ...data.meta, onPageChange: setPage } : undefined}
          />
        )}
      </section>

      <CuisineFormDialog
        mode={formMode}
        cuisine={selectedCuisine}
        open={formOpen}
        onOpenChange={setFormOpen}
      />


      <DeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            setDeleteError("");
          }
        }}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
        title={cuisinesText("deleteTitle")}
        description={deleteError || cuisinesText("deleteDescription", { name: deleteTarget?.name ?? "" })}
      />
    </Container>
  );
}

function CuisineImage({ cuisine }: { cuisine: Cuisine }) {
  const src = getImageUrl(cuisine.imageUrl || null);

  if (!src) {
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Layers3 size={18} />
      </div>
    );
  }

  return (
    <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
      <Image src={src} alt={cuisine.name} fill sizes="48px" unoptimized className="object-cover" />
    </div>
  );
}

function CuisineFormDialog({
  mode,
  cuisine,
  open,
  onOpenChange,
}: {
  mode: FormMode;
  cuisine: Cuisine | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const common = useTranslations("common");
  const cuisinesText = useTranslations("cuisines");
  const validation = useTranslations("validation");
  const schema = createCuisineSchema({ required: validation("required") });
  const createMutation = useCreateCuisine();
  const updateMutation = useUpdateCuisine();
  const { uploadFile, uploading, progress } = useFileUpload();
  const [previewBlob, setPreviewBlob] = useState("");
  const mutationPending = createMutation.isPending || updateMutation.isPending;

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<CuisineFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      imageUrl: "",
      isActive: true,
    },
  });

  const imageUrl = watch("imageUrl");
  const isActive = watch("isActive");
  const name = watch("name");
  const preview = previewBlob || imageUrl;

  useEffect(() => {
    if (!open) return;

    reset({
      name: cuisine?.name ?? "",
      slug: cuisine?.slug ?? "",
      description: cuisine?.description ?? "",
      imageUrl: cuisine?.imageUrl ?? "",
      isActive: cuisine?.isActive ?? true,
    });
    setPreviewBlob("");
  }, [cuisine, open, reset]);

  useEffect(() => {
    return () => {
      if (previewBlob.startsWith("blob:")) URL.revokeObjectURL(previewBlob);
    };
  }, [previewBlob]);

  const handleImageChange = async (file: File) => {
    if (previewBlob.startsWith("blob:")) URL.revokeObjectURL(previewBlob);
    const blobUrl = URL.createObjectURL(file);
    setPreviewBlob(blobUrl);

    const fileUrl = await uploadFile(file);
    if (fileUrl) {
      setValue("imageUrl", fileUrl, { shouldDirty: true, shouldValidate: true });
    }
  };

  const handleRemoveImage = () => {
    if (previewBlob.startsWith("blob:")) URL.revokeObjectURL(previewBlob);
    setPreviewBlob("");
    setValue("imageUrl", "", { shouldDirty: true, shouldValidate: true });
  };

  const submit = (values: CuisineFormValues) => {
    const payload = toCuisinePayload(values);
    const callbacks = {
      onSuccess: () => onOpenChange(false),
    };

    if (mode === "edit" && cuisine) {
      updateMutation.mutate({ id: cuisine.id, data: payload }, callbacks);
    } else {
      createMutation.mutate(payload, callbacks);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-none bg-[#F5F5F5] p-6 shadow-lg sm:max-w-[720px] lg:p-[40px]">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? cuisinesText("editCuisine") : cuisinesText("createCuisine")}</DialogTitle>
          <DialogDescription>{cuisinesText("formDescription")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="mt-[28px] space-y-6 rounded-[14px] bg-white p-5 lg:p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <FormField label={`${cuisinesText("name")} *`} error={errors.name?.message}>
              <Input
                {...register("name")}
                placeholder={cuisinesText("namePlaceholder")}
                onBlur={() => {
                  if (!watch("slug") && name) {
                    setValue("slug", slugify(name), { shouldDirty: true, shouldValidate: true });
                  }
                }}
              />
            </FormField>

            <FormField label={`${cuisinesText("slug")} *`} error={errors.slug?.message}>
              <Input {...register("slug")} placeholder={cuisinesText("slugPlaceholder")} />
            </FormField>
          </div>

          <FormField label={cuisinesText("descriptionLabel")} error={errors.description?.message}>
            <Textarea {...register("description")} placeholder={cuisinesText("descriptionPlaceholder")} />
          </FormField>

          <div className="grid gap-5 md:grid-cols-[1fr_180px]">
            <FormField label={cuisinesText("imageUrl")} error={errors.imageUrl?.message}>
              <PremiumImageDropzone
                alt={cuisinesText("imageSelected")}
                emptyHint={cuisinesText("uploadImageHint")}
                emptyTitle={cuisinesText("uploadImage")}
                onFileSelect={handleImageChange}
                onRemove={handleRemoveImage}
                preview={preview}
                progress={progress}
                selectedText={cuisinesText("imageSelected")}
                uploading={uploading}
                uploadText={cuisinesText("uploadingImage")}
                variant="card"
              />
              <Input type="hidden" {...register("imageUrl")} />
            </FormField>

            <div className="space-y-5">
              <div className="rounded-[14px] border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                <Label className="mb-3 block">{common("status")}</Label>
                <label className="flex items-center justify-between gap-3 text-sm text-gray">
                  <span>{isActive ? common("active") : common("inactive")}</span>
                  <Switch
                    checked={isActive}
                    onCheckedChange={(checked) => setValue("isActive", checked, { shouldDirty: true })}
                  />
                </label>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutationPending}>
              {common("cancel")}
            </Button>
            <Button type="submit" variant="primary" disabled={mutationPending || uploading}>
              {mutationPending ? common("saving") : mode === "edit" ? common("update") : common("create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


function FormField({
  children,
  error,
  label,
}: {
  children: React.ReactNode;
  error?: string;
  label: string;
}) {
  return (
    <div className="space-y-[6px]">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  );
}
