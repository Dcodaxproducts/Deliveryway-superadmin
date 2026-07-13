"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Crosshair,
  Info,
  Loader2,
  MapPin,
  Maximize2,
  Plus,
  Search,
  Trash2,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  createRegisterTenantSchema,
  createUpdateTenantSchema,
} from "@/validations/tenants";
import { useRegisterTenant, useUpdateTenant } from "@/hooks/useTenants";
import { useGetPackagePlans } from "@/hooks/usePackagePlans";
import type { PackagePlan } from "@/services/packagePlans";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useRouter } from "next/navigation";
import { PremiumImageDropzone } from "@/components/forms/PremiumImageDropzone";

interface BusinessOwnerFormProps {
  mode?: "create" | "edit";
  tenantId?: string;
  initialData?: any;
}

declare global {
  interface Window {
    google?: any;
  }
}

type LatLngPoint = {
  lat: number;
  lng: number;
};

type DeliveryZonePayload = {
  name: string;
  deliveryFee: number;
  minOrderAmount: number;
  freeDeliveryThreshold: number;
  polygon: LatLngPoint[];
};

const GOOGLE_MAPS_SCRIPT_ID = "google-maps-places-script";
const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY";

const DEFAULT_MAP_CENTER: LatLngPoint = {
  lat: 33.6844,
  lng: 73.0479,
};

const isGoogleMapsKeyConfigured = () => {
  return (
    Boolean(GOOGLE_MAPS_API_KEY) &&
    GOOGLE_MAPS_API_KEY !== "YOUR_GOOGLE_MAPS_API_KEY"
  );
};

type DeliveryMode = "RADIUS" | "ZONE" | "POSTAL_CODE";
type UploadField =
  | "user.avatarUrl"
  | "tenant.logoUrl"
  | "restaurant.logoUrl"
  | "restaurant.coverImage"
  | "branch.logoUrl"
  | "branch.coverImage"
  | "logoUrl";

const DEFAULT_DELIVERY_CONFIG = {
  mode: "RADIUS" as DeliveryMode,
  radiusKm: 0,
  minOrderAmount: 0,
  deliveryFee: 0,
  isFreeDelivery: true,
  freeDeliveryThreshold: 0,
  zones: [],
  zoneBands: [],
  postalCodeRules: [],
};

const DEFAULT_BRANCH_SETTINGS = {
  deliveryTime: 45,
  tableReservationsEnabled: false,
  allowedOrderTypes: ["DELIVERY"],
  allowedPaymentMethods: ["COD"],
  deliveryConfig: DEFAULT_DELIVERY_CONFIG,
  automation: {
    autoAcceptOrders: true,
    estimatedPrepTime: 0,
  },
  taxation: {
    taxPercentage: 0,
  },
  contact: {
    whatsapp: "",
    phone: "",
  },
};

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizePlainObject = (value: any) => {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
};

const normalizeArray = (value: any) => {
  return Array.isArray(value) ? value : [];
};

type ListResponse<T> = {
  data?: T[] | { data?: T[]; items?: T[] };
  items?: T[];
};

const normalizeListResponse = <T,>(response: unknown): T[] => {
  if (Array.isArray(response)) return response as T[];
  if (!response || typeof response !== "object") return [];

  const record = response as ListResponse<T>;

  if (Array.isArray(record.data)) return record.data;
  if (Array.isArray(record.items)) return record.items;

  if (record.data && typeof record.data === "object") {
    if (Array.isArray(record.data.data)) return record.data.data;
    if (Array.isArray(record.data.items)) return record.data.items;
  }

  return [];
};

const normalizeDeliveryMode = (mode: any): DeliveryMode => {
  return mode === "ZONE" || mode === "POSTAL_CODE" ? mode : "RADIUS";
};

const compactObject = (obj: Record<string, any>) => {
  return Object.fromEntries(
    Object.entries(obj || {}).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        !(typeof value === "string" && value.trim() === "")
    )
  );
};

const normalizeLatLngPoint = (point: any): LatLngPoint | null => {
  const lat = toNumber(point?.lat, Number.NaN);
  const lng = toNumber(point?.lng, Number.NaN);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return { lat, lng };
};

const isValidLatLngPoint = (point: LatLngPoint | null): point is LatLngPoint => {
  return Boolean(point);
};

const toCoordinateString = (value: unknown) => {
  const number = toNumber(value, Number.NaN);
  return Number.isFinite(number) ? number.toFixed(6) : "";
};

const createPolygonAroundCenter = (center: LatLngPoint, radiusKm = 1) => {
  const safeRadiusKm = Math.max(0.3, Math.min(8, radiusKm));
  const latOffset = safeRadiusKm / 111;
  const lngOffset =
    safeRadiusKm /
    (111 * Math.max(0.2, Math.cos((center.lat * Math.PI) / 180)));

  return [
    {
      lat: Number((center.lat - latOffset).toFixed(6)),
      lng: Number((center.lng - lngOffset).toFixed(6)),
    },
    {
      lat: Number((center.lat + latOffset).toFixed(6)),
      lng: Number((center.lng - lngOffset).toFixed(6)),
    },
    {
      lat: Number((center.lat + latOffset).toFixed(6)),
      lng: Number((center.lng + lngOffset).toFixed(6)),
    },
    {
      lat: Number((center.lat - latOffset).toFixed(6)),
      lng: Number((center.lng + lngOffset).toFixed(6)),
    },
  ];
};

const normalizeDeliveryZones = (zones: any): DeliveryZonePayload[] => {
  return normalizeArray(zones)
    .map((zone: any) => ({
      name: String(zone?.name || "").trim(),
      deliveryFee: toNumber(zone?.deliveryFee, 0),
      minOrderAmount: toNumber(zone?.minOrderAmount, 0),
      freeDeliveryThreshold: toNumber(zone?.freeDeliveryThreshold, 0),
      polygon: normalizeArray(zone?.polygon)
        .map(normalizeLatLngPoint)
        .filter(isValidLatLngPoint),
    }))
    .filter((zone: any) => {
      return (
        zone.name ||
        zone.deliveryFee > 0 ||
        zone.minOrderAmount > 0 ||
        zone.freeDeliveryThreshold > 0 ||
        zone.polygon.length > 0
      );
    });
};

const normalizeZoneBands = (bands: any) => {
  return normalizeArray(bands)
    .map((band: any) => ({
      fromKm: toNumber(band?.fromKm, 0),
      toKm: toNumber(band?.toKm, 0),
      deliveryFee: toNumber(band?.deliveryFee, 0),
      minOrderAmount: toNumber(band?.minOrderAmount, 0),
      freeDeliveryThreshold: toNumber(band?.freeDeliveryThreshold, 0),
    }))
    .filter((band: any) => {
      return (
        band.fromKm > 0 ||
        band.toKm > 0 ||
        band.deliveryFee > 0 ||
        band.minOrderAmount > 0 ||
        band.freeDeliveryThreshold > 0
      );
    });
};

const normalizePostalCodeRules = (rules: any) => {
  return normalizeArray(rules)
    .map((rule: any) => ({
      postalCode: String(rule?.postalCode || "").trim(),
      deliveryFee: toNumber(rule?.deliveryFee, 0),
    }))
    .filter((rule: any) => rule.postalCode || rule.deliveryFee > 0);
};

const buildBranchSettingsPayload = (settings: any, includeServiceCharge = false) => {
  const deliveryConfig = normalizePlainObject(settings?.deliveryConfig);
  const automation = normalizePlainObject(settings?.automation);
  const taxation = normalizePlainObject(settings?.taxation);
  const serviceCharge = normalizePlainObject(settings?.serviceCharge);
  const contact = normalizePlainObject(settings?.contact);

  const payload: Record<string, any> = {
    deliveryTime: toNumber(settings?.deliveryTime, 45),
    tableReservationsEnabled: Boolean(settings?.tableReservationsEnabled ?? false),
    allowedOrderTypes: normalizeArray(settings?.allowedOrderTypes).length
      ? normalizeArray(settings.allowedOrderTypes)
      : ["DELIVERY"],
    allowedPaymentMethods: normalizeArray(settings?.allowedPaymentMethods).length
      ? normalizeArray(settings.allowedPaymentMethods)
      : ["COD"],
    deliveryConfig: {
      mode: normalizeDeliveryMode(deliveryConfig?.mode),
      radiusKm: toNumber(deliveryConfig?.radiusKm, 0),
      minOrderAmount: toNumber(deliveryConfig?.minOrderAmount, 0),
      deliveryFee: toNumber(deliveryConfig?.deliveryFee, 0),
      isFreeDelivery: Boolean(deliveryConfig?.isFreeDelivery ?? true),
      freeDeliveryThreshold: toNumber(deliveryConfig?.freeDeliveryThreshold, 0),
      zones: normalizeDeliveryZones(deliveryConfig?.zones),
      zoneBands: normalizeZoneBands(deliveryConfig?.zoneBands),
      postalCodeRules: normalizePostalCodeRules(deliveryConfig?.postalCodeRules),
    },
    automation: {
      autoAcceptOrders: Boolean(automation?.autoAcceptOrders ?? true),
      estimatedPrepTime: toNumber(automation?.estimatedPrepTime, 0),
    },
    taxation: {
      taxPercentage: toNumber(taxation?.taxPercentage, 0),
    },
    contact: {
      whatsapp: String(contact?.whatsapp || ""),
      phone: String(contact?.phone || ""),
    },
  };

  if (includeServiceCharge) {
    payload.serviceCharge = {
      isEnabled: Boolean(serviceCharge?.isEnabled ?? false),
      type: serviceCharge?.type === "AMOUNT" ? "AMOUNT" : "PERCENTAGE",
      value: toNumber(serviceCharge?.value, 0),
    };
  }

  return payload;
};

const createDefaultZone = () => ({
  name: "",
  deliveryFee: 0,
  minOrderAmount: 0,
  freeDeliveryThreshold: 0,
  polygon: [],
});

const createDefaultZoneBand = () => ({
  fromKm: 0,
  toKm: 0,
  deliveryFee: 0,
  minOrderAmount: 0,
  freeDeliveryThreshold: 0,
});

const createDefaultPostalRule = () => ({
  postalCode: "",
  deliveryFee: 0,
});

const createDefaultPolygonPoint = () => ({
  lat: 0,
  lng: 0,
});

export default function BusinessOwnerForm({
  mode = "create",
  tenantId,
  initialData,
}: BusinessOwnerFormProps) {
  const router = useRouter();
  const authLabel = useTranslations("auth");
  const common = useTranslations("common");
  const businessOwners = useTranslations("businessOwners");
  const branches = useTranslations("branches");
  const restaurants = useTranslations("restaurants");
  const validation = useTranslations("validation");
  const toasts = useTranslations("toasts");
  const { uploadFile, uploading, progress } = useFileUpload();
  const createMutation = useRegisterTenant();
  const updateMutation = useUpdateTenant();
  const packagePlansQuery = useGetPackagePlans({
    includeInactive: false,
    limit: 100,
    sortBy: "name",
    sortOrder: "ASC",
  });

  const isEdit = mode === "edit" && Boolean(tenantId);
  const isPending = isEdit ? updateMutation.isPending : createMutation.isPending;
  const registerTenantSchema = createRegisterTenantSchema(validation);
  const updateTenantSchema = createUpdateTenantSchema(validation);

  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [uploadingField, setUploadingField] = useState<UploadField | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<any>({
    resolver: zodResolver(isEdit ? updateTenantSchema : registerTenantSchema),
    defaultValues: {
      packagePlanId: "",
      user: {
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        avatarUrl: "",
        bio: "",
      },
      branchAdmin: {
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        phone: "",
      },
      tenant: {
        name: "",
        slug: "",
        logoUrl: "",
        bio: "",
        socialLinks: {
          website: "",
          facebook: "",
          instagram: "",
          linkedin: "",
        },
        settings: {},
      },
      restaurant: {
        name: "",
        slug: "",
        logoUrl: "",
        coverImage: "",
        customDomain: "",
        bio: "",
        tagline: "",
        supportContact: {
          email: "",
          whatsapp: "",
          phone: "",
        },
        branding: {
          primaryColor: "#FF0000",
          secondaryColor: "#000000",
          fontFamily: "Inter",
        },
        socialMedia: {
          facebook: "",
          instagram: "",
          tiktok: "",
          youtube: "",
        },
      },
      branch: {
        name: "",
        logoUrl: "",
        coverImage: "",
        description: "",
        settings: DEFAULT_BRANCH_SETTINGS,
        street: "",
        shopNumber: "",
        postalCode: "",
        area: "",
        city: "",
        state: "",
        country: "",
        lat: "",
        lng: "",
      },
      name: "",
      slug: "",
      bio: "",
      logoUrl: "",
      socialLinks: {},
      brandingConfig: {},
      settings: {},
      isActive: true,
    },
  });

  const tenantName = watch("tenant.name");
  const restaurantName = watch("restaurant.name");
  const ownerAvatar = watch("user.avatarUrl");
  const tenantLogo = watch("tenant.logoUrl");
  const restaurantLogo = watch("restaurant.logoUrl");
  const restaurantCover = watch("restaurant.coverImage");
  const branchLogo = watch("branch.logoUrl");
  const branchCover = watch("branch.coverImage");
  const deliveryMode = watch("branch.settings.deliveryConfig.mode") || "RADIUS";
  const branchLat = watch("branch.lat");
  const branchLng = watch("branch.lng");
  const zones = normalizeArray(watch("branch.settings.deliveryConfig.zones"));
  const zoneBands = normalizeArray(watch("branch.settings.deliveryConfig.zoneBands"));
  const postalCodeRules = normalizeArray(
    watch("branch.settings.deliveryConfig.postalCodeRules")
  );
  const packagePlans = useMemo(() => {
    return normalizeListResponse<PackagePlan>(packagePlansQuery.data).filter(
      (plan) => plan.id && plan.isActive !== false
    );
  }, [packagePlansQuery.data]);
  const uploadLabels = {
    preview: businessOwners("preview"),
    imageSelected: businessOwners("imageSelected"),
    clickToUpload: businessOwners("clickToUpload"),
    orDragDrop: businessOwners("orDragDrop"),
    uploadHint: businessOwners("uploadHint"),
    uploading: businessOwners("uploading"),
  };

  const [mapsReady, setMapsReady] = useState(false);
  const [mapsLoading, setMapsLoading] = useState(false);
  const [mapsError, setMapsError] = useState("");
  const [addressQuery, setAddressQuery] = useState("");
  const [selectedGoogleAddress, setSelectedGoogleAddress] = useState("");
  const [addressSearching, setAddressSearching] = useState(false);
  const [zoneSearch, setZoneSearch] = useState("");
  const [zoneSearchLabel, setZoneSearchLabel] = useState("");
  const [zoneSearching, setZoneSearching] = useState(false);
  const [selectedZoneCenter, setSelectedZoneCenter] = useState<LatLngPoint | null>(null);
  const [activeZoneIndex, setActiveZoneIndex] = useState(0);

  const addressAutocompleteRef = useRef<HTMLInputElement | null>(null);
  const addressAutocompleteInstanceRef = useRef<any>(null);
  const branchMapContainerRef = useRef<HTMLDivElement | null>(null);
  const branchMapRef = useRef<any>(null);
  const branchMarkerRef = useRef<any>(null);
  const zoneMapContainerRef = useRef<HTMLDivElement | null>(null);
  const zoneMapRef = useRef<any>(null);
  const zoneSearchInputRef = useRef<HTMLInputElement | null>(null);
  const zoneAutocompleteInstanceRef = useRef<any>(null);
  const zoneSearchMarkerRef = useRef<any>(null);
  const zonePolygonRef = useRef<any>(null);
  const zonePolygonMarkersRef = useRef<any[]>([]);

  const branchCoordinates = useMemo<LatLngPoint | null>(() => {
    const lat = toNumber(branchLat, Number.NaN);
    const lng = toNumber(branchLng, Number.NaN);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    return { lat, lng };
  }, [branchLat, branchLng]);

  const zoneMapCenter = selectedZoneCenter || branchCoordinates || DEFAULT_MAP_CENTER;

  const handleUpload = async (file: File, field: UploadField) => {
    if (!file) return;

    const blobUrl = URL.createObjectURL(file);
    setPreviews((prev) => ({ ...prev, [field]: blobUrl }));

    try {
      setUploadingField(field);
      const fileUrl = await uploadFile(file);

      if (fileUrl) {
        setValue(field, fileUrl, { shouldValidate: true });
        toast.success(toasts("imageUploaded"));
      }
    } finally {
      setUploadingField(null);
    }
  };

  useEffect(() => {
    return () => {
      Object.values(previews).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const getAddressComponent = (
    components: any[],
    types: string[],
    mode: "long_name" | "short_name" = "long_name"
  ) => {
    const component = components.find((item) =>
      types.some((type) => item.types?.includes(type))
    );

    return component?.[mode] || "";
  };

  const composeBranchAddress = (source: any) => {
    return [
      source?.shopNumber,
      source?.street,
      source?.area,
      source?.postalCode,
      source?.city,
      source?.state,
      source?.country,
    ]
      .filter(Boolean)
      .join(", ");
  };

  const setBranchCoordinates = (lat: number | string, lng: number | string) => {
    setValue("branch.lat", String(lat), { shouldValidate: true });
    setValue("branch.lng", String(lng), { shouldValidate: true });
  };

  const updateBranchMapMarker = (
    lat: number | string,
    lng: number | string,
    shouldCenter = true
  ) => {
    const nextLat = Number(lat);
    const nextLng = Number(lng);

    if (!Number.isFinite(nextLat) || !Number.isFinite(nextLng)) return;
    if (!window.google?.maps || !branchMapRef.current) return;

    const position = { lat: nextLat, lng: nextLng };

    if (!branchMarkerRef.current) {
      branchMarkerRef.current = new window.google.maps.Marker({
        position,
        map: branchMapRef.current,
        draggable: true,
        title: businessOwners("branchLocation"),
      });

      branchMarkerRef.current.addListener("dragend", () => {
        const markerPosition = branchMarkerRef.current?.getPosition?.();
        const markerLat = markerPosition?.lat?.();
        const markerLng = markerPosition?.lng?.();

        if (Number.isFinite(Number(markerLat)) && Number.isFinite(Number(markerLng))) {
          setBranchCoordinates(Number(markerLat).toFixed(6), Number(markerLng).toFixed(6));
          reverseGeocodeCoordinates(Number(markerLat), Number(markerLng));
        }
      });
    } else {
      branchMarkerRef.current.setPosition(position);
      branchMarkerRef.current.setMap(branchMapRef.current);
    }

    if (shouldCenter) {
      branchMapRef.current.panTo(position);
      branchMapRef.current.setZoom(16);
    }
  };

  const applyPlaceToBranchForm = (place: any) => {
    const components = Array.isArray(place?.address_components)
      ? place.address_components
      : [];

    const lat = place?.geometry?.location?.lat?.();
    const lng = place?.geometry?.location?.lng?.();
    const hasCoordinates = Number.isFinite(Number(lat)) && Number.isFinite(Number(lng));

    if (!components.length && !hasCoordinates) {
      setMapsError(businessOwners("maps.selectValidAddress"));
      return;
    }

    const streetNumber = getAddressComponent(components, ["street_number"]);
    const shopNumber =
      getAddressComponent(components, ["subpremise"]) ||
      getAddressComponent(components, ["premise"]) ||
      streetNumber;
    const route = getAddressComponent(components, ["route"]);
    const street = route.trim() || place?.name || "";

    const area =
      getAddressComponent(components, [
        "sublocality",
        "sublocality_level_1",
        "sublocality_level_2",
        "neighborhood",
        "premise",
      ]) || "";

    const city =
      getAddressComponent(components, ["locality"]) ||
      getAddressComponent(components, ["postal_town"]) ||
      getAddressComponent(components, ["administrative_area_level_2"]) ||
      "";

    const state =
      getAddressComponent(components, ["administrative_area_level_1"], "short_name") ||
      getAddressComponent(components, ["administrative_area_level_1"]) ||
      "";

    const country = getAddressComponent(components, ["country"]) || watch("branch.country") || "";
    const postalCode = getAddressComponent(components, ["postal_code"]);

    if (street) setValue("branch.street", street, { shouldValidate: true });
    if (shopNumber) setValue("branch.shopNumber", shopNumber, { shouldValidate: true });
    if (postalCode) setValue("branch.postalCode", postalCode, { shouldValidate: true });
    if (area) setValue("branch.area", area, { shouldValidate: true });
    if (city) setValue("branch.city", city, { shouldValidate: true });
    if (state) setValue("branch.state", state, { shouldValidate: true });
    if (country) setValue("branch.country", country, { shouldValidate: true });

    if (hasCoordinates) {
      setBranchCoordinates(Number(lat).toFixed(6), Number(lng).toFixed(6));
      updateBranchMapMarker(Number(lat), Number(lng));
    }

    const formattedAddress =
      place?.formatted_address ||
      composeBranchAddress({ shopNumber, street, area, postalCode, city, state, country }) ||
      "";

    setAddressQuery(formattedAddress);
    setSelectedGoogleAddress(formattedAddress);
    setMapsError("");
  };

  const reverseGeocodeCoordinates = (lat: number, lng: number) => {
    if (!window.google?.maps?.Geocoder) return;

    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ location: { lat, lng } }, (results: any, status: string) => {
      if (status === "OK" && results?.[0]) {
        applyPlaceToBranchForm(results[0]);
      }
    });
  };

  const handleAddressSearch = () => {
    const query = addressQuery.trim();

    if (!query) {
      setMapsError(businessOwners("maps.enterAddress"));
      return;
    }

    if (!window.google?.maps?.Geocoder) {
      setMapsError(businessOwners("maps.notReady"));
      return;
    }

    setAddressSearching(true);
    setMapsError("");

    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ address: query }, (results: any, status: string) => {
      if (status === "OK" && results?.[0]) {
        applyPlaceToBranchForm(results[0]);
      } else {
        setMapsError(businessOwners("maps.noAddressMatch"));
      }

      setAddressSearching(false);
    });
  };

  const handleAddressKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;

    event.preventDefault();
    handleAddressSearch();
  };

  const getZoneMapCenter = () => {
    const center = zoneMapRef.current?.getCenter?.();
    const lat = center?.lat?.();
    const lng = center?.lng?.();

    if (Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))) {
      return { lat: Number(lat), lng: Number(lng) };
    }

    return zoneMapCenter;
  };

  const updateZonePoint = (
    zoneIndex: number,
    pointIndex: number,
    key: "lat" | "lng",
    value: number | string
  ) => {
    const nextZones = zones.map((zone: any, currentZoneIndex: number) => {
      if (currentZoneIndex !== zoneIndex) return zone;

      return {
        ...zone,
        polygon: normalizeArray(zone?.polygon).map((point: any, currentPointIndex: number) =>
          currentPointIndex === pointIndex
            ? { ...point, [key]: Number(value) }
            : point
        ),
      };
    });

    setValue("branch.settings.deliveryConfig.zones", nextZones, {
      shouldValidate: true,
    });
  };

  const updateZonePointCoordinates = (
    zoneIndex: number,
    pointIndex: number,
    lat: number | string,
    lng: number | string
  ) => {
    const nextZones = zones.map((zone: any, currentZoneIndex: number) => {
      if (currentZoneIndex !== zoneIndex) return zone;

      return {
        ...zone,
        polygon: normalizeArray(zone?.polygon).map((point: any, currentPointIndex: number) =>
          currentPointIndex === pointIndex
            ? { ...point, lat: Number(lat), lng: Number(lng) }
            : point
        ),
      };
    });

    setValue("branch.settings.deliveryConfig.zones", nextZones, {
      shouldValidate: true,
    });
  };

  const addZonePointFromMap = (zoneIndex: number, point: LatLngPoint) => {
    const nextZones = zones.map((zone: any, currentZoneIndex: number) => {
      if (currentZoneIndex !== zoneIndex) return zone;

      return {
        ...zone,
        polygon: [...normalizeArray(zone?.polygon), point],
      };
    });

    setValue("branch.settings.deliveryConfig.zones", nextZones, {
      shouldValidate: true,
    });
  };

  const clearZoneMapOverlays = () => {
    if (zonePolygonRef.current) {
      zonePolygonRef.current.setMap(null);
      zonePolygonRef.current = null;
    }

    zonePolygonMarkersRef.current.forEach((marker) => marker.setMap(null));
    zonePolygonMarkersRef.current = [];
  };

  const renderZoneMapOverlay = () => {
    if (!window.google?.maps || !zoneMapRef.current) return;

    clearZoneMapOverlays();

    const activeZone = zones[activeZoneIndex];
    const points = normalizeArray(activeZone?.polygon)
      .map(normalizeLatLngPoint)
      .filter(isValidLatLngPoint);

    if (!points.length) {
      zoneMapRef.current.panTo(zoneMapCenter);
      zoneMapRef.current.setZoom(branchCoordinates || selectedZoneCenter ? 14 : 12);
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();

    points.forEach((point, pointIndex) => {
      bounds.extend(point);

      const marker = new window.google.maps.Marker({
        position: point,
        map: zoneMapRef.current,
        draggable: true,
        label: String(pointIndex + 1),
        title: `Point ${pointIndex + 1}`,
      });

      marker.addListener("dragend", () => {
        const position = marker.getPosition?.();
        const lat = position?.lat?.();
        const lng = position?.lng?.();

        if (Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))) {
          updateZonePointCoordinates(
            activeZoneIndex,
            pointIndex,
            Number(lat).toFixed(6),
            Number(lng).toFixed(6)
          );
        }
      });

      zonePolygonMarkersRef.current.push(marker);
    });

    if (points.length >= 3) {
      zonePolygonRef.current = new window.google.maps.Polygon({
        paths: points,
        map: zoneMapRef.current,
        fillColor: "#2563eb",
        fillOpacity: 0.12,
        strokeColor: "#2563eb",
        strokeOpacity: 0.85,
        strokeWeight: 2,
      });
    }

    zoneMapRef.current.fitBounds(bounds);
  };

  const applyZoneSearchPlace = (place: any) => {
    const lat = place?.geometry?.location?.lat?.();
    const lng = place?.geometry?.location?.lng?.();

    if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) {
      setMapsError(businessOwners("maps.noCoordinates"));
      return;
    }

    const center = {
      lat: Number(lat),
      lng: Number(lng),
    };

    setSelectedZoneCenter(center);
    setZoneSearch(place?.formatted_address || place?.name || zoneSearch);
    setZoneSearchLabel(place?.formatted_address || place?.name || zoneSearch);

    if (zoneMapRef.current) {
      zoneMapRef.current.panTo(center);
      zoneMapRef.current.setZoom(14);
    }

    if (window.google?.maps && zoneMapRef.current) {
      if (!zoneSearchMarkerRef.current) {
        zoneSearchMarkerRef.current = new window.google.maps.Marker({
          position: center,
          map: zoneMapRef.current,
          title: businessOwners("searchedAreaCenter"),
        });
      } else {
        zoneSearchMarkerRef.current.setPosition(center);
        zoneSearchMarkerRef.current.setMap(zoneMapRef.current);
      }
    }

    setMapsError("");
  };

  const handleZoneSearch = () => {
    const query = zoneSearch.trim();

    if (!query) {
      setMapsError(businessOwners("maps.enterArea"));
      return;
    }

    if (!window.google?.maps?.Geocoder) {
      setMapsError(businessOwners("maps.notReady"));
      return;
    }

    setZoneSearching(true);
    setMapsError("");

    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ address: query }, (results: any, status: string) => {
      if (status === "OK" && results?.[0]) {
        applyZoneSearchPlace(results[0]);
      } else {
        setMapsError(businessOwners("maps.noAreaMatch"));
      }

      setZoneSearching(false);
    });
  };

  const handleZoneSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;

    event.preventDefault();
    handleZoneSearch();
  };

  const generateStarterZone = () => {
    const center = selectedZoneCenter || getZoneMapCenter();
    const radiusKm = Math.max(
      0.8,
      Math.min(4, toNumber(watch("branch.settings.deliveryConfig.radiusKm"), 2) / 2 || 1)
    );
    const polygon = createPolygonAroundCenter(center, radiusKm);

    if (!zones.length) {
      setValue(
        "branch.settings.deliveryConfig.zones",
        [{ ...createDefaultZone(), name: "Delivery Zone 1", polygon }],
        { shouldValidate: true }
      );
      setActiveZoneIndex(0);
      return;
    }

    const nextZones = zones.map((zone: any, index: number) =>
      index === activeZoneIndex ? { ...zone, polygon } : zone
    );

    setValue("branch.settings.deliveryConfig.zones", nextZones, {
      shouldValidate: true,
    });
  };

  const addCenterPoint = () => {
    const center = selectedZoneCenter || getZoneMapCenter();

    if (!zones.length) {
      setValue(
        "branch.settings.deliveryConfig.zones",
        [
          {
            ...createDefaultZone(),
            name: "Delivery Zone 1",
            polygon: [center],
          },
        ],
        { shouldValidate: true }
      );
      setActiveZoneIndex(0);
      return;
    }

    addZonePointFromMap(activeZoneIndex, center);
  };

  const undoLastZonePoint = () => {
    const activeZone = zones[activeZoneIndex];
    const polygon = normalizeArray(activeZone?.polygon);

    if (!polygon.length) return;

    const nextZones = zones.map((zone: any, index: number) => {
      if (index !== activeZoneIndex) return zone;

      return {
        ...zone,
        polygon: polygon.slice(0, -1),
      };
    });

    setValue("branch.settings.deliveryConfig.zones", nextZones, {
      shouldValidate: true,
    });
  };

  const fitActiveZone = () => {
    if (!window.google?.maps || !zoneMapRef.current) return;

    const activeZone = zones[activeZoneIndex];
    const points = normalizeArray(activeZone?.polygon)
      .map(normalizeLatLngPoint)
      .filter(isValidLatLngPoint);

    if (!points.length) {
      zoneMapRef.current.panTo(zoneMapCenter);
      zoneMapRef.current.setZoom(branchCoordinates || selectedZoneCenter ? 14 : 12);
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();
    points.forEach((point) => bounds.extend(point));
    zoneMapRef.current.fitBounds(bounds);
  };

  useEffect(() => {
    if (!initialData) return;

    const tenant = initialData?.data || initialData;

    if (isEdit) {
      reset({
        name: tenant.name || "",
        slug: tenant.slug || "",
        bio: tenant.bio || "",
        logoUrl: tenant.logoUrl || "",
        socialLinks: tenant.socialLinks || {},
        brandingConfig: tenant.brandingConfig || {},
        settings: tenant.settings || {},
        isActive: tenant.isActive ?? true,
      });
      return;
    }

    reset({
      user: {
        email: initialData.user?.email || initialData.email || "",
        password: "",
        firstName: initialData.user?.firstName || "",
        lastName: initialData.user?.lastName || "",
        avatarUrl: initialData.user?.avatarUrl || "",
        bio: initialData.user?.bio || "",
      },
      branchAdmin: {
        email: initialData.branchAdmin?.email || "",
        password: "",
        firstName: initialData.branchAdmin?.firstName || "",
        lastName: initialData.branchAdmin?.lastName || "",
        phone: initialData.branchAdmin?.phone || "",
      },
      tenant: {
        name: initialData.tenant?.name || initialData.name || "",
        slug: initialData.tenant?.slug || initialData.slug || "",
        logoUrl: initialData.tenant?.logoUrl || initialData.logoUrl || "",
        bio: initialData.tenant?.bio || initialData.bio || "",
        socialLinks: initialData.tenant?.socialLinks || {
          website: "",
          facebook: "",
          instagram: "",
          linkedin: "",
        },
        settings: initialData.tenant?.settings || {},
      },
      restaurant: {
        name: initialData.restaurant?.name || "",
        slug: initialData.restaurant?.slug || "",
        logoUrl: initialData.restaurant?.logoUrl || "",
        coverImage: initialData.restaurant?.coverImage || "",
        customDomain: initialData.restaurant?.customDomain || "",
        bio: initialData.restaurant?.bio || "",
        tagline: initialData.restaurant?.tagline || "",
        supportContact: initialData.restaurant?.supportContact || {
          email: "",
          whatsapp: "",
          phone: "",
        },
        branding: initialData.restaurant?.branding || {
          primaryColor: "#FF0000",
          secondaryColor: "#000000",
          fontFamily: "Inter",
        },
        socialMedia: initialData.restaurant?.socialMedia || {
          facebook: "",
          instagram: "",
          tiktok: "",
          youtube: "",
        },
      },
      branch: {
        name: initialData.branch?.name || "",
        logoUrl: initialData.branch?.logoUrl || "",
        coverImage: initialData.branch?.coverImage || "",
        description: initialData.branch?.description || "",
        settings: {
          ...DEFAULT_BRANCH_SETTINGS,
          ...(initialData.branch?.settings || {}),
          deliveryConfig: {
            ...DEFAULT_DELIVERY_CONFIG,
            ...(initialData.branch?.settings?.deliveryConfig || {}),
          },
        },
        street: initialData.branch?.street || "",
        shopNumber: initialData.branch?.shopNumber || "",
        postalCode: initialData.branch?.postalCode || "",
        area: initialData.branch?.area || "",
        city: initialData.branch?.city || "",
        state: initialData.branch?.state || "",
        country: initialData.branch?.country || "",
        lat: initialData.branch?.lat || "",
        lng: initialData.branch?.lng || "",
      },
    });
  }, [initialData, isEdit, reset]);

  useEffect(() => {
    if (!isEdit && tenantName) {
      const nextSlug = slugify(tenantName);
      setValue("tenant.slug", nextSlug, { shouldValidate: true });

      const currentRestaurantName = watch("restaurant.name");
      const currentBranchName = watch("branch.name");

      if (!currentRestaurantName) {
        setValue("restaurant.name", tenantName, { shouldValidate: false });
        setValue("restaurant.slug", nextSlug, { shouldValidate: false });
      }

      if (!currentBranchName) {
        setValue("branch.name", `${tenantName} Main Branch`, {
          shouldValidate: false,
        });
      }
    }
  }, [tenantName, isEdit, setValue, watch]);

  useEffect(() => {
    if (!isEdit && restaurantName) {
      setValue("restaurant.slug", slugify(restaurantName), {
        shouldValidate: true,
      });
    }
  }, [restaurantName, isEdit, setValue]);

  useEffect(() => {
    const composed = composeBranchAddress({
      shopNumber: watch("branch.shopNumber"),
      street: watch("branch.street"),
      area: watch("branch.area"),
      postalCode: watch("branch.postalCode"),
      city: watch("branch.city"),
      state: watch("branch.state"),
      country: watch("branch.country"),
    });

    if (!addressQuery && composed) {
      setAddressQuery(composed);
    }
    // intentionally run on mount/revisit only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessOwners]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.google?.maps?.places) {
      setMapsReady(true);
      setMapsLoading(false);
      setMapsError("");
      return;
    }

    if (!isGoogleMapsKeyConfigured()) {
      setMapsReady(false);
      setMapsLoading(false);
      setMapsError(
        businessOwners("maps.apiKeyMissing")
      );
      return;
    }

    const existingScript = document.getElementById(
      GOOGLE_MAPS_SCRIPT_ID
    ) as HTMLScriptElement | null;

    const handleLoad = () => {
      setMapsReady(true);
      setMapsLoading(false);
      setMapsError("");
    };

    const handleError = () => {
      setMapsReady(false);
      setMapsLoading(false);
      setMapsError(businessOwners("maps.loadFailed"));
    };

    setMapsLoading(true);

    if (existingScript) {
      existingScript.addEventListener("load", handleLoad);
      existingScript.addEventListener("error", handleError);

      if (window.google?.maps?.places) {
        handleLoad();
      }

      return () => {
        existingScript.removeEventListener("load", handleLoad);
        existingScript.removeEventListener("error", handleError);
      };
    }

    const script = document.createElement("script");
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      GOOGLE_MAPS_API_KEY
    )}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);

    document.head.appendChild(script);

    return () => {
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };
  }, [businessOwners]);

  useEffect(() => {
    if (!mapsReady || !addressAutocompleteRef.current) return;
    if (!window.google?.maps?.places?.Autocomplete) return;
    if (addressAutocompleteInstanceRef.current) return;

    addressAutocompleteInstanceRef.current = new window.google.maps.places.Autocomplete(
      addressAutocompleteRef.current,
      {
        fields: [
          "address_components",
          "formatted_address",
          "geometry",
          "name",
          "place_id",
        ],
        types: ["geocode"],
      }
    );

    addressAutocompleteInstanceRef.current.addListener("place_changed", () => {
      const place = addressAutocompleteInstanceRef.current?.getPlace?.();

      if (!place?.geometry) {
        setMapsError(businessOwners("maps.selectAddressSuggestion"));
        return;
      }

      applyPlaceToBranchForm(place);
    });

    return () => {
      if (window.google?.maps?.event && addressAutocompleteInstanceRef.current) {
        window.google.maps.event.clearInstanceListeners(addressAutocompleteInstanceRef.current);
      }

      addressAutocompleteInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapsReady]);

  useEffect(() => {
    if (!mapsReady || !branchMapContainerRef.current || !window.google?.maps?.Map) return;

    const center = branchCoordinates || DEFAULT_MAP_CENTER;

    if (!branchMapRef.current) {
      branchMapRef.current = new window.google.maps.Map(branchMapContainerRef.current, {
        center,
        zoom: branchCoordinates ? 16 : 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        clickableIcons: false,
      });

      branchMapRef.current.addListener("click", (event: any) => {
        const lat = event?.latLng?.lat?.();
        const lng = event?.latLng?.lng?.();

        if (Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))) {
          setBranchCoordinates(Number(lat).toFixed(6), Number(lng).toFixed(6));
          updateBranchMapMarker(Number(lat), Number(lng), false);
          reverseGeocodeCoordinates(Number(lat), Number(lng));
        }
      });
    }

    updateBranchMapMarker(center.lat, center.lng, Boolean(branchCoordinates));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapsReady]);

  useEffect(() => {
    if (!branchCoordinates) return;
    updateBranchMapMarker(branchCoordinates.lat, branchCoordinates.lng, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchCoordinates?.lat, branchCoordinates?.lng]);

  useEffect(() => {
    if (deliveryMode !== "ZONE") return;
    if (!mapsReady || !zoneMapContainerRef.current || !window.google?.maps?.Map) return;

    if (!zoneMapRef.current) {
      zoneMapRef.current = new window.google.maps.Map(zoneMapContainerRef.current, {
        center: zoneMapCenter,
        zoom: branchCoordinates || selectedZoneCenter ? 14 : 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        clickableIcons: false,
        draggableCursor: "crosshair",
      });

      zoneMapRef.current.addListener("click", (event: any) => {
        const lat = event?.latLng?.lat?.();
        const lng = event?.latLng?.lng?.();

        if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) return;

        if (!zones.length) {
          setValue(
            "branch.settings.deliveryConfig.zones",
            [
              {
                ...createDefaultZone(),
                name: "Delivery Zone 1",
                polygon: [
                  {
                    lat: Number(Number(lat).toFixed(6)),
                    lng: Number(Number(lng).toFixed(6)),
                  },
                ],
              },
            ],
            { shouldValidate: true }
          );
          setActiveZoneIndex(0);
          return;
        }

        const safeZoneIndex = Math.min(activeZoneIndex, zones.length - 1);
        addZonePointFromMap(safeZoneIndex, {
          lat: Number(Number(lat).toFixed(6)),
          lng: Number(Number(lng).toFixed(6)),
        });
      });
    }

    window.google.maps.event.trigger(zoneMapRef.current, "resize");
    renderZoneMapOverlay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapsReady, deliveryMode]);

  useEffect(() => {
    if (deliveryMode !== "ZONE") return;
    if (!mapsReady || !zoneMapRef.current) return;

    renderZoneMapOverlay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapsReady, deliveryMode, zones, activeZoneIndex, selectedZoneCenter]);

  useEffect(() => {
    if (activeZoneIndex <= zones.length - 1) return;
    setActiveZoneIndex(Math.max(0, zones.length - 1));
  }, [activeZoneIndex, zones.length]);

  useEffect(() => {
    if (!mapsReady || !zoneSearchInputRef.current) return;
    if (!window.google?.maps?.places?.Autocomplete) return;
    if (zoneAutocompleteInstanceRef.current) return;

    zoneAutocompleteInstanceRef.current = new window.google.maps.places.Autocomplete(
      zoneSearchInputRef.current,
      {
        fields: ["formatted_address", "geometry", "name", "place_id"],
        types: ["geocode"],
      }
    );

    zoneAutocompleteInstanceRef.current.addListener("place_changed", () => {
      const place = zoneAutocompleteInstanceRef.current?.getPlace?.();

      if (!place?.geometry) {
        setMapsError(businessOwners("maps.selectAreaSuggestion"));
        return;
      }

      applyZoneSearchPlace(place);
    });

    return () => {
      if (window.google?.maps?.event && zoneAutocompleteInstanceRef.current) {
        window.google.maps.event.clearInstanceListeners(zoneAutocompleteInstanceRef.current);
      }

      zoneAutocompleteInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapsReady, deliveryMode]);

  const removeImage = (field: UploadField) => {
    setValue(field, "", { shouldValidate: true });

    setPreviews((prev) => {
      const copy = { ...prev };
      if (copy[field]?.startsWith("blob:")) {
        URL.revokeObjectURL(copy[field]);
      }
      delete copy[field];
      return copy;
    });
  };

  const addZone = () => {
    setValue("branch.settings.deliveryConfig.zones", [...zones, createDefaultZone()], {
      shouldValidate: true,
    });
  };

  const duplicateZone = (index: number) => {
    const source = zones[index];
    if (!source) return;

    const next = [...zones];
    next.splice(index + 1, 0, {
      ...source,
      name: source.name ? `${source.name} Copy` : "Zone Copy",
      polygon: normalizeArray(source.polygon).map((point: any) => ({ ...point })),
    });

    setValue("branch.settings.deliveryConfig.zones", next, {
      shouldValidate: true,
    });
  };

  const removeZone = (index: number) => {
    setValue(
      "branch.settings.deliveryConfig.zones",
      zones.filter((_: any, currentIndex: number) => currentIndex !== index),
      { shouldValidate: true }
    );
  };

  const addZonePoint = (zoneIndex: number) => {
    const next = zones.map((zone: any, currentIndex: number) => {
      if (currentIndex !== zoneIndex) return zone;

      return {
        ...zone,
        polygon: [...normalizeArray(zone?.polygon), createDefaultPolygonPoint()],
      };
    });

    setValue("branch.settings.deliveryConfig.zones", next, {
      shouldValidate: true,
    });
  };

  const removeZonePoint = (zoneIndex: number, pointIndex: number) => {
    const next = zones.map((zone: any, currentIndex: number) => {
      if (currentIndex !== zoneIndex) return zone;

      return {
        ...zone,
        polygon: normalizeArray(zone?.polygon).filter(
          (_: any, currentPointIndex: number) => currentPointIndex !== pointIndex
        ),
      };
    });

    setValue("branch.settings.deliveryConfig.zones", next, {
      shouldValidate: true,
    });
  };

  const addZoneBand = () => {
    setValue(
      "branch.settings.deliveryConfig.zoneBands",
      [...zoneBands, createDefaultZoneBand()],
      { shouldValidate: true }
    );
  };

  const removeZoneBand = (index: number) => {
    setValue(
      "branch.settings.deliveryConfig.zoneBands",
      zoneBands.filter((_: any, currentIndex: number) => currentIndex !== index),
      { shouldValidate: true }
    );
  };

  const addPostalCodeRule = () => {
    setValue(
      "branch.settings.deliveryConfig.postalCodeRules",
      [...postalCodeRules, createDefaultPostalRule()],
      { shouldValidate: true }
    );
  };

  const removePostalCodeRule = (index: number) => {
    setValue(
      "branch.settings.deliveryConfig.postalCodeRules",
      postalCodeRules.filter((_: any, currentIndex: number) => currentIndex !== index),
      { shouldValidate: true }
    );
  };

  const onSubmit = async (values: any) => {
    try {
      if (isEdit) {
        const payload = {
          name: values.name || values.tenant?.name || "",
          slug: values.slug || values.tenant?.slug || "",
          bio: values.bio || values.tenant?.bio || "",
          logoUrl: values.logoUrl || values.tenant?.logoUrl || "",
          socialLinks: values.socialLinks || values.tenant?.socialLinks || {},
          brandingConfig: values.brandingConfig || {},
          settings: values.settings || values.tenant?.settings || {},
          isActive: values.isActive ?? true,
        };

        await updateMutation.mutateAsync({
          id: tenantId!,
          data: payload,
        });

        toast.success(toasts("businessOwnerUpdated"));
        router.back();
        return;
      }

      const branchSettingsPayload = buildBranchSettingsPayload(
        values.branch?.settings || {}
      );
      const branchStreet = String(values.branch.street || "").trim();
      const branchShopNumber = String(values.branch.shopNumber || "").trim();
      const branchPostalCode = String(values.branch.postalCode || "").trim();

      const payload = {
        packagePlanId: values.packagePlanId,
        user: {
          email: values.user.email,
          password: values.user.password,
          firstName: values.user.firstName,
          lastName: values.user.lastName,
          avatarUrl: values.user.avatarUrl || "",
          bio: values.user.bio || "",
        },
        branchAdmin: {
          email: values.branchAdmin.email,
          password: values.branchAdmin.password,
          firstName: values.branchAdmin.firstName,
          lastName: values.branchAdmin.lastName,
          phone: values.branchAdmin.phone || "",
        },
        tenant: {
          name: values.tenant.name,
          slug: values.tenant.slug,
          logoUrl: values.tenant.logoUrl || "",
          bio: values.tenant.bio || "",
          socialLinks: compactObject(values.tenant.socialLinks || {}),
          settings: compactObject(values.tenant.settings || {}),
        },
        restaurant: {
          name: values.restaurant.name,
          slug: values.restaurant.slug,
          logoUrl: values.restaurant.logoUrl || "",
          coverImage: values.restaurant.coverImage || "",
          customDomain: values.restaurant.customDomain || "",
          bio: values.restaurant.bio || "",
          tagline: values.restaurant.tagline || "",
          supportContact: compactObject(values.restaurant.supportContact || {}),
          branding: compactObject(values.restaurant.branding || {}),
          socialMedia: compactObject(values.restaurant.socialMedia || {}),
        },
        branch: {
          name: values.branch.name,
          logoUrl: values.branch.logoUrl || "",
          coverImage: values.branch.coverImage || "",
          description: values.branch.description || "",
          settings: branchSettingsPayload,
          street: branchStreet,
          shopNumber: branchShopNumber,
          postalCode: branchPostalCode,
          area: values.branch.area || "",
          city: values.branch.city || "",
          state: values.branch.state || "",
          country: values.branch.country || "",
          lat: values.branch.lat ? String(values.branch.lat) : "",
          lng: values.branch.lng ? String(values.branch.lng) : "",
        },
      };

      await createMutation.mutateAsync(payload);
      toast.success(toasts("businessOwnerCreated"));
      router.back();
    } catch (err: unknown) {
      const message =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof err.response === "object" &&
        err.response !== null &&
        "data" in err.response &&
        typeof err.response.data === "object" &&
        err.response.data !== null &&
        "message" in err.response.data &&
        typeof err.response.data.message === "string"
          ? err.response.data.message
          : toasts("somethingWentWrong");

      toast.error(message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (formErrors) => console.log(formErrors))}
      className="space-y-[48px] rounded-[14px] bg-white p-[30px]"
    >
      {!isEdit && (
        <FormSection label={businessOwners("packagePlan")}>
          <div className="grid grid-cols-1 gap-[24px] md:grid-cols-2">
            <div className="w-full space-y-[8px]">
              <Label>{`${businessOwners("packagePlan")} *`}</Label>
              <select
                className={`h-[52px] w-full rounded-md border border-[#BBBBBB] px-3 text-sm focus:border-primary focus:outline-none ${
                  readError(errors, "packagePlanId") ? "border-red-500" : ""
                }`}
                disabled={packagePlansQuery.isLoading || packagePlansQuery.isFetching}
                {...register("packagePlanId")}
              >
                <option value="">
                  {packagePlansQuery.isLoading || packagePlansQuery.isFetching
                    ? businessOwners("loadingPackagePlans")
                    : businessOwners("selectPackagePlan")}
                </option>
                {packagePlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                    {plan.billingModel ? ` - ${plan.billingModel}` : ""}
                    {plan.planPrice !== undefined && plan.planPrice !== null
                      ? ` (${plan.currency || "PKR"} ${plan.planPrice})`
                      : ""}
                  </option>
                ))}
              </select>
              {readError(errors, "packagePlanId") ? (
                <p className="mt-1 text-sm text-red-500">
                  {readError(errors, "packagePlanId")}
                </p>
              ) : null}
            </div>
          </div>
        </FormSection>
      )}

      {!isEdit && (
        <FormSection label={businessOwners("ownerAccount")}>
          <div className="grid grid-cols-1 gap-[24px] md:grid-cols-2">
            <FormGroup
              label={`${businessOwners("firstName")} *`}
              placeholder="John"
              error={readError(errors, "user.firstName")}
              disabled={isEdit}
              {...register("user.firstName")}
            />
            <FormGroup
              label={`${businessOwners("lastName")} *`}
              placeholder="Doe"
              error={readError(errors, "user.lastName")}
              disabled={isEdit}
              {...register("user.lastName")}
            />
          </div>

          <div className="grid grid-cols-1 gap-[24px] md:grid-cols-2">
            <FormGroup
              label={`${authLabel("email")} *`}
              placeholder="owner@brand.com"
              error={readError(errors, "user.email")}
              disabled={isEdit}
              {...register("user.email")}
            />
            <FormGroup
              label={`${authLabel("password")} *`}
              placeholder={businessOwners("minimumCharacters")}
              type="password"
              error={readError(errors, "user.password")}
              disabled={isEdit}
              {...register("user.password")}
            />
          </div>

          <FormGroup
            label={businessOwners("ownerBio")}
            placeholder={businessOwners("ownerBioPlaceholder")}
            error={readError(errors, "user.bio")}
            disabled={isEdit}
            {...register("user.bio")}
          />

          <div className="space-y-[6px]">
            <Label>{businessOwners("ownerAvatar")}</Label>
            <UploadBox
              preview={previews["user.avatarUrl"] || ownerAvatar}
              disabled={isEdit}
              labels={uploadLabels}
              onFileSelect={(file) => handleUpload(file, "user.avatarUrl")}
              onRemove={() => removeImage("user.avatarUrl")}
              progress={uploadingField === "user.avatarUrl" ? progress : 0}
              uploading={uploading && uploadingField === "user.avatarUrl"}
              variant="avatar"
            />
          </div>
        </FormSection>
      )}

      {!isEdit && (
        <FormSection label={businessOwners("branchAdminAccount")}>
          <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
            <p className="text-sm font-semibold text-gray-900">
              {businessOwners("branchAdminLogin")}
            </p>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              {businessOwners("branchAdminLoginDescription")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-[24px] md:grid-cols-2">
            <FormGroup
                label={`${businessOwners("firstName")} *`}
                placeholder={businessOwners("branchAdminFirstNamePlaceholder")}
              error={readError(errors, "branchAdmin.firstName")}
              {...register("branchAdmin.firstName")}
            />
            <FormGroup
                label={`${businessOwners("lastName")} *`}
                placeholder={businessOwners("branchAdminLastNamePlaceholder")}
              error={readError(errors, "branchAdmin.lastName")}
              {...register("branchAdmin.lastName")}
            />
          </div>

          <div className="grid grid-cols-1 gap-[24px] md:grid-cols-2">
            <FormGroup
                label={`${authLabel("email")} *`}
              placeholder="branch.admin@brand.com"
              error={readError(errors, "branchAdmin.email")}
              {...register("branchAdmin.email")}
            />
            <FormGroup
                label={`${authLabel("password")} *`}
                placeholder={businessOwners("minimumCharacters")}
              type="password"
              error={readError(errors, "branchAdmin.password")}
              {...register("branchAdmin.password")}
            />
          </div>

          <FormGroup
            label={restaurants("phone")}
            placeholder="+923001234567"
            error={readError(errors, "branchAdmin.phone")}
            {...register("branchAdmin.phone")}
          />
        </FormSection>
      )}

      <FormSection label={businessOwners("tenantBusiness")}>
        <div className="grid grid-cols-1 gap-[24px] md:grid-cols-2">
          <FormGroup
            label={`${businessOwners("businessName")} *`}
            placeholder="Dcodax Foods"
            error={isEdit ? readError(errors, "name") : readError(errors, "tenant.name")}
            {...(isEdit ? register("name") : register("tenant.name"))}
          />
          <FormGroup
            label={`${businessOwners("businessSlug")} *`}
            placeholder="dcodax-foods"
            error={isEdit ? readError(errors, "slug") : readError(errors, "tenant.slug")}
            {...(isEdit ? register("slug") : register("tenant.slug"))}
          />
        </div>

        <FormGroup
          label={businessOwners("businessBio")}
          placeholder={businessOwners("businessBioPlaceholder")}
          error={isEdit ? readError(errors, "bio") : readError(errors, "tenant.bio")}
          {...(isEdit ? register("bio") : register("tenant.bio"))}
        />

        <div className="space-y-[6px]">
          <Label>{businessOwners("businessLogo")}</Label>
          <UploadBox
            preview={
              previews[isEdit ? "logoUrl" : "tenant.logoUrl"] ||
              (isEdit ? watch("logoUrl") : tenantLogo)
            }
            labels={uploadLabels}
            onFileSelect={(file) =>
              handleUpload(file, isEdit ? "logoUrl" : "tenant.logoUrl")
            }
            onRemove={() =>
              removeImage(isEdit ? "logoUrl" : "tenant.logoUrl")
            }
            progress={
              uploadingField === (isEdit ? "logoUrl" : "tenant.logoUrl")
                ? progress
                : 0
            }
            uploading={
              uploading &&
              uploadingField === (isEdit ? "logoUrl" : "tenant.logoUrl")
            }
            variant="logo"
          />
        </div>

        {!isEdit && (
          <>
            <div className="grid grid-cols-1 gap-[24px] md:grid-cols-2">
              <FormGroup
                label={businessOwners("website")}
                placeholder="https://brand.com"
                error={readError(errors, "tenant.socialLinks.website")}
                {...register("tenant.socialLinks.website")}
              />
              <FormGroup
                label={businessOwners("facebook")}
                placeholder="https://facebook.com/brand"
                error={readError(errors, "tenant.socialLinks.facebook")}
                {...register("tenant.socialLinks.facebook")}
              />
            </div>

            <div className="grid grid-cols-1 gap-[24px] md:grid-cols-2">
              <FormGroup
                label={businessOwners("instagram")}
                placeholder="https://instagram.com/brand"
                error={readError(errors, "tenant.socialLinks.instagram")}
                {...register("tenant.socialLinks.instagram")}
              />
              <FormGroup
                label={businessOwners("linkedin")}
                placeholder="https://linkedin.com/company/brand"
                error={readError(errors, "tenant.socialLinks.linkedin")}
                {...register("tenant.socialLinks.linkedin")}
              />
            </div>
          </>
        )}
      </FormSection>

      {!isEdit && (
        <>
          <FormSection label={restaurants("restaurantSetup")}>
            <div className="grid grid-cols-1 gap-[24px] md:grid-cols-2">
              <FormGroup
                label={`${restaurants("restaurantName")} *`}
                placeholder="Dcodax Kitchen"
                error={readError(errors, "restaurant.name")}
                {...register("restaurant.name")}
              />
              <FormGroup
                label={`${restaurants("slug")} *`}
                placeholder="dcodax-kitchen"
                error={readError(errors, "restaurant.slug")}
                {...register("restaurant.slug")}
              />
            </div>

            <FormGroup
              label={restaurants("tagline")}
              placeholder="Best meals in town"
              error={readError(errors, "restaurant.tagline")}
              {...register("restaurant.tagline")}
            />

            <FormGroup
              label={businessOwners("restaurantBio")}
              placeholder={businessOwners("restaurantBioPlaceholder")}
              error={readError(errors, "restaurant.bio")}
              {...register("restaurant.bio")}
            />

            <FormGroup
              label={restaurants("customDomain")}
              placeholder="order.brand.com"
              error={readError(errors, "restaurant.customDomain")}
              {...register("restaurant.customDomain")}
            />

            <div className="grid grid-cols-1 gap-[24px] md:grid-cols-2">
              <div className="space-y-[6px]">
                <Label>{restaurants("restaurantLogo")}</Label>
                <UploadBox
                  preview={previews["restaurant.logoUrl"] || restaurantLogo}
                  labels={uploadLabels}
                  onFileSelect={(file) =>
                    handleUpload(file, "restaurant.logoUrl")
                  }
                  onRemove={() => removeImage("restaurant.logoUrl")}
                  progress={
                    uploadingField === "restaurant.logoUrl" ? progress : 0
                  }
                  uploading={
                    uploading && uploadingField === "restaurant.logoUrl"
                  }
                  variant="logo"
                />
              </div>

              <div className="space-y-[6px]">
                <Label>{restaurants("coverImage")}</Label>
                <UploadBox
                  preview={previews["restaurant.coverImage"] || restaurantCover}
                  labels={uploadLabels}
                  onFileSelect={(file) =>
                    handleUpload(file, "restaurant.coverImage")
                  }
                  onRemove={() => removeImage("restaurant.coverImage")}
                  progress={
                    uploadingField === "restaurant.coverImage" ? progress : 0
                  }
                  uploading={
                    uploading && uploadingField === "restaurant.coverImage"
                  }
                  variant="cover"
                />
              </div>
            </div>
          </FormSection>

          <FormSection label={businessOwners("restaurantSupportSocial")}>
            <div className="grid grid-cols-1 gap-[24px] md:grid-cols-3">
              <FormGroup
                label={restaurants("supportEmail")}
                placeholder="support@brand.com"
                error={readError(errors, "restaurant.supportContact.email")}
                {...register("restaurant.supportContact.email")}
              />
              <FormGroup
                label={restaurants("whatsapp")}
                placeholder="+923001234567"
                error={readError(errors, "restaurant.supportContact.whatsapp")}
                {...register("restaurant.supportContact.whatsapp")}
              />
              <FormGroup
                label={restaurants("phone")}
                placeholder="+923001234567"
                error={readError(errors, "restaurant.supportContact.phone")}
                {...register("restaurant.supportContact.phone")}
              />
            </div>

            <div className="grid grid-cols-1 gap-[24px] md:grid-cols-2">
              <FormGroup
                label={businessOwners("facebook")}
                placeholder="https://facebook.com/restaurant"
                error={readError(errors, "restaurant.socialMedia.facebook")}
                {...register("restaurant.socialMedia.facebook")}
              />
              <FormGroup
                label={businessOwners("instagram")}
                placeholder="https://instagram.com/restaurant"
                error={readError(errors, "restaurant.socialMedia.instagram")}
                {...register("restaurant.socialMedia.instagram")}
              />
            </div>

            <div className="grid grid-cols-1 gap-[24px] md:grid-cols-2">
              <FormGroup
                label={businessOwners("tiktok")}
                placeholder="https://tiktok.com/@restaurant"
                error={readError(errors, "restaurant.socialMedia.tiktok")}
                {...register("restaurant.socialMedia.tiktok")}
              />
              <FormGroup
                label={businessOwners("youtube")}
                placeholder="https://youtube.com/@restaurant"
                error={readError(errors, "restaurant.socialMedia.youtube")}
                {...register("restaurant.socialMedia.youtube")}
              />
            </div>
          </FormSection>

          <FormSection label={businessOwners("branchSetup")}>
            <div className="grid grid-cols-1 gap-[24px] md:grid-cols-2">
              <FormGroup
                label={`${branches("branchName")} *`}
                placeholder={branches("mainBranch")}
                error={readError(errors, "branch.name")}
                {...register("branch.name")}
              />
              <FormGroup
                label={businessOwners("branchDescription")}
                placeholder={businessOwners("shortDescription")}
                error={readError(errors, "branch.description")}
                {...register("branch.description")}
              />
            </div>

            <div className="grid grid-cols-1 gap-[24px] md:grid-cols-2">
              <div className="space-y-[6px]">
                <Label>{businessOwners("branchLogo")}</Label>
                <UploadBox
                  preview={previews["branch.logoUrl"] || branchLogo}
                  labels={uploadLabels}
                  onFileSelect={(file) => handleUpload(file, "branch.logoUrl")}
                  onRemove={() => removeImage("branch.logoUrl")}
                  progress={uploadingField === "branch.logoUrl" ? progress : 0}
                  uploading={uploading && uploadingField === "branch.logoUrl"}
                  variant="logo"
                />
              </div>

              <div className="space-y-[6px]">
                <Label>{branches("branchCover")}</Label>
                <UploadBox
                  preview={previews["branch.coverImage"] || branchCover}
                  labels={uploadLabels}
                  onFileSelect={(file) => handleUpload(file, "branch.coverImage")}
                  onRemove={() => removeImage("branch.coverImage")}
                  progress={
                    uploadingField === "branch.coverImage" ? progress : 0
                  }
                  uploading={uploading && uploadingField === "branch.coverImage"}
                  variant="cover"
                />
              </div>
            </div>
          </FormSection>

          <FormSection label={businessOwners("branchAddress")}>
            <div className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {businessOwners("addressFromGoogleMaps")}
                </p>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  {businessOwners("addressFromGoogleMapsDescription")}
                </p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <div className="relative flex-1">
                  <Search
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <Input
                    ref={addressAutocompleteRef}
                    value={addressQuery}
                    onChange={(event) => {
                      setAddressQuery(event.target.value);
                      setSelectedGoogleAddress("");
                    }}
                    onKeyDown={handleAddressKeyDown}
                    placeholder={businessOwners("searchBranchAddress")}
                    className="h-[52px] rounded-xl border-[#BBBBBB] pl-11 pr-11 focus:border-primary"
                  />

                  {(mapsLoading || addressSearching) ? (
                    <Loader2
                      size={18}
                      className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-primary"
                    />
                  ) : selectedGoogleAddress ? (
                    <CheckCircle2
                      size={18}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-green-600"
                    />
                  ) : mapsError ? (
                    <AlertCircle
                      size={18}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-500"
                    />
                  ) : null}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddressSearch}
                  disabled={!mapsReady || addressSearching || mapsLoading}
                  className="h-[52px] rounded-xl border-primary px-5 text-primary disabled:opacity-50"
                >
                  {addressSearching ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Search size={16} />
                  )}
                  {businessOwners("searchMap")}
                </Button>
              </div>

              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                {mapsReady ? (
                  <>
                    <div ref={branchMapContainerRef} className="h-[300px] w-full" />
                    <div className="flex flex-col gap-2 border-t border-gray-200 bg-white px-4 py-3 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
                      <span>
                        Branch location will be saved as latitude/longitude in the registration payload.
                      </span>
                      <span className="shrink-0 font-medium text-gray-700">
                        {branchCoordinates
                          ? `${toCoordinateString(branchCoordinates.lat)}, ${toCoordinateString(branchCoordinates.lng)}`
                          : businessOwners("coordinatesNotSelected")}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex min-h-[240px] flex-col items-center justify-center px-5 text-center">
                    {mapsLoading ? (
                      <>
                        <Loader2 className="mb-3 animate-spin text-primary" size={28} />
                        <p className="text-sm font-medium text-gray-700">{businessOwners("loadingGoogleMap")}</p>
                      </>
                    ) : (
                      <>
                        <MapPin className="mb-3 text-gray-400" size={30} />
                        <p className="text-sm font-medium text-gray-700">
                          {businessOwners("googleMapPreviewUnavailable")}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {businessOwners("enableAddressMapHint")}
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {selectedGoogleAddress ? (
                <p className="text-xs text-gray-500">{businessOwners("selected")}: {selectedGoogleAddress}</p>
              ) : null}

              {mapsError ? <p className="text-xs text-amber-600">{mapsError}</p> : null}
            </div>

            <div className="grid grid-cols-1 gap-[24px] md:grid-cols-2">
              <FormGroup
                label={businessOwners("street")}
                placeholder={businessOwners("streetAddress")}
                error={readError(errors, "branch.street")}
                {...register("branch.street")}
              />
              <FormGroup
                label={businessOwners("shopNumber")}
                placeholder={businessOwners("shopNumber")}
                error={readError(errors, "branch.shopNumber")}
                {...register("branch.shopNumber")}
              />
            </div>

            <div className="grid grid-cols-1 gap-[24px] md:grid-cols-2">
              <FormGroup
                label={businessOwners("postalCode")}
                placeholder={businessOwners("postalCode")}
                error={readError(errors, "branch.postalCode")}
                {...register("branch.postalCode")}
              />
              <FormGroup
                label={businessOwners("area")}
                placeholder={businessOwners("area")}
                error={readError(errors, "branch.area")}
                {...register("branch.area")}
              />
            </div>

            <div className="grid grid-cols-1 gap-[24px] md:grid-cols-2">
              <FormGroup
                label={businessOwners("city")}
                placeholder="Islamabad"
                error={readError(errors, "branch.city")}
                {...register("branch.city")}
              />
              <FormGroup
                label={businessOwners("state")}
                placeholder="Punjab"
                error={readError(errors, "branch.state")}
                {...register("branch.state")}
              />
            </div>

            <div className="grid grid-cols-1 gap-[24px] md:grid-cols-3">
              <FormGroup
                label={businessOwners("country")}
                placeholder="Pakistan"
                error={readError(errors, "branch.country")}
                {...register("branch.country")}
              />
              <FormGroup
                label={businessOwners("latitude")}
                placeholder="33.6844"
                error={readError(errors, "branch.lat")}
                {...register("branch.lat")}
              />
              <FormGroup
                label={businessOwners("longitude")}
                placeholder="73.0479"
                error={readError(errors, "branch.lng")}
                {...register("branch.lng")}
              />
            </div>
          </FormSection>

          <FormSection label={businessOwners("deliveryAreaConfiguration")}>
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-900">
                {businessOwners("hiddenDefaultsIncluded")}
              </p>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                {businessOwners("hiddenDefaultsDescription")}
              </p>
            </div>

            <SelectGroup
              label={businessOwners("deliveryMode")}
              value={deliveryMode}
              options={[
                { label: businessOwners("radius"), value: "RADIUS" },
                { label: businessOwners("polygonZones"), value: "ZONE" },
                { label: businessOwners("postalCodes"), value: "POSTAL_CODE" },
              ]}
              onChange={(value) =>
                setValue("branch.settings.deliveryConfig.mode", value, {
                  shouldValidate: true,
                })
              }
            />

            <div className="grid grid-cols-1 gap-[24px] md:grid-cols-2">
              <FormGroup
                label={businessOwners("baseDeliveryFee")}
                placeholder="100"
                type="number"
                step="0.01"
                error={readError(errors, "branch.settings.deliveryConfig.deliveryFee")}
                {...register("branch.settings.deliveryConfig.deliveryFee", {
                  valueAsNumber: true,
                })}
              />
              <FormGroup
                label={businessOwners("radiusKm")}
                placeholder="7.5"
                type="number"
                step="0.1"
                error={readError(errors, "branch.settings.deliveryConfig.radiusKm")}
                {...register("branch.settings.deliveryConfig.radiusKm", {
                  valueAsNumber: true,
                })}
              />
            </div>

            <div className="grid grid-cols-1 gap-[24px] md:grid-cols-2">
              <FormGroup
                label={businessOwners("minimumOrderAmount")}
                placeholder="500"
                type="number"
                step="0.01"
                error={readError(errors, "branch.settings.deliveryConfig.minOrderAmount")}
                {...register("branch.settings.deliveryConfig.minOrderAmount", {
                  valueAsNumber: true,
                })}
              />
              <FormGroup
                label={branches("freeDeliveryThreshold")}
                placeholder="1500"
                type="number"
                step="0.01"
                error={readError(errors, "branch.settings.deliveryConfig.freeDeliveryThreshold")}
                {...register(
                  "branch.settings.deliveryConfig.freeDeliveryThreshold",
                  { valueAsNumber: true }
                )}
              />
            </div>

            <SelectGroup
              label={businessOwners("freeDelivery")}
              value={watch("branch.settings.deliveryConfig.isFreeDelivery") ? "true" : "false"}
              options={[
                { label: common("enabled"), value: "true" },
                { label: common("disabled"), value: "false" },
              ]}
              onChange={(value) =>
                setValue(
                  "branch.settings.deliveryConfig.isFreeDelivery",
                  value === "true",
                  { shouldValidate: true }
                )
              }
            />


            {deliveryMode === "RADIUS" ? (
              <DynamicSection
                title={businessOwners("radiusBands")}
                description={businessOwners("radiusBandsDescription")}
                actionLabel={businessOwners("addBand")}
                onAdd={addZoneBand}
                emptyText={businessOwners("noRadiusBands")}
              >
                {zoneBands.map((_: any, index: number) => (
                  <div
                    key={`zone-band-${index}`}
                    className="rounded-2xl border border-gray-200 bg-white p-4"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-gray-900">
                        {businessOwners("band")} {index + 1}
                      </p>
                      <IconActionButton
                        tone="danger"
                        label={common("delete")}
                        onClick={() => removeZoneBand(index)}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-[16px] md:grid-cols-2">
                      <FormGroup
                        label={businessOwners("fromKm")}
                        type="number"
                        step="0.1"
                        placeholder="0"
                        {...register(
                          `branch.settings.deliveryConfig.zoneBands.${index}.fromKm`,
                          { valueAsNumber: true }
                        )}
                      />
                      <FormGroup
                        label={businessOwners("toKm")}
                        type="number"
                        step="0.1"
                        placeholder="7.5"
                        {...register(
                          `branch.settings.deliveryConfig.zoneBands.${index}.toKm`,
                          { valueAsNumber: true }
                        )}
                      />
                      <FormGroup
                        label={branches("deliveryFee")}
                        type="number"
                        step="0.01"
                        placeholder="100"
                        {...register(
                          `branch.settings.deliveryConfig.zoneBands.${index}.deliveryFee`,
                          { valueAsNumber: true }
                        )}
                      />
                      <FormGroup
                        label={businessOwners("minimumOrder")}
                        type="number"
                        step="0.01"
                        placeholder="500"
                        {...register(
                          `branch.settings.deliveryConfig.zoneBands.${index}.minOrderAmount`,
                          { valueAsNumber: true }
                        )}
                      />
                      <FormGroup
                        label={branches("freeDeliveryThreshold")}
                        type="number"
                        step="0.01"
                        placeholder="1500"
                        {...register(
                          `branch.settings.deliveryConfig.zoneBands.${index}.freeDeliveryThreshold`,
                          { valueAsNumber: true }
                        )}
                      />
                    </div>
                  </div>
                ))}
              </DynamicSection>
            ) : null}

            {deliveryMode === "ZONE" ? (
              <>
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
                  <div className="border-b border-gray-100 bg-white p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {businessOwners("polygonZoneBuilder")}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-gray-600">
                          {businessOwners("polygonZoneBuilderDescription")}
                        </p>
                      </div>

                      {zones.length > 0 ? (
                        <select
                          value={activeZoneIndex}
                          onChange={(event) => setActiveZoneIndex(Number(event.target.value))}
                          className="h-10 rounded-full border border-gray-200 bg-white px-4 text-sm outline-none focus:border-primary"
                        >
                          {zones.map((zone: any, index: number) => (
                            <option key={`zone-select-${index}`} value={index}>
                              {zone?.name || `Zone ${index + 1}`}
                            </option>
                          ))}
                        </select>
                      ) : null}
                    </div>

                    <div className="mt-4 flex flex-col gap-3 lg:flex-row">
                      <div className="relative flex-1">
                        <Search
                          size={17}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <Input
                          ref={zoneSearchInputRef}
                          value={zoneSearch}
                          onChange={(event) => {
                            setZoneSearch(event.target.value);
                            setZoneSearchLabel("");
                          }}
                          onKeyDown={handleZoneSearchKeyDown}
                          placeholder={businessOwners("searchAreaPlaceholder")}
                          className="h-11 rounded-full border-gray-200 bg-white pl-11 pr-4 text-sm focus:border-primary"
                        />
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleZoneSearch}
                        disabled={!mapsReady || zoneSearching || mapsLoading}
                        className="h-11 rounded-full border-primary px-5 text-primary disabled:opacity-50"
                      >
                        {zoneSearching ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Search size={16} />
                        )}
                        {businessOwners("searchMap")}
                      </Button>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={generateStarterZone}
                        className="inline-flex h-9 items-center gap-2 rounded-full bg-primary px-3 text-xs font-semibold text-white hover:bg-primary/90"
                      >
                        <Crosshair size={14} />
                        {businessOwners("generateStarterZone")}
                      </button>

                      <button
                        type="button"
                        onClick={addCenterPoint}
                        className="inline-flex h-9 items-center gap-2 rounded-full border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <MapPin size={14} />
                        {businessOwners("addCenterPoint")}
                      </button>

                      <button
                        type="button"
                        onClick={undoLastZonePoint}
                        disabled={!normalizeArray(zones?.[activeZoneIndex]?.polygon).length}
                        className="inline-flex h-9 items-center gap-2 rounded-full border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Undo2 size={14} />
                        {businessOwners("undoLastPoint")}
                      </button>

                      <button
                        type="button"
                        onClick={fitActiveZone}
                        className="inline-flex h-9 items-center gap-2 rounded-full border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <Maximize2 size={14} />
                        {businessOwners("fitActiveZone")}
                      </button>
                    </div>

                    {zoneSearchLabel ? (
                      <p className="mt-3 text-xs text-gray-500">
                        {businessOwners("selectedMapArea")}: {zoneSearchLabel}
                      </p>
                    ) : null}
                  </div>

                  {mapsReady ? (
                    <div className="relative">
                      <div ref={zoneMapContainerRef} className="h-[430px] w-full" />

                      <div className="pointer-events-none absolute left-4 top-4 rounded-2xl bg-white/95 px-4 py-3 text-xs shadow-md ring-1 ring-gray-100">
                        <p className="font-semibold text-gray-900">
                          {zones?.[activeZoneIndex]?.name || `${businessOwners("zone")} ${activeZoneIndex + 1}`}
                        </p>
                        <p className="mt-1 text-gray-500">
                          {businessOwners("pointsSelected", {
                            count: normalizeArray(zones?.[activeZoneIndex]?.polygon).length,
                          })}
                        </p>
                        <p className="mt-1 text-gray-400">
                          {businessOwners("clickMapToAdd")}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex min-h-[260px] flex-col items-center justify-center px-5 text-center">
                      {mapsLoading ? (
                        <>
                          <Loader2 className="mb-3 animate-spin text-primary" size={28} />
                          <p className="text-sm font-medium text-gray-700">{businessOwners("loadingGoogleMap")}</p>
                        </>
                      ) : (
                        <>
                          <MapPin className="mb-3 text-gray-400" size={30} />
                          <p className="text-sm font-medium text-gray-700">
                            {businessOwners("googleMapPreviewUnavailable")}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {businessOwners("enablePolygonMapHint")}
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <DynamicSection
                title={businessOwners("polygonDeliveryZones")}
                description={businessOwners("polygonDeliveryZonesDescription")}
                actionLabel={businessOwners("addZone")}
                onAdd={addZone}
                emptyText={businessOwners("noPolygonZones")}
              >
                {zones.map((zone: any, zoneIndex: number) => {
                  const polygon = normalizeArray(zone?.polygon);

                  return (
                    <div
                      key={`zone-${zoneIndex}`}
                      className="rounded-2xl border border-gray-200 bg-white p-4"
                    >
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-gray-900">
                          {businessOwners("zone")} {zoneIndex + 1}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <IconActionButton
                            label={businessOwners("duplicate")}
                            icon={<Copy size={13} />}
                            onClick={() => duplicateZone(zoneIndex)}
                          />
                          <IconActionButton
                            tone="danger"
                            label={common("delete")}
                            onClick={() => removeZone(zoneIndex)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-[16px] md:grid-cols-2">
                        <FormGroup
                          label={businessOwners("zoneName")}
                          placeholder={businessOwners("nearZonePlaceholder")}
                          {...register(
                            `branch.settings.deliveryConfig.zones.${zoneIndex}.name`
                          )}
                        />
                        <FormGroup
                          label={businessOwners("zoneDeliveryFee")}
                          type="number"
                          step="0.01"
                          placeholder="100"
                          {...register(
                            `branch.settings.deliveryConfig.zones.${zoneIndex}.deliveryFee`,
                            { valueAsNumber: true }
                          )}
                        />
                        <FormGroup
                          label={businessOwners("minimumOrderAmount")}
                          type="number"
                          step="0.01"
                          placeholder="500"
                          {...register(
                            `branch.settings.deliveryConfig.zones.${zoneIndex}.minOrderAmount`,
                            { valueAsNumber: true }
                          )}
                        />
                        <FormGroup
                          label={branches("freeDeliveryThreshold")}
                          type="number"
                          step="0.01"
                          placeholder="1500"
                          {...register(
                            `branch.settings.deliveryConfig.zones.${zoneIndex}.freeDeliveryThreshold`,
                            { valueAsNumber: true }
                          )}
                        />
                      </div>

                      <div className="mt-5 rounded-2xl bg-gray-50 p-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                              {businessOwners("polygonPoints")}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {businessOwners("polygonPointsHint")}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => addZonePoint(zoneIndex)}
                            className="h-9 rounded-full px-3 text-xs"
                          >
                            <Plus size={13} />
                            {businessOwners("addPoint")}
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {polygon.length === 0 ? (
                            <p className="rounded-xl border border-dashed border-gray-200 bg-white p-4 text-sm text-gray-500">
                              {businessOwners("noPointsAdded")}
                            </p>
                          ) : (
                            polygon.map((_: any, pointIndex: number) => (
                              <div
                                key={`zone-${zoneIndex}-point-${pointIndex}`}
                                className="grid grid-cols-1 gap-2 rounded-xl bg-white p-3 md:grid-cols-[90px_1fr_1fr_auto]"
                              >
                                <div className="flex items-center text-xs font-medium text-gray-500">
                                  {businessOwners("point")} {pointIndex + 1}
                                </div>
                                <Input
                                  type="number"
                                  step="0.000001"
                                  placeholder={businessOwners("latitude")}
                                  {...register(
                                    `branch.settings.deliveryConfig.zones.${zoneIndex}.polygon.${pointIndex}.lat`,
                                    { valueAsNumber: true }
                                  )}
                                />
                                <Input
                                  type="number"
                                  step="0.000001"
                                  placeholder={businessOwners("longitude")}
                                  {...register(
                                    `branch.settings.deliveryConfig.zones.${zoneIndex}.polygon.${pointIndex}.lng`,
                                    { valueAsNumber: true }
                                  )}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => removeZonePoint(zoneIndex, pointIndex)}
                                  className="h-10 rounded-xl border-red-100 bg-red-50 px-3 text-red-600 hover:bg-red-100"
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </DynamicSection>
              </>
            ) : null}

            {deliveryMode === "POSTAL_CODE" ? (
              <DynamicSection
                title={businessOwners("postalCodeRules")}
                description={businessOwners("postalCodeRulesDescription")}
                actionLabel={businessOwners("addPostalCode")}
                onAdd={addPostalCodeRule}
                emptyText={businessOwners("noPostalCodeRules")}
              >
                {postalCodeRules.map((_: any, index: number) => (
                  <div
                    key={`postal-code-${index}`}
                    className="grid grid-cols-1 gap-[16px] rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-[1fr_1fr_auto]"
                  >
                    <FormGroup
                      label={businessOwners("postalCode")}
                      placeholder="54000"
                      {...register(
                        `branch.settings.deliveryConfig.postalCodeRules.${index}.postalCode`
                      )}
                    />
                    <FormGroup
                      label={branches("deliveryFee")}
                      type="number"
                      step="0.01"
                      placeholder="150"
                      {...register(
                        `branch.settings.deliveryConfig.postalCodeRules.${index}.deliveryFee`,
                        { valueAsNumber: true }
                      )}
                    />
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removePostalCodeRule(index)}
                        className="h-[52px] rounded-xl border-red-100 bg-red-50 px-4 text-red-600 hover:bg-red-100"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </DynamicSection>
            ) : null}
          </FormSection>
        </>
      )}

      <div className="flex justify-end gap-4 pt-8">
        <Button
          type="button"
          variant="outline"
          className="h-[52px] rounded-[12px] px-8"
          onClick={() => router.back()}
        >
          {common("cancel")}
        </Button>

        <Button
          type="submit"
          disabled={isPending || uploading}
          variant="primary"
          className="h-[52px] px-8"
        >
          {isPending
            ? common("saving")
            : isEdit
              ? businessOwners("updateBusinessOwner")
              : businessOwners("createBusinessOwner")}
        </Button>
      </div>
    </form>
  );
}

function FormSection({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-[48px] lg:grid-cols-12">
      <div className="lg:col-span-4">
        <div className="flex items-center gap-[12px] text-primary">
          <Info size={18} className="text-gray" />
          <span className="text-base font-semibold text-[#646982]">
            {label}
          </span>
        </div>
      </div>
      <div className="space-y-[24px] lg:col-span-8">{children}</div>
    </div>
  );
}

function DynamicSection({
  title,
  description,
  actionLabel,
  emptyText,
  onAdd,
  children,
}: {
  title: string;
  description: string;
  actionLabel: string;
  emptyText: string;
  onAdd: () => void;
  children: ReactNode;
}) {
  const hasChildren = Array.isArray(children)
    ? children.some(Boolean)
    : Boolean(children);

  return (
    <div className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          <p className="mt-1 text-sm leading-6 text-gray-600">{description}</p>
        </div>

        <Button
          type="button"
          onClick={onAdd}
          className="h-10 rounded-full bg-primary px-4 text-sm text-white hover:bg-primary/90"
        >
          <Plus size={15} />
          {actionLabel}
        </Button>
      </div>

      {hasChildren ? children : (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-5 text-center text-sm text-gray-500">
          {emptyText}
        </div>
      )}
    </div>
  );
}

function IconActionButton({
  label,
  icon,
  tone = "default",
  onClick,
}: {
  label: string;
  icon?: ReactNode;
  tone?: "default" | "danger";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 items-center gap-2 rounded-full border px-3 text-xs font-medium transition ${
        tone === "danger"
          ? "border-red-100 bg-red-50 text-red-600 hover:bg-red-100"
          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
      }`}
    >
      {icon || <Trash2 size={13} />}
      {label}
    </button>
  );
}

function FormGroup({
  label,
  placeholder,
  error,
  type = "text",
  ...props
}: any) {
  return (
    <div className="w-full space-y-[8px]">
      <Label>{label}</Label>
      <Input
        type={type}
        placeholder={placeholder}
        className={`h-[52px] border-[#BBBBBB] focus:border-primary ${
          error ? "border-red-500" : ""
        }`}
        {...props}
      />
      {error ? <p className="mt-1 text-sm text-red-500">{error}</p> : null}
    </div>
  );
}

function SelectGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<string | { label: string; value: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="w-full space-y-[8px]">
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[52px] w-full rounded-md border border-[#BBBBBB] px-3 text-sm focus:border-primary focus:outline-none"
      >
        {options.map((item) => {
          const option = typeof item === "string" ? { label: item, value: item } : item;

          return (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          );
        })}
      </select>
    </div>
  );
}

function UploadBox({
  preview,
  onRemove,
  disabled = false,
  labels,
  onFileSelect,
  progress,
  uploading,
  variant = "card",
}: {
  preview?: string;
  onRemove: () => void;
  disabled?: boolean;
  labels: {
    preview: string;
    imageSelected: string;
    clickToUpload: string;
    orDragDrop: string;
    uploadHint: string;
    uploading: string;
  };
  onFileSelect: (file: File) => void;
  progress: number;
  uploading: boolean;
  variant?: "avatar" | "logo" | "cover" | "card";
}) {
  return (
    <PremiumImageDropzone
      alt={labels.preview}
      disabled={disabled}
      emptyHint={`${labels.orDragDrop} - ${labels.uploadHint}`}
      emptyTitle={labels.clickToUpload}
      onFileSelect={onFileSelect}
      onRemove={onRemove}
      preview={preview}
      progress={progress}
      selectedText={labels.imageSelected}
      uploading={uploading}
      uploadText={labels.uploading}
      variant={variant}
    />
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function readError(errors: any, path: string) {
  return path.split(".").reduce((acc: any, key: string) => acc?.[key], errors)
    ?.message;
}
