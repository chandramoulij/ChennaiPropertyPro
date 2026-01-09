
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
  documentUrl?: string; 
  contactNumber?: string;
  possessionStatus?: 'Physical' | 'Symbolic';
  createdAt: string;
}

export interface RealEstateProject {
  id: string;
  slug: string;
  title: string;
  type: 'Flat' | 'Plot' | 'House' | 'Commercial';
  developer: string;
  location: string;
  area: string;
  city: string;
  priceRange: string;
  description: string; 
  content: string; // Long-form blog content
  imageUrls: string[];
  documentUrl?: string; // Project Brochure
  createdAt: string;
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
}

export enum PageView {
  LANDING = 'LANDING',
  AUCTION_HOME = 'AUCTION_HOME',
  AUCTION_FILTER = 'AUCTION_FILTER',
  AUCTION_DETAIL = 'AUCTION_DETAIL',
  PROJECT_HOME = 'PROJECT_HOME',
  PROJECT_DETAIL = 'PROJECT_DETAIL',
  ABOUT = 'ABOUT',
  CONTACT = 'CONTACT',
  ADMIN = 'ADMIN',
  LOGIN = 'LOGIN',
  GUIDE = 'GUIDE',
  FAQ = 'FAQ'
}
