
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { initializeRazorpay, createRazorpayInstance, createRazorpayOrder } from '@/services/razorpayService';

interface RazorpayCheckoutProps {
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
}

export const RazorpayCheckout = ({ onSuccess, onError }: RazorpayCheckoutProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState(1000); // Default ₹1000
  const [isLoading, setIsLoading] = useState(false);
  const [isRazorpayReady, setIsRazorpayReady] = useState(false);
  
  const { toast } = useToast();

  // Load Razorpay script on component mount
  useEffect(() => {
    const loadRazorpay = async () => {
      try {
        const isLoaded = await initializeRazorpay();
        console.log('Razorpay initialization result:', isLoaded);
        setIsRazorpayReady(isLoaded);
        if (!isLoaded) {
          toast({
            title: "Error",
            description: "Failed to load Razorpay SDK. Please try again later.",
            variant: "destructive",
          });
        } else {
          console.log('Razorpay SDK loaded successfully');
        }
      } catch (error) {
        console.error('Error loading Razorpay:', error);
        toast({
          title: "Error",
          description: "Failed to load Razorpay SDK. Please try again later.",
          variant: "destructive",
        });
      }
    };

    loadRazorpay();
  }, [toast]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setAmount(value);
    } else {
      setAmount(0); // Reset to 0 if input is not a valid number
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!name.trim() || !email.trim() || !phone.trim() || amount <= 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields and ensure amount is greater than 0.",
        variant: "destructive",
      });
      return;
    }

    if (phone.length < 10) {
      toast({
        title: "Invalid Phone",
        description: "Please enter a valid phone number.",
        variant: "destructive",
      });
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Creating Razorpay order...');
      
      // Create an order
      const orderData = await createRazorpayOrder(
        amount, 
        'INR',
        `rcpt_${Date.now()}`,
        { customerName: name, customerEmail: email, customerPhone: phone }
      );

      if (!orderData || !orderData.id) {
        throw new Error('Failed to create order');
      }

      console.log('Order created:', orderData);

      // Get Razorpay key from env variable
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        throw new Error('Razorpay key is not configured');
      }

      console.log('Using Razorpay key:', razorpayKey);

      // Configure Razorpay options
      const options = {
        key: razorpayKey,
        amount: orderData.amount, // Amount from the created order
        currency: orderData.currency,
        name: "Natural Puff",
        description: "Payment for products",
        order_id: orderData.id,
        prefill: {
          name,
          email,
          contact: phone,
        },
        theme: {
          color: "#167152", // Brand color
        },
        handler: function(response: any) {
          console.log('Payment success response:', response);
          toast({
            title: "Payment Successful",
            description: `Payment ID: ${response.razorpay_payment_id}`,
          });
          if (onSuccess) onSuccess(response);
        },
      };

      console.log('Initializing Razorpay with options:', {...options, key: '***'});

      // Initialize Razorpay
      const razorpay = createRazorpayInstance(
        options,
        (response) => {
          console.log('Payment success callback:', response);
          toast({
            title: "Payment Successful",
            description: `Payment ID: ${response.razorpay_payment_id}`,
          });
          if (onSuccess) onSuccess(response);
        },
        (error) => {
          console.error('Payment error callback:', error);
          toast({
            title: "Payment Failed",
            description: error.error?.description || "Something went wrong with your payment",
            variant: "destructive",
          });
          if (onError) onError(error);
        }
      );

      if (!razorpay) {
        throw new Error('Failed to initialize Razorpay');
      }

      console.log('Opening Razorpay checkout...');
      // Open Razorpay checkout
      razorpay.open();
    } catch (error: any) {
      console.error('Error during payment process:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Payment process failed",
        variant: "destructive",
      });
      if (onError) onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <form onSubmit={handlePayment} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              maxLength={10}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="1000"
              value={amount}
              onChange={handleAmountChange}
              min="1"
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-brand-600 hover:bg-brand-700 mt-2" 
            disabled={isLoading || !isRazorpayReady}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay ₹${amount}`
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
