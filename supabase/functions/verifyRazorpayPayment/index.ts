
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as crypto from "https://deno.land/std@0.167.0/crypto/mod.ts";

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, x-razorpay-signature",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }

  try {
    const payload = await req.json();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return new Response(
        JSON.stringify({ error: "Missing Razorpay signature" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Verify signature
    const razorpayWebhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
    if (!razorpayWebhookSecret) {
      throw new Error("Razorpay webhook secret is not configured");
    }

    const payloadString = JSON.stringify(payload);
    const encoder = new TextEncoder();
    const data = encoder.encode(payloadString);
    const key = encoder.encode(razorpayWebhookSecret);
    
    const hmac = await crypto.subtle.importKey(
      "raw",
      key,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );
    
    const signature_bytes = new Uint8Array(
      signature.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
    );
    
    const verified = await crypto.subtle.verify(
      "HMAC",
      hmac,
      signature_bytes,
      data
    );

    if (!verified) {
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // If verification successful, process the webhook
    console.log("Verified webhook from Razorpay:", payload.event);
    
    // Here you would typically update your database based on the payment status
    // For example, marking an order as paid if payment was successful
    
    return new Response(
      JSON.stringify({ 
        status: "success", 
        message: "Payment verification successful",
        event: payload.event
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
