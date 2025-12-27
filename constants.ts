
import { AuctionProperty, RealEstateProject } from './types';

export const CITIES = ['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem'];
export const DISTRICTS = ['Chennai', 'Kanchipuram', 'Thiruvallur', 'Chengalpattu'];
export const BANKS = [
  'SBI', 'HDFC', 'ICICI', 'Canara Bank', 'Indian Bank', 
  'Union Bank', 'Bank of Baroda', 'Axis Bank', 'IDBI Bank',
  'Kotak Mahindra', 'Punjab National Bank', 'Indian Overseas Bank'
];
export const CATEGORIES = ['Residential', 'Commercial', 'Land', 'Industrial', 'Agricultural'];

export const MOCK_AUCTIONS: AuctionProperty[] = [
  {
    id: '1',
    slug: 'bank-auction-house-sale-in-tiruvottiyur-2',
    title: 'Independent House for Sale in Tiruvottiyur',
    bankName: 'Indian Bank',
    reservePrice: 4500000,
    emdAmount: 450000,
    auctionDate: '2025-06-15',
    location: '12, Gandhi Street',
    area: 'Tiruvottiyur',
    city: 'Chennai',
    category: 'Residential',
    description: 'A spacious 2200 sqft independent house available for auction. Physical possession available. Near metro station.',
    imageUrls: ['https://picsum.photos/800/600?random=1'],
    contactNumber: '+91 98765 43210',
    possessionStatus: 'Physical',
    createdAt: '2023-10-01'
  },
  {
    id: '2',
    slug: 'commercial-land-omr-chennai',
    title: 'Prime Commercial Land on OMR IT Corridor',
    bankName: 'SBI',
    reservePrice: 12000000,
    emdAmount: 1200000,
    auctionDate: '2025-07-20',
    location: 'Plot 45, IT Highway',
    area: 'Sholinganallur',
    city: 'Chennai',
    category: 'Land',
    description: '5000 sqft commercial plot suitable for IT park or office complex. Clear title. High growth corridor.',
    imageUrls: ['https://picsum.photos/800/600?random=2'],
    contactNumber: '+91 99887 76655',
    possessionStatus: 'Symbolic',
    createdAt: '2023-10-05'
  },
  {
    id: '3',
    slug: 'luxury-apartment-boat-club-chennai',
    title: '3BHK Luxury Apartment in Boat Club Road',
    bankName: 'HDFC',
    reservePrice: 35000000,
    emdAmount: 3500000,
    auctionDate: '2025-06-10',
    location: 'Royal Palms, Boat Club',
    area: 'Adyar',
    city: 'Chennai',
    category: 'Residential',
    description: 'Premium 3BHK flat in one of Chennai\'s most exclusive neighborhoods.',
    imageUrls: ['https://picsum.photos/800/600?random=3'],
    contactNumber: '+91 77665 54433',
    possessionStatus: 'Physical',
    createdAt: '2023-10-10'
  }
];

export const MOCK_PROJECTS: RealEstateProject[] = [];
