
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as Razorpay from "npm:razorpay@2.9.2";

// Interface for the request body
interface CreateOrderRequest {
  amount: number; // in smallest currency unit (paisa for INR)
  currency: string;
  receipt?: string;
  notes?: Record<string, string>;
}

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create a Razorpay instance
const createRazorpayInstance = () => {
  const key_id = Deno.env.get("RAZORPAY_KEY_ID") || "rzp_test_qJB7Gu8slTfsRH";
  const key_secret = Deno.env.get("RAZORPAY_KEY_SECRET") || "SecretTe13Rl3LtTpFPHSx9bFGO7ub";
  
  if (!key_id || !key_secret) {
    console.error("Razorpay API keys missing in environment variables");
    throw new Error("Razorpay API keys missing in environment variables");
  }

  console.log("Creating Razorpay instance with key_id:", key_id);
  
  return new Razorpay.default({
    key_id,
    key_secret,
  });
};

// Handle the HTTP request
serve(async (req) => {
  console.log("Received request to create Razorpay order");
  
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    console.log(`Method not allowed: ${req.method}`);
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }

  try {
    // Parse the request body
    const requestData: CreateOrderRequest = await req.json();
    console.log("Request data:", requestData);
    
    // Validate required fields
    if (!requestData.amount || !requestData.currency) {
      console.log("Missing required fields", requestData);
      return new Response(
        JSON.stringify({ error: "Missing required fields: amount and currency" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    try {
      // Create a Razorpay instance
      const razorpay = createRazorpayInstance();
      console.log("Razorpay instance created");

      // Create an order
      const orderOptions = {
        amount: requestData.amount,
        currency: requestData.currency,
        receipt: requestData.receipt || `receipt_${Date.now()}`,
        notes: requestData.notes || {},
      };

      console.log("Creating order with options:", orderOptions);

      const order = await razorpay.orders.create(orderOptions);
      console.log("Order created:", order);

      // Return the order details
      return new Response(JSON.stringify({ data: order }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    } catch (razorpayError) {
      console.error("Razorpay API error:", razorpayError);
      return new Response(
        JSON.stringify({ 
          error: razorpayError.message || "Failed to communicate with Razorpay",
          details: razorpayError 
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Failed to create order" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});
