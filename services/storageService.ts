import { AuctionProperty, SearchFilters } from '../types';
import { MOCK_AUCTIONS } from '../constants';
import { db } from './firebaseService';
import { ref, get, set, child } from 'firebase/database';

const AUCTIONS_PATH = 'listings/auctions';

/**
 * Firebase Realtime Database does not allow 'undefined' values.
 * This helper recursively removes keys that have undefined values.
 */
const cleanObject = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(cleanObject);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, cleanObject(v)])
    );
  }
  return obj;
};

export const getAuctions = async (): Promise<AuctionProperty[]> => {
  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, AUCTIONS_PATH));
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      const list = Array.isArray(data) ? data : Object.values(data);
      return (list as AuctionProperty[]).sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    
    return MOCK_AUCTIONS;
  } catch (error) {
    console.error("Storage Error (Fetch):", error);
    return MOCK_AUCTIONS;
  }
};

export const getAuctionBySlug = async (slug: string): Promise<AuctionProperty | undefined> => {
  const auctions = await getAuctions();
  return auctions.find(a => a.slug === slug);
};

export const addAuction = async (auction: AuctionProperty): Promise<void> => {
  const writePath = `${AUCTIONS_PATH}/${auction.id}`;
  
  try {
    // Clean the object to remove any 'undefined' properties before sending to Firebase
    const safeAuction = cleanObject(auction);
    
    const auctionRef = ref(db, writePath);
    await set(auctionRef, safeAuction);
    console.log("Database write confirmed successful.");
  } catch (error: any) {
    console.error("Critical Firebase Write Failure:", error);
    if (error.message.includes("PERMISSION_DENIED")) {
      throw new Error("PERMISSION_DENIED: Your Firebase Database Rules are blocking the save. Please set '.write': true in the Firebase Console.");
    }
    throw new Error(`[${error.code || 'DB_ERROR'}] ${error.message}`);
  }
};

export const searchAuctions = async (filters: SearchFilters): Promise<AuctionProperty[]> => {
  const auctions = await getAuctions();
  
  let filtered = auctions.filter(item => {
    const matchesQuery = filters.query 
      ? item.title.toLowerCase().includes(filters.query.toLowerCase()) || 
        item.location.toLowerCase().includes(filters.query.toLowerCase()) ||
        item.bankName.toLowerCase().includes(filters.query.toLowerCase())
      : true;

    const matchesCity = filters.city && filters.city !== 'All' ? item.city === filters.city : true;
    const matchesCategory = filters.category ? item.category === filters.category : true;
    const matchesArea = filters.area 
      ? item.area.toLowerCase().includes(filters.area.toLowerCase()) 
      : true;

    const matchesMinPrice = filters.minPrice ? item.reservePrice >= filters.minPrice : true;
    const matchesMaxPrice = filters.maxPrice ? item.reservePrice <= filters.maxPrice : true;

    return matchesQuery && matchesCity && matchesCategory && matchesArea && matchesMinPrice && matchesMaxPrice;
  });

  if (filters.sortBy) {
    filtered.sort((a, b) => {
      if (filters.sortBy === 'price_asc') return a.reservePrice - b.reservePrice;
      if (filters.sortBy === 'price_desc') return b.reservePrice - a.reservePrice;
      return 0;
    });
  }

  return filtered;
};