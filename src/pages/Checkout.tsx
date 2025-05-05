
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash, Tag, Loader2, CreditCard } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CustomerInfo, Coupon } from '@/types/product';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import ShiprocketServiceabilityChecker from '@/components/checkout/ShiprocketServiceability';
import { initializeRazorpay, createRazorpayInstance, createRazorpayOrder } from '@/services/razorpayService';
import { loadScript } from '@/lib/utils';

const Checkout = () => {
  const { items, totalPrice, clearCart, updateQuantity, removeItem } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [checkoutStep, setCheckoutStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  
  // Payment and shipping state
  const [paymentMethod, setPaymentMethod] = useState<string>('cod');
  const [shippingCost, setShippingCost] = useState(0);
  const [selectedCourier, setSelectedCourier] = useState('');
  const [pincode, setPincode] = useState('');
  const [isRazorpayReady, setIsRazorpayReady] = useState(false);
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isCouponLoading, setIsCouponLoading] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  
  // Calculate final total
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const finalTotal = subtotal - discountAmount + shippingCost;

  // Initialize Razorpay on component mount
  useEffect(() => {
    const loadRazorpay = async () => {
      const loaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      setIsRazorpayReady(loaded);
      if (!loaded) {
        toast({
          title: "Warning",
          description: "Failed to load Razorpay. Online payment may not work.",
          variant: "destructive"
        });
      }
    };

    loadRazorpay();
  }, []);

  // Handle quantity change
  const handleQuantityChange = (id: number, change: number) => {
    const item = items.find(item => item.id === id);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + change);
      updateQuantity(id, newQuantity);
    }
  };

  // Apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a coupon code.",
        variant: "destructive"
      });
      return;
    }

    setIsCouponLoading(true);

    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.trim())
        .eq('is_active', true)
        .single();

      if (error) {
        toast({
          title: "Invalid Coupon",
          description: "The coupon code you entered is invalid or has expired.",
          variant: "destructive"
        });
        setIsCouponLoading(false);
        return;
      }

      if (!data) {
        toast({
          title: "Invalid Coupon",
          description: "The coupon code you entered is invalid or has expired.",
          variant: "destructive"
        });
        setIsCouponLoading(false);
        return;
      }

      // Check if coupon is expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        toast({
          title: "Expired Coupon",
          description: "This coupon has expired.",
          variant: "destructive"
        });
        setIsCouponLoading(false);
        return;
      }

      setAppliedCoupon(data);
      
      // Calculate discount amount
      const discount = Math.round((subtotal * data.discount_percent) / 100);
      setDiscountAmount(discount);

      toast({
        title: "Coupon Applied!",
        description: `You received a ${data.discount_percent}% discount.`,
      });
    } catch (error: any) {
      console.error("Coupon application error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to apply coupon.",
        variant: "destructive"
      });
    } finally {
      setIsCouponLoading(false);
    }
  };

  // Remove coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setDiscountAmount(0);
    
    toast({
      title: "Coupon Removed",
      description: "The coupon has been removed from your order.",
    });
  };

  // Handle form submission
  const handleFormSubmit = (formData: CustomerInfo) => {
    setCustomerInfo(formData);
    setCheckoutStep(2);
    
    // If we have a pincode from the form, use it
    if (formData.pincode && formData.pincode.length === 6) {
      setPincode(formData.pincode);
    }
  };

  // Load Razorpay and open payment
  const handleRazorpayPayment = async (orderId: string) => {
    if (!customerInfo) {
      toast({
        title: "Error",
        description: "Customer information is missing.",
        variant: "destructive"
      });
      return false;
    }

    try {
      if (!isRazorpayReady) {
        const loaded = await initializeRazorpay();
        if (!loaded) {
          throw new Error('Razorpay failed to load');
        }
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: finalTotal * 100, // convert to lowest denomination (paise)
        currency: 'INR',
        name: 'Natural Puff',
        description: 'Payment for your order',
        order_id: orderId,
        prefill: {
          name: customerInfo.name,
          email: customerInfo.email,
          contact: customerInfo.phone,
        },
        theme: {
          color: '#167152', // brand primary color
        },
        handler: function(response: any) {
          // Update order with payment details
          handlePaymentSuccess({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          }, orderId);
        },
      };

      const razorpay = createRazorpayInstance(options);
      if (razorpay) {
        razorpay.open();
        return true;
      }
    } catch (error: any) {
      console.error('Razorpay error:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initialize payment.",
        variant: "destructive"
      });
    }
    return false;
  };

  // Handle payment success
  const handlePaymentSuccess = async (
    response: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    },
    orderId: string
  ) => {
    try {
      // Update order status with payment details
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'paid',
          payment_id: JSON.stringify({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            payment_status: 'paid',
            payment_date: new Date().toISOString(),
          })
        })
        .eq('id', orderId)
        .select();

      if (orderError) {
        console.error('Payment success update error:', orderError);
        throw new Error(orderError.message);
      }

      toast({
        title: "Payment Successful",
        description: "Your payment has been processed successfully.",
      });

      clearCart();
      navigate(`/order-success?id=${orderId}`);
    } catch (error: any) {
      console.error('Payment success handling error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process payment confirmation.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Place order
  const handlePlaceOrder = async () => {
    if (!customerInfo) {
      toast({
        title: "Error",
        description: "Customer information is missing. Please fill in your details.",
        variant: "destructive"
      });
      setCheckoutStep(1);
      return;
    }
    
    // Validate shipping
    if (shippingCost === 0 || !selectedCourier) {
      toast({
        title: "Error",
        description: "Please select a shipping method.",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Create order payload
      const orderPayload = {
        user_id: user?.id || null,
        total_amount: finalTotal,
        shipping_address: {
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
          address: customerInfo.address,
          city: customerInfo.city,
          state: customerInfo.state,
          pincode: customerInfo.pincode
        },
        status: paymentMethod === 'online' ? 'pending_payment' : 'pending',
        payment_id: JSON.stringify({
          payment_method: paymentMethod,
          subtotal,
          discount: discountAmount,
          shipping_cost: shippingCost,
          coupon_code: appliedCoupon?.code || null,
          courier_code: selectedCourier,
          pincode,
          delivery_method: selectedCourier,
        })
      };

      // Make sure RLS policy allows this insert
      const { data: orderResult, error: orderError } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select();
      
      if (orderError) {
        console.error("Order insertion error:", orderError);
        throw new Error(orderError.message || "Failed to create order. Please ensure you are logged in.");
      }
      
      if (!orderResult || orderResult.length === 0) {
        throw new Error("Failed to create order");
      }
      
      const order = orderResult[0];
      
      // Insert order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        product_name: item.name
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error("Order items insertion error:", itemsError);
        throw new Error(itemsError.message || "Failed to add order items");
      }
      
      // Handle online payment with Razorpay
      if (paymentMethod === 'online') {
        try {
          // Create Razorpay order
          const razorpayOrder = await createRazorpayOrder(
            finalTotal, 
            'INR', 
            `receipt_${order.id}`,
            {
              order_id: order.id,
              customer_name: customerInfo.name,
              customer_email: customerInfo.email
            }
          );
          
          // Update order with Razorpay order ID
          const { error: updateError } = await supabase
            .from('orders')
            .update({
              payment_id: JSON.stringify({
                ...JSON.parse(orderResult[0].payment_id || '{}'),
                razorpay_order_id: razorpayOrder.id
              })
            })
            .eq('id', order.id);
            
          if (updateError) {
            console.error("Failed to update order with Razorpay ID:", updateError);
          }
          
          // Show Razorpay payment form
          const paymentSuccess = await handleRazorpayPayment(razorpayOrder.id);
          
          if (!paymentSuccess) {
            toast({
              title: "Order Created",
              description: "Your order has been created but payment couldn't be initialized. You can pay later from your order history.",
            });
            navigate(`/order-success?id=${order.id}`);
          }
          
          // Payment result will be handled by Razorpay callback
        } catch (razorpayError: any) {
          console.error('Razorpay error:', razorpayError);
          toast({
            title: "Order Created",
            description: "Your order has been created, but there was an issue with the payment system. You can pay later.",
          });
          navigate(`/order-success?id=${order.id}&payment=failed`);
        }
      } else {
        // For COD orders
        try {
          // Prepare Shiprocket order data
          const shiprocketOrderData = {
            order_db_id: order.id,
            order_id: `NP${Date.now()}`,
            order_date: new Date().toISOString(),
            pickup_location: "Primary",
            channel_id: "",
            comment: "Natural Puff Order",
            billing_customer_name: customerInfo.name,
            billing_last_name: "",
            billing_address: customerInfo.address,
            billing_address_2: "",
            billing_city: customerInfo.city,
            billing_pincode: customerInfo.pincode,
            billing_state: customerInfo.state,
            billing_country: "India",
            billing_email: customerInfo.email,
            billing_phone: customerInfo.phone,
            shipping_is_billing: true,
            payment_method: 'cod',
            shipping_charges: shippingCost,
            total_discount: discountAmount,
            sub_total: subtotal,
            length: 10,
            breadth: 10,
            height: 10,
            weight: 0.5,
            order_items: items.map(item => ({
              name: item.name,
              sku: `ITEM${item.id}`,
              units: item.quantity,
              selling_price: item.price,
              discount: 0,
              tax: 0
            })),
          };

          // Call to Shiprocket Edge Function
          await supabase.functions.invoke('shiprocket', {
            body: {
              endpoint: 'create-order',
              ...shiprocketOrderData
            },
            method: 'POST',
          });

          toast({
            title: "Success!",
            description: "Your order has been placed. We'll ship it soon!",
          });
          clearCart();
          navigate('/order-success');
        } catch (shippingError) {
          console.error("Shipping API error:", shippingError);
          // Still proceed with order success even if shipping API has issues
          toast({
            title: "Success!",
            description: "Your order has been placed, but there was an issue with the shipping system. We'll contact you soon.",
          });
          clearCart();
          navigate('/order-success');
        }
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to place order.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  // If cart is empty, redirect
  useEffect(() => {
    if (items.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Add some products first.",
      });
      navigate('/products');
    }
  }, [items, navigate]);

  return (
    <div className="container-custom py-6 md:py-12">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8 text-center font-playfair text-brand-800">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        <div className="lg:col-span-2">
          {/* Cart Items */}
          <Card className="mb-4 md:mb-8">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg md:text-xl">Your Cart</CardTitle>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Your cart is empty</p>
                  <Button 
                    onClick={() => navigate('/products')} 
                    className="mt-4 bg-brand-600 hover:bg-brand-700"
                  >
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex flex-col md:flex-row items-start md:items-center justify-between border-b pb-4">
                      <div className="flex items-center mb-2 md:mb-0 w-full md:w-auto">
                        <div className="w-12 h-12 md:w-16 md:h-16 overflow-hidden rounded-md mr-3 md:mr-4">
                          <img 
                            src={item.image_url || '/placeholder.svg'} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-brand-800">{item.name}</p>
                          <p className="text-sm text-gray-500">₹{item.price}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between w-full md:w-auto md:justify-end gap-2">
                        <div className="flex items-center border rounded-md">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={() => handleQuantityChange(item.id, -1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={() => handleQuantityChange(item.id, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <span className="font-medium text-brand-700">₹{item.price * item.quantity}</span>
                        
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-red-500 h-8 w-8"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Coupon Code Section */}
              <div className="mt-6">
                <h3 className="font-medium mb-2">Apply Coupon</h3>
                {appliedCoupon ? (
                  <Alert className="bg-green-50 border-green-200">
                    <Tag className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Coupon Applied!</AlertTitle>
                    <AlertDescription className="text-green-700 flex justify-between items-center">
                      <span>{appliedCoupon.code}: {appliedCoupon.discount_percent}% off</span>
                      <Button 
                        variant="link" 
                        onClick={handleRemoveCoupon} 
                        className="text-red-500 p-0 h-auto"
                      >
                        Remove
                      </Button>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="flex">
                    <Input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      className="flex-grow rounded-r-none"
                      disabled={isCouponLoading}
                    />
                    <Button 
                      onClick={handleApplyCoupon} 
                      disabled={isCouponLoading || !couponCode}
                      className="bg-brand-600 hover:bg-brand-700 rounded-l-none"
                    >
                      {isCouponLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Apply'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Step 1: Customer Information */}
          {checkoutStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Customer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <CheckoutForm 
                  onFormSubmit={handleFormSubmit} 
                  isSubmitting={isProcessing}
                />
              </CardContent>
            </Card>
          )}
          
          {/* Step 2: Shipping & Payment */}
          {checkoutStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Shipping & Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Shipping Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Shipping Options</h3>
                  <ShiprocketServiceabilityChecker 
                    pincode={pincode}
                    setPincode={setPincode}
                    shippingCost={shippingCost}
                    setShippingCost={setShippingCost}
                    selectedCourier={selectedCourier}
                    setSelectedCourier={setSelectedCourier}
                  />
                </div>
                
                <Separator />
                
                {/* Payment Method */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                  <RadioGroup 
                    value={paymentMethod} 
                    onValueChange={setPaymentMethod}
                    className="flex flex-col space-y-3"
                  >
                    <div className="flex items-center space-x-3 border rounded-md p-3">
                      <RadioGroupItem value="cod" id="cod" />
                      <label htmlFor="cod" className="flex-1 cursor-pointer">
                        <div className="font-medium">Cash on Delivery</div>
                        <div className="text-sm text-gray-500">Pay when your order arrives</div>
                      </label>
                    </div>
                    <div className="flex items-center space-x-3 border rounded-md p-3">
                      <RadioGroupItem value="online" id="online" />
                      <label htmlFor="online" className="flex-1 cursor-pointer flex items-center space-x-2">
                        <div>
                          <div className="font-medium">Online Payment</div>
                          <div className="text-sm text-gray-500">Pay securely with Razorpay</div>
                        </div>
                        <CreditCard className="h-5 w-5 text-brand-600 ml-auto" />
                      </label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="pt-4 flex flex-wrap gap-2">
                  <Button 
                    onClick={() => setCheckoutStep(1)} 
                    variant="outline" 
                  >
                    Back to Information
                  </Button>
                  <Button 
                    onClick={handlePlaceOrder} 
                    className="bg-brand-600 hover:bg-brand-700 flex-grow md:flex-grow-0"
                    disabled={isProcessing || !selectedCourier || shippingCost === 0}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Place Order${paymentMethod === 'online' ? ' & Pay Now' : ''}`
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{subtotal}</span>
                </div>
                
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedCoupon.discount_percent}%)</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shippingCost > 0 ? `₹${shippingCost}` : 'Calculate above'}
                  </span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-brand-800">₹{finalTotal}</span>
                </div>
                
                {/* Customer info display */}
                {customerInfo && (
                  <>
                    <Separator />
                    <div className="space-y-1 text-sm">
                      <h4 className="font-semibold">Ship to:</h4>
                      <p>{customerInfo.name}</p>
                      <p>{customerInfo.address}</p>
                      <p>{customerInfo.city}, {customerInfo.state} {customerInfo.pincode}</p>
                      <p>{customerInfo.email}</p>
                      <p>{customerInfo.phone}</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
