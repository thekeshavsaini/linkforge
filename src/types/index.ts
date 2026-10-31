export interface LinkItem {
  id: string;
  code: string;
  destination: string;
  title: string | null;
  clicks: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DailyTrendPoint {
  date: string;
  clicks: number;
}

export interface DomainReferrer {
  domain: string;
  count: number;
}

export interface DeviceCount {
  device: string;
  count: number;
}

export interface CountryCount {
  country: string;
  count: number;
}

export interface GlobalAnalyticsSummary {
  totalLinks: number;
  activeLinks: number;
  expiredLinks: number;
  totalClicks: number;
  recentClicks24h: number;
  periodClicks: number;
}

export interface AnalyticsResponse {
  summary: GlobalAnalyticsSummary;
  dailyTrend: DailyTrendPoint[];
  topReferrers: DomainReferrer[];
  deviceDistribution: DeviceCount[];
  topCountries: CountryCount[];
  topLinks: {
    id: string;
    code: string;
    title: string | null;
    destination: string;
    clicks: number;
    createdAt: string;
  }[];
}

export type ActiveTab =
  | "overview"
  | "links"
  | "create"
  | "analytics"
  | "qr"
  | "docs"
  | "settings"
  | "deploy";
