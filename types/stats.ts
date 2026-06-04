export type StatItem = {
  _id: string;
  title: string;
  value: string;
  footerType: 'status' | 'trend' | 'plain';
  statusData?: {
    active: number;
    inactive: number;
  };
  trendData?: {
    direction: 'up' | 'down';
    percentage: string;
    label: string;
  };
  description?: string;
};

export interface AdminDashboardOverview {
  tenants: {
    total: number;
    active: number;
    inactive: number;
  };
  restaurants: {
    total: number;
    active: number;
    inactive: number;
  };
  branches: {
    total: number;
    active: number;
    inactive: number;
  };
  customers: {
    total: number;
    active: number;
    inactive: number;
  };
}

export interface TrendPoint {
  key: string;
  label: string;
  value: number;
  cumulativeTotal: number;
}

export interface RestaurantTrend {
  range: string;
  totalCreatedInRange: number;
  points: TrendPoint[];
}

export interface TopRestaurant {
  _id: string;
  rank: number;
  restaurantId: string;
  name: string;
  slug: string;
  logoUrl: string;
  coverImage: string | null;
  ordersCount: number;
  customersCount: number;
}

export interface TopRestaurantsResponse {
  range: string;
  items: TopRestaurant[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}