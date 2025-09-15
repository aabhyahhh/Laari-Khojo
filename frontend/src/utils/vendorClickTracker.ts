import { getApiBaseUrl } from '../api/config';

export interface VendorClickResponse {
  success: boolean;
  msg: string;
  data?: {
    vendorId: string;
    clickCount: number;
    lastClickedAt: string;
  };
}

export const trackVendorClick = async (vendorId: string): Promise<VendorClickResponse> => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/vendor-clicks/track-click`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ vendorId }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error tracking vendor click:', error);
    return {
      success: false,
      msg: 'Failed to track vendor click'
    };
  }
};

export const getVendorClickAnalytics = async (token: string) => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/vendor-clicks/analytics`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching vendor click analytics:', error);
    return {
      success: false,
      msg: 'Failed to fetch analytics'
    };
  }
};
