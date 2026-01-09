
import { AuctionProperty, RealEstateProject, SearchFilters } from '../types';
import { db, storage } from '../firebaseService';
import { ref, get, child, set } from 'firebase/database';
import { ref as sRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const AUCTIONS_PATH = 'listings/auctions';
const PROJECTS_PATH = 'listings/projects';

/**
 * Converts Google Drive links to direct-viewable URLs
 */
export const formatImageUrl = (url: string): string => {
  if (!url) return url;
  const driveRegex = /(?:https?:\/\/)?(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]+)/;
  const match = url.match(driveRegex);
  if (match && match[1]) {
    return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  }
  return url;
};

/**
 * Cleans undefined values before saving to Firebase to prevent errors
 */
const cleanObject = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(cleanObject);
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, v]) => v !== undefined && v !== null)
        .map(([k, v]) => [k, cleanObject(v)])
    );
  }
  return obj;
};

export const uploadFile = async (file: File, folder: string): Promise<string> => {
  try {
    const fileRef = sRef(storage, `${folder}/${Date.now()}-${file.name}`);
    const snapshot = await uploadBytes(fileRef, file);
    return await getDownloadURL(snapshot.ref);
  } catch (err) {
    console.error("Storage upload error:", err);
    throw new Error("Could not upload file. Check Firebase Storage rules.");
  }
};

export const getAuctions = async (): Promise<AuctionProperty[]> => {
  try {
    if (!db || !db.app) return [];
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, AUCTIONS_PATH));
    if (snapshot.exists()) {
      const data = snapshot.val();
      const list = Array.isArray(data) ? data : Object.values(data);
      return (list as AuctionProperty[])
        .filter(item => !!item && !!item.title)
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }
    return [];
  } catch (err) { 
    console.error("Database fetch error:", err);
    return []; 
  }
};

export const getAuctionBySlug = async (slug: string): Promise<AuctionProperty | undefined> => {
  const auctions = await getAuctions();
  return auctions.find(a => a.slug === slug);
};

export const addAuction = async (auction: AuctionProperty): Promise<void> => {
  if (!db || !db.app) throw new Error("Database not connected");
  const auctionRef = ref(db, `${AUCTIONS_PATH}/${auction.id}`);
  await set(auctionRef, cleanObject(auction));
};

export const getProjects = async (): Promise<RealEstateProject[]> => {
  try {
    if (!db || !db.app) return [];
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, PROJECTS_PATH));
    if (snapshot.exists()) {
      const data = snapshot.val();
      const list = Array.isArray(data) ? data : Object.values(data);
      return (list as RealEstateProject[])
        .filter(item => !!item && !!item.title)
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }
    return [];
  } catch (err) { 
    return []; 
  }
};

export const getProjectBySlug = async (slug: string): Promise<RealEstateProject | undefined> => {
  const projects = await getProjects();
  return projects.find(p => p.slug === slug);
};

export const addProject = async (project: RealEstateProject): Promise<void> => {
  if (!db || !db.app) throw new Error("Database not connected");
  const projectRef = ref(db, `${PROJECTS_PATH}/${project.id}`);
  await set(projectRef, cleanObject(project));
};

export const searchAuctions = async (filters: SearchFilters): Promise<AuctionProperty[]> => {
  const auctions = await getAuctions();
  return (auctions || []).filter(item => {
    const matchesQuery = filters.query ? item.title?.toLowerCase().includes(filters.query.toLowerCase()) : true;
    const matchesArea = filters.area ? `${item.area} ${item.city} ${item.location}`.toLowerCase().includes(filters.area.toLowerCase()) : true;
    const matchesMinPrice = filters.minPrice !== undefined ? item.reservePrice >= filters.minPrice : true;
    const matchesMaxPrice = filters.maxPrice !== undefined ? item.reservePrice <= filters.maxPrice : true;
    const matchesBank = filters.bank ? item.bankName === filters.bank : true;
    
    let matchesDate = true;
    if (filters.startDate || filters.endDate) {
      const itemDate = new Date(item.auctionDate).getTime();
      if (filters.startDate) matchesDate = matchesDate && itemDate >= new Date(filters.startDate).getTime();
      if (filters.endDate) matchesDate = matchesDate && itemDate <= new Date(filters.endDate).getTime();
    }
    
    return matchesQuery && matchesArea && matchesMinPrice && matchesMaxPrice && matchesBank && matchesDate;
  });
};
