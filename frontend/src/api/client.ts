import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';

// Define types for API responses
export interface Vendor {
  _id: string;
  name?: string;
  businessName?: string;
  vendorName?: string;
  contactNumber: string;
  email?: string;
  mapsLink?: string;
  operatingHours?: any;
  updatedAt?: string;
  foodType?: 'veg' | 'non-veg' | 'swaminarayan' | 'jain' | 'none';
  profilePicture?: string;
  carouselImages?: string[];
  bestDishes?: Array<{ name: string; price?: number; menuLink?: string }>;
  category?: string[]; // Add category field for food categories
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export interface Review {
  _id?: string;
  vendorId: string;
  name: string;
  email: string;
  rating: number;
  comment?: string;
  createdAt?: string;
}

// Create axios instance with default config
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || (import.meta.env.DEV 
      ? 'http://localhost:3000' 
      : 'https://laari-khojo-backend.onrender.com'),
    timeout: 10000, // 10 seconds timeout
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add retry logic
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as AxiosRequestConfig & { _retry?: number };
      
      // Initialize retry count if not set
      config._retry = config._retry || 0;
      
      // Only retry on network errors or 5xx server errors
      if (
        (error.code === 'ECONNABORTED' || 
         (error.response && error.response.status >= 500)) && 
        config._retry < 3
      ) {
        config._retry += 1;
        
        // Exponential backoff delay
        const delay = Math.min(1000 * Math.pow(2, config._retry), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return instance(config);
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

// Create the API client instance
const apiClient = createAxiosInstance();

// Helper function to handle API responses consistently
export const handleApiResponse = async <T>(promise: Promise<{ data: { data: T } }>): Promise<ApiResponse<T>> => {
  try {
    const response = await promise;
    return {
      success: true,
      data: response.data.data,
      error: null
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error?: string; msg?: string }>;
      return {
        success: false,
        data: null,
        error: axiosError.response?.data?.error || 
               axiosError.response?.data?.msg || 
               axiosError.message || 
               'An unexpected error occurred'
      };
    }
    return {
      success: false,
      data: null,
      error: 'An unexpected error occurred'
    };
  }
};

// API methods
export const api = {
  getAllUsers: () => handleApiResponse<Vendor[]>(apiClient.get('/api/all-users')),
  login: (credentials: { email: string; password: string }) => 
    handleApiResponse<{ accessToken: string }>(apiClient.post('/api/login', credentials)),
  register: (userData: Omit<Vendor, '_id'>) => 
    handleApiResponse<Vendor>(apiClient.post('/api/register', userData)),
  getReviews: (vendorId: string) => handleApiResponse<Review[]>(apiClient.get(`/api/reviews?vendorId=${vendorId}`)),
  addReview: (review: Omit<Review, '_id' | 'createdAt'>) => handleApiResponse<Review>(apiClient.post('/api/reviews', review)),
  // Add other API methods as needed
};

// Helper function to derive food type from vendor data
function deriveVendorFoodType(vendor: any): string {
  // If foodType is already set and valid, use it
  if (vendor.foodType && ['veg', 'non-veg', 'swaminarayan', 'jain'].includes(vendor.foodType)) {
    return vendor.foodType;
  }
  
  // Try to derive from dish names
  if (Array.isArray(vendor.bestDishes) && vendor.bestDishes.length > 0) {
    const dishNames = vendor.bestDishes.map((dish: any) => dish.name?.toLowerCase() || '').join(' ');
    
    // Check for non-veg indicators
    if (dishNames.includes('chicken') || dishNames.includes('mutton') || dishNames.includes('fish') || 
        dishNames.includes('egg') || dishNames.includes('meat') || dishNames.includes('beef') || 
        dishNames.includes('pork') || dishNames.includes('lamb')) {
      return 'non-veg';
    }
    
    // Check for swaminarayan indicators
    if (dishNames.includes('swaminarayan') || dishNames.includes('swaminarayan')) {
      return 'swaminarayan';
    }
    
    // Check for jain indicators
    if (dishNames.includes('jain') || dishNames.includes('jain food')) {
      return 'jain';
    }
  }
  
  // Default to veg if no indicators found
  return 'veg';
}

// Helper function to derive categories from vendor data
function deriveVendorCategories(vendor: any): string[] {
  const categories: string[] = [];
  
  // Check if vendor has bestDishes and derive categories from dish names
  if (Array.isArray(vendor.bestDishes) && vendor.bestDishes.length > 0) {
    const dishNames = vendor.bestDishes.map((dish: any) => dish.name?.toLowerCase() || '').join(' ');
    
    // Map dish names to categories with improved accuracy
    
    // Chaat category
    if (dishNames.includes('chaat') || dishNames.includes('pani puri') || dishNames.includes('bhel puri') || dishNames.includes('dahi puri') || dishNames.includes('sev puri')) {
      categories.push('Chaat');
    }
    
    // Juices category
    if (dishNames.includes('juice') || dishNames.includes('smoothie') || dishNames.includes('lemonade')) {
      categories.push('Juices');
    }
    
    // Tea/Coffee category - only for actual tea/coffee items
    if ((dishNames.includes('tea') || dishNames.includes('coffee') || dishNames.includes('chai')) && 
        !dishNames.includes('lassi') && !dishNames.includes('milkshake') && !dishNames.includes('faluda')) {
      categories.push('Tea/Coffee');
    }
    
    // Snacks category - includes vada pav, dabeli, samosa, kachori, puff, etc.
    if (dishNames.includes('samosa') || dishNames.includes('vada pav') || dishNames.includes('dabeli') || 
        dishNames.includes('kachori') || dishNames.includes('puff') || dishNames.includes('pakora') || 
        dishNames.includes('kebab') || dishNames.includes('omelette') || dishNames.includes('sandwich')) {
      categories.push('Snacks');
    }
    
    // Desserts & Beverages category - includes faluda, shakes, ice cream, etc.
    if (dishNames.includes('dessert') || dishNames.includes('gulab jamun') || dishNames.includes('rasgulla') || 
        dishNames.includes('ice cream') || dishNames.includes('faluda') || dishNames.includes('milkshake') || 
        dishNames.includes('shake') || dishNames.includes('kulfi') || dishNames.includes('jalebi')) {
      categories.push('Desserts & Beverages');
    }
    
    // Gujju Snacks category
    if (dishNames.includes('dhokla') || dishNames.includes('khandvi') || dishNames.includes('thepla') || 
        dishNames.includes('fafda') || dishNames.includes('gathiya') || dishNames.includes('khaman')&& 
     !dishNames.includes('dabeli') && !dishNames.includes('puff')) {
      categories.push('Gujju Snacks');
    }
    
    // Pav Bhaji category
    if (dishNames.includes('pav bhaji') || dishNames.includes('pavbhaji')) {
      categories.push('Pav Bhaji');
    }
    
    // Pizza category - check first to avoid conflicts
    if (dishNames.includes('pizza') || dishNames.includes('quesadilla')) {
      categories.push('Pizza');
    }
    
    // Burger category
    if (dishNames.includes('burger')) {
      categories.push('Burger');
    }
    
    // Korean category
    if (dishNames.includes('korean') || dishNames.includes('kimchi') || dishNames.includes('bibimbap')) {
      categories.push('Korean');
    }
    
    // Chinese category - check before Punjabi to avoid conflicts
    if (dishNames.includes('chinese') || dishNames.includes('noodles') || dishNames.includes('fried rice') || 
        dishNames.includes('manchurian') || dishNames.includes('szechwan') || dishNames.includes('sweet and sour') ||
        dishNames.includes('momo') || dishNames.includes('dim sum') || dishNames.includes('spring roll') ||
        dishNames.includes('chow mein') || dishNames.includes('hakka') || dishNames.includes('schezwan')) {
      categories.push('Chinese');
    }
    
    // Punjabi category - only for actual Punjabi items, exclude Chinese and other cuisines
    if ((dishNames.includes('paratha') || dishNames.includes('parathe') || dishNames.includes('butter chicken') || 
         dishNames.includes('dal makhani') || dishNames.includes('paneer') || dishNames.includes('tandoori') ||
         dishNames.includes('lassi') || dishNames.includes('kulcha') || dishNames.includes('makki ki roti') ||
         dishNames.includes('sarson da saag') || dishNames.includes('amritsari fish') || dishNames.includes('chole bhature'))) {
      categories.push('Punjabi');
    }
    
    // South Indian category - only for actual South Indian items, not vada pav/dabeli
    if ((dishNames.includes('dosa') || dishNames.includes('idli') || dishNames.includes('sambar') || 
         dishNames.includes('uttapam') || dishNames.includes('medu vada') || dishNames.includes('upma') ||
         dishNames.includes('rasam') || dishNames.includes('curd rice') || dishNames.includes('pongal') ||
         dishNames.includes('appam') || dishNames.includes('puttu')) ) {
      categories.push('South Indian');
    }
  }
  
  // If no categories found, add "Other"
  if (categories.length === 0) {
    categories.push('Other');
  }
  
  return categories;
}

// Utility to ensure latitude/longitude fields are present
export function normalizeVendor(vendor: any): Vendor & { latitude?: number; longitude?: number } {
  let normalizedVendor: any = { ...vendor };
  
  // Derive food type from vendor data
  normalizedVendor.foodType = deriveVendorFoodType(vendor);
  
  // Derive categories from vendor data
  normalizedVendor.category = deriveVendorCategories(vendor);
  
  // Debug: Log categories and food type for vendors with bestDishes
  if (Array.isArray(vendor.bestDishes) && vendor.bestDishes.length > 0) {
    console.log(`Vendor ${vendor.name}: Food type: ${normalizedVendor.foodType}, Categories:`, normalizedVendor.category, 'from dishes:', vendor.bestDishes.map((d: any) => d.name));
  }
  
  // If latitude/longitude already present, return as is
  if (typeof vendor.latitude === 'number' && typeof vendor.longitude === 'number') {
    return normalizedVendor;
  }
  // If location.coordinates exists, map to lat/lng
  if (vendor.location && Array.isArray(vendor.location.coordinates) && vendor.location.coordinates.length === 2) {
    return {
      ...normalizedVendor,
      latitude: vendor.location.coordinates[1],
      longitude: vendor.location.coordinates[0],
    };
  }
  // Otherwise, return as is
  return normalizedVendor;
}

export default api; 