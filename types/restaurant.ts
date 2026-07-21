export type SupportContact = {
  email?: string;
  phone?: string;
  whatsapp?: string;
};

export type Branding = {
  fontFamily?: string;
  font?: string;
  primaryColor?: string;
  secondaryColor?: string;
};

export type SocialMedia = {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  twitter?: string;
};

export type Restaurant = {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  subdomain: string;
  logoUrl: string | null;
  coverImage?: string | null;
  customDomain: string | null;
  customDomainVerifiedAt?: string | null;
  tagline: string | null;
  bio: string | null;
  supportContact: SupportContact;
  branding: Branding;
  socialMedia: SocialMedia;
  settings: null | Record<string, unknown>;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export interface BranchSettings {
  contact: {
    phone: string;
    whatsapp: string;
  };
  taxation: {
    taxPercentage: number;
  };
  serviceCharge?: {
    isEnabled: boolean;
    type: "PERCENTAGE" | "AMOUNT";
    value: number;
  };
  automation: {
    autoAcceptOrders: boolean;
    estimatedPrepTime: number;
  };
  deliveryConfig: {
    radiusKm: number;
    deliveryFee: number;
    isFreeDelivery: boolean;
    minOrderAmount: number;
    freeDeliveryThreshold: number;
  };
  allowedOrderTypes: ("TAKEAWAY" | "DELIVERY" | "DINE_IN")[];
  allowedPaymentMethods: ("COD" | "BANK_TRANSFER" | "CARD")[];
}

export interface Branch {
  id: string;
  restaurantId: string;
  tenantId: string;
  name: string;
  coverImage: string;
  description: string;
  settings: BranchSettings;
  isMain: boolean;
  managerId: string | null;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
