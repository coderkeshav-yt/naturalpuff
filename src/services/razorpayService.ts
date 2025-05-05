
import { loadScript } from '@/lib/utils';

export type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
};

export type RazorpayPaymentOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  handler?: (response: any) => void;
};

export type RazorpayInstance = {
  on: (event: string, handler: Function) => void;
  open: () => void;
};

// Create and load Razorpay script
export const initializeRazorpay = async (): Promise<boolean> => {
  try {
    const result = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    console.log('Razorpay script loading result:', result);
    return result;
  } catch (error) {
    console.error('Error loading Razorpay script:', error);
    return false;
  }
};

// Create a new Razorpay instance
export const createRazorpayInstance = (
  options: RazorpayPaymentOptions,
  onSuccess?: (response: any) => void,
  onError?: (error: any) => void
): RazorpayInstance | null => {
  if (typeof window === 'undefined' || typeof window.Razorpay === 'undefined') {
    console.error('Razorpay SDK is not loaded');
    return null;
  }

  try {
    console.log('Creating Razorpay instance with options:', {...options, key: '***' });
    const rzp = new window.Razorpay(options);

    if (onSuccess) {
      rzp.on('payment.success', (response: any) => {
        console.log('Payment success event:', response);
        onSuccess(response);
      });
    }
    
    if (onError) {
      rzp.on('payment.error', (error: any) => {
        console.error('Payment error event:', error);
        onError(error);
      });
    }

    return rzp;
  } catch (error) {
    console.error('Error creating Razorpay instance:', error);
    return null;
  }
};

// Function to create an order via Supabase Edge Function
export const createRazorpayOrder = async (
  amount: number,
  currency: string = 'INR',
  receipt: string = '',
  notes: Record<string, string> = {}
): Promise<RazorpayOrder> => {
  try {
    console.log('Creating Razorpay order with amount:', amount);
    
    const response = await fetch('/api/create-razorpay-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount * 100, // Razorpay expects amount in smallest currency unit (paise)
        currency,
        receipt,
        notes
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Razorpay order creation error:', errorData);
      throw new Error(errorData.error || 'Failed to create order');
    }
    
    const responseData = await response.json();
    console.log('Order creation response:', responseData);
    
    if (responseData.error) {
      console.error('Razorpay order error in response:', responseData.error);
      throw new Error(responseData.error || 'Failed to create order');
    }
    return responseData.data;
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};
