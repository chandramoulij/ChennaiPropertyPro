
export interface AuctionProperty {
  id: string;
  slug: string;
  title: string;
  bankName: string;
  reservePrice: number;
  emdAmount?: number;
  auctionDate: string;
  location: string;
  area: string;
  city: string;
  category: 'Residential' | 'Commercial' | 'Land' | 'Industrial' | 'Agricultural';
  description: string;
  imageUrls: string[];
  contactNumber?: string;
  possessionStatus?: 'Physical' | 'Symbolic';
  createdAt: string;
}

export interface RealEstateProject {
  id: string;
  slug: string;
  title: string;
  developer: string;
  location: string;
  area: string;
  city: string;
  priceRange: string;
  priceMin: number;
  priceMax: number;
  status: 'New Launch' | 'Under Construction' | 'Ready to Move';
  configurations: string[];
  imageUrls: string[];
  description: string;
  amenities: string[];
}

export interface SearchFilters {
  query: string;
  city: string;
  area: string;
  bank: string;
  category: string;
  minPrice?: number;
  maxPrice?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'date_asc' | 'date_desc';
  developer?: string;
  status?: string;
  configuration?: string;
}

export enum PageView {
  LANDING = 'LANDING',
  AUCTION_HOME = 'AUCTION_HOME',
  AUCTION_SEARCH = 'AUCTION_SEARCH',
  AUCTION_FILTER = 'AUCTION_FILTER', // New: Handles Bank/Category/City filters
  AUCTION_DETAIL = 'AUCTION_DETAIL',
  REAL_ESTATE_HOME = 'REAL_ESTATE_HOME',
  REAL_ESTATE_SEARCH = 'REAL_ESTATE_SEARCH',
  REAL_ESTATE_CITY = 'REAL_ESTATE_CITY',
  REAL_ESTATE_DETAIL = 'REAL_ESTATE_DETAIL',
  ABOUT = 'ABOUT',
  CONTACT = 'CONTACT',
  ADMIN = 'ADMIN',
  LOGIN = 'LOGIN'
}
