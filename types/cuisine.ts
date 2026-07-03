export type Cuisine = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    itemLinks?: number;
  };
};

export type CuisinePayload = {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
};

export type CuisineListParams = {
  page?: number;
  limit?: number;
  search?: string;
  includeInactive?: boolean;
  all?: boolean;
  inactive?: boolean;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC" | "asc" | "desc";
};

export type CuisineReorderItem = {
  id: string;
  sortOrder: number;
};

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type CuisinesResponse = {
  data: Cuisine[];
  message?: string;
  meta?: PaginationMeta;
};
