
import React from 'react';
import { RazorpayCheckout } from '@/components/payment/RazorpayCheckout';
import { fullWidthContainer } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const Payment = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handlePaymentSuccess = (response: any) => {
    console.log('Payment successful:', response);
    toast({
      title: "Payment Successful",
      description: `Your payment was processed successfully. Payment ID: ${response.razorpay_payment_id}`
    });
    // Redirect to success page or handle accordingly
    setTimeout(() => {
      navigate('/order-success');
    }, 1500);
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment failed:', error);
    toast({
      title: "Payment Failed",
      description: error.error?.description || "There was an issue with your payment. Please try again.",
      variant: "destructive",
    });
  };

  return (
    <div className={`py-12 ${fullWidthContainer}`}>
      <div className="container-custom">
        <h1 className="text-3xl font-bold text-center mb-6 font-playfair text-brand-800">
          Make a Payment
        </h1>
        
        <Alert className="max-w-md mx-auto mb-6 bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-blue-700">
            This is a test payment gateway. Use card number 4111 1111 1111 1111 with any future expiry date and any CVV.
          </AlertDescription>
        </Alert>
        
        <div className="max-w-md mx-auto">
          <RazorpayCheckout 
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        </div>
      </div>
    </div>
  );
};

export default Payment;
