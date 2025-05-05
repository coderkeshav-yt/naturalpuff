
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('id');
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails(orderId);
    }
  }, [orderId]);

  const fetchOrderDetails = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      setOrderDetails(data);
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-12 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold text-green-700">Order Successful!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center mb-6">
            <p className="text-gray-700">
              Thank you for your purchase! Your order has been successfully placed.
            </p>
            {orderId && (
              <p className="text-brand-600 font-medium mt-2">
                Order ID: {orderId.substring(0, 8)}...
              </p>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
            </div>
          ) : orderDetails ? (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Order Summary</h3>
              <div className="space-y-1 text-sm mb-4">
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-medium">₹{orderDetails.total_amount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="font-medium">
                    {orderDetails.payment_id && JSON.parse(orderDetails.payment_id).payment_method === 'online' 
                      ? 'Online Payment' 
                      : 'Cash on Delivery'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-medium capitalize">{orderDetails.status}</span>
                </div>
              </div>
              
              {orderDetails.order_items && orderDetails.order_items.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Items:</h4>
                  <ul className="space-y-2">
                    {orderDetails.order_items.map((item: any) => (
                      <li key={item.id} className="flex justify-between">
                        <span>{item.product_name} × {item.quantity}</span>
                        <span>₹{item.price * item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              Your order has been placed successfully. You can check your order status in your account.
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="bg-brand-600 hover:bg-brand-700 w-full sm:w-auto">
            <Link to="/products">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link to="/profile">View Your Orders</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OrderSuccess;
