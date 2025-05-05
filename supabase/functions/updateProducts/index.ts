
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Product data to insert
    const products = [
      {
        name: "Natural Puff Raw Makhana – Pure & Wholesome",
        description: "Light, crunchy, and 100% natural. Our Raw Makhana is handpicked and unflavored—perfect for healthy snacking or home-style roasting.",
        details: "Natural Puff Raw Makhana is a clean, single-ingredient superfood straight from the farms of Bihar. Naturally gluten-free and low in calories, it's ideal for fitness-conscious snackers or home cooks who want to roast, spice, and customize their way. Whether you're fasting, meal-prepping, or just looking for a nutritious munch, our makhana delivers purity in every crunch.",
        nutritional_info: "High in protein and magnesium. Low in cholesterol and sodium. Rich in antioxidants.",
        price: 199,
        stock: 100,
        image_url: "https://res.cloudinary.com/dlvxjnycr/image/upload/v1745910080/5_tdxi1b.jpg"
      },
      {
        name: "Natural Puff Makhana – Black Pepper & Salt",
        description: "A bold blend of crushed black pepper and Himalayan salt. Crunchy, savory, and full of flavor—your perfect mindful snack.",
        details: "Turn up the taste without the guilt. Our Black Pepper & Salt Makhana blends the heat of freshly ground pepper with a touch of Himalayan pink salt to create a bold, satisfying crunch. Roasted, never fried, and packed with plant-based goodness, this is the snack you'll keep coming back to—any time of day.",
        nutritional_info: "High in protein and magnesium. Low in cholesterol and sodium. Rich in antioxidants.",
        price: 149,
        stock: 100,
        image_url: "https://res.cloudinary.com/dlvxjnycr/image/upload/v1745910074/2_gnptev.jpg"
      },
      {
        name: "Natural Puff Makhana – Cream & Onion",
        description: "Indulgently creamy with a punch of onion zest. This flavorful treat brings the classic combo to a healthy new form.",
        details: "Creamy, zesty, and delightfully crunchy—our Cream & Onion Makhana brings your favorite flavor combo to a guilt-free, plant-based snack. Each puff is slow-roasted to lock in taste and texture, giving you all the flavor without any of the junk.",
        nutritional_info: "Source of plant-based protein. Vegetarian friendly. Creamy taste with zero cholesterol.",
        price: 149,
        stock: 100,
        image_url: "https://res.cloudinary.com/dlvxjnycr/image/upload/v1745910074/2_gnptev.jpg"
      },
      {
        name: "Natural Puff Makhana – Peri Peri",
        description: "Spicy, zesty, and seriously addictive. Our Peri Peri Makhana packs a punch while staying light and guilt-free.",
        details: "Fiery, bold, and full of flair—Natural Puff's Peri Peri Makhana brings a spicy twist to your snack routine. Seasoned with authentic peri peri spices and roasted to crunchy perfection, this snack satisfies your spice cravings without the oily aftermath. It's your go-to for a flavor rush that's still healthy.",
        nutritional_info: "High in magnesium & antioxidants. Zero cholesterol. Gluten-free. Bold peri peri seasoning.",
        price: 149,
        stock: 100,
        image_url: "https://res.cloudinary.com/dlvxjnycr/image/upload/v1745910077/4_rrgvey.jpg"
      },
      {
        name: "Natural Puff Makhana – Cheese",
        description: "Melt-in-your-mouth cheese flavor meets crunchy roasted makhana. A snack that satisfies your cravings without compromise.",
        details: "Love cheese? So do we. That's why we created a better-for-you cheese snack—light, crispy makhanas coated in rich cheesy flavor. Roasted and never fried, these bites satisfy cheesy cravings while keeping your snacking clean, simple, and delicious.",
        nutritional_info: "Rich in calcium & plant protein. No preservatives or MSG. Wholesome snacking for all ages.",
        price: 149,
        stock: 100,
        image_url: "https://res.cloudinary.com/dlvxjnycr/image/upload/v1745910077/1_hgavbu.jpg"
      },
      {
        name: "Natural Puff Makhana – Pudina",
        description: "Refreshing mint meets crunchy goodness. Natural Puff's Pudina Makhana is a zesty, roasted snack that's bold, aromatic, and full of flavor.",
        details: "Give your taste buds a refreshing kick with Natural Puff Pudina Makhana. Infused with a lively blend of mint, coriander, and subtle spices, every puff delivers a cool, tangy burst that's both satisfying and guilt-free. Roasted to perfection—not fried—this wholesome snack is rich in antioxidants and plant protein, making it ideal for work breaks, travel bites, or mindful munching.",
        nutritional_info: "Flavorful Pudina Blend with Natural Herbs. Roasted, Never Fried. Zero Cholesterol. Low-Calorie. Gluten-Free. No Artificial Colors or Preservatives.",
        price: 149,
        stock: 100,
        image_url: "https://res.cloudinary.com/dlvxjnycr/image/upload/v1745910080/5_tdxi1b.jpg"
      }
    ];
    
    // First, delete existing products
    const { error: deleteError } = await supabaseClient
      .from('products')
      .delete()
      .neq('id', 0); // Delete all products
    
    if (deleteError) {
      throw deleteError;
    }
    
    // Insert new products
    const { data, error } = await supabaseClient
      .from('products')
      .insert(products)
      .select();
    
    if (error) {
      throw error;
    }
    
    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      }
    );
  }
});
