import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Search, Filter, Star, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Textarea } from '@/components/ui/textarea';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image_url: string;
  details: string;
  nutritional_info: string;
  stock?: number;
  // New fields to support variants
  variants?: {
    size: string;
    price: number;
  }[];
  discount_percent?: number;
  rating?: number;
}

interface ProductFilterOptions {
  sort: string;
  minPrice: number | null;
  maxPrice: number | null;
}

// Add Cloudinary image URLs
const cloudinaryImages = [
  "https://res.cloudinary.com/dlvxjnycr/image/upload/v1745910080/5_tdxi1b.jpg",
  "https://res.cloudinary.com/dlvxjnycr/image/upload/v1745910077/4_rrgvey.jpg",
  "https://res.cloudinary.com/dlvxjnycr/image/upload/v1745910077/1_hgavbu.jpg",
  "https://res.cloudinary.com/dlvxjnycr/image/upload/v1745910074/2_gnptev.jpg",
  "https://res.cloudinary.com/dlvxjnycr/image/upload/v1745910076/3_klm4om.jpg"
];

const Products = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOptions, setFilterOptions] = useState<ProductFilterOptions>({
    sort: 'name-asc',
    minPrice: null,
    maxPrice: null,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showWholesaleForm, setShowWholesaleForm] = useState(false);
  const [wholesaleFormData, setWholesaleFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { addItem } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    fetchProducts();
  }, []);


  const ensureOnlyAssortedPackInStock = (products: Product[]): Product[] => {
    return products.map(product => {
      if (product.name === 'Assorted Pack') {
        return {
          ...product,
          stock: 10, // In stock
          price: 250,
        };
      } else {
        return {
          ...product,
          stock: 0, // Out of stock
        };
      }
    });
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('products')
        .select('*');

      // Apply filters
      if (filterOptions.minPrice !== null) {
        query = query.gte('price', filterOptions.minPrice);
      }
      if (filterOptions.maxPrice !== null) {
        query = query.lte('price', filterOptions.maxPrice);
      }

      // Apply sorting
      if (filterOptions.sort === 'price-low-high') {
        query = query.order('price', { ascending: true });
      } else if (filterOptions.sort === 'price-high-low') {
        query = query.order('price', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
 
        let productsWithImages = data.map(product => {
 
          const randomImageUrl = cloudinaryImages[Math.floor(Math.random() * cloudinaryImages.length)];
          return {
            ...product,
            image_url: randomImageUrl,
            rating: 4.5 + Math.random() * 0.5,
            discount_percent: Math.floor(Math.random() * 10) + 5
          };
        });
      
        productsWithImages = ensureOnlyAssortedPackInStock(productsWithImages);
        setProducts(productsWithImages);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const openProductDetails = (product: Product) => {
    setSelectedProduct(product);
  
    if (product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0].size);
    }
  };

  const closeProductDetails = () => {
    setSelectedProduct(null);
    setSelectedVariant('');
  };

  const getProductPrice = (product: Product) => {
    if (product.variants && product.variants.length > 0 && selectedVariant) {
      const variant = product.variants.find(v => v.size === selectedVariant);
      return variant ? variant.price : product.price;
    }
    return product.price;
  };

  const handleAddToCart = (product: Product) => {
    const productPrice = getProductPrice(product);
    const productName = product.variants && selectedVariant
      ? `${product.name} (${selectedVariant})`
      : product.name;
      
    addItem({
      id: product.id,
      name: productName,
      price: productPrice,
      image_url: product.image_url || '/placeholder.svg',
      variant: selectedVariant || undefined,
    });
    
    toast({
      title: "Added to Cart",
      description: `${productName} has been added to your cart.`,
    });
    
    closeProductDetails();
  };

  const handleBuyNow = (product: Product) => {

    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to make a purchase",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    const productPrice = getProductPrice(product);
    const productName = product.variants && selectedVariant
      ? `${product.name} (${selectedVariant})`
      : product.name;
      
 
    addItem({
      id: product.id,
      name: productName,
      price: productPrice,
      image_url: product.image_url || '/placeholder.svg',
      variant: selectedVariant || undefined,
    });
    
    navigate('/checkout');
  };
  

  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(product => {
      if (filterOptions.minPrice !== null && getProductPrice(product) < filterOptions.minPrice) {
        return false;
      }
      if (filterOptions.maxPrice !== null && getProductPrice(product) > filterOptions.maxPrice) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (filterOptions.sort) {
        case 'price-asc':
          return getProductPrice(a) - getProductPrice(b);
        case 'price-desc':
          return getProductPrice(b) - getProductPrice(a);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'name-asc':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const renderStarRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="w-4 h-4 fill-gold-500 text-gold-500" />);
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative w-4 h-4">
          <Star className="w-4 h-4 absolute text-gold-500" />
          <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
            <Star className="w-4 h-4 fill-gold-500 text-gold-500" />
          </div>
        </div>
      );
    }

    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gold-300" />);
    }

    return (
      <div className="flex">
        {stars}
        <span className="ml-1 text-sm text-brand-700">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Update the product card image rendering
  const renderProductCard = (product: Product) => (
    <motion.div
      key={product.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group"
    >
      <div className="aspect-square overflow-hidden relative">
        <img 
          src={product.image_url || cloudinaryImages[0]} // Use first image as fallback
          alt={`${product.name} - Premium Makhana`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = cloudinaryImages[0]; // Use first image as fallback
          }}
        />
        {product.discount_percent && (
          <div className="absolute top-4 left-4 bg-brand-600 text-white rounded-full px-3 py-1.5 text-sm font-bold">
            {product.discount_percent}% OFF
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold font-playfair">{product.name}</h3>
          <div className="flex flex-col items-end">
            {product.stock && product.stock > 0 ? (
              <div className="text-lg font-bold text-green-600">In Stock</div>
            ) : (
              <div className="text-lg font-bold text-red-600">Out of Stock</div>
            )}
            {product.discount_percent && (
              <div className="text-xs text-green-600 font-medium">
                {product.discount_percent}% off
              </div>
            )}
          </div>
        </div>
        {product.rating && (
          <div className="mb-2">
            {renderStarRating(product.rating)}
          </div>
        )}
        <p className="text-brand-700 mb-4 line-clamp-3">{product.description}</p>
        <div className="flex space-x-2">
          <Button 
            className="bg-brand-600 hover:bg-brand-700 text-white flex-1"
            onClick={() => openProductDetails(product)}
          >
            View Details
          </Button>
          {product.stock && product.stock > 0 ? (
            <Button
              variant="outline"
              className="border-brand-600 text-brand-600"
              onClick={() => handleAddToCart(product)}
            >
              Add to Cart
            </Button>
          ) : (
            <Button
              variant="outline"
              className="border-gray-400 text-gray-400 cursor-not-allowed"
              disabled
            >
              Out of Stock
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );

  const handleWholesaleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setWholesaleFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleWholesaleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Inquiry Sent!",
        description: "Thank you for your interest. Our team will contact you soon.",
      });
      setWholesaleFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: ''
      });
      setIsSubmitting(false);
      setShowWholesaleForm(false);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="section-padding flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-brand-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-700 text-lg">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-cream-100 py-16 md:py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 bottom-0 opacity-20 bg-pattern"></div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container-custom relative z-10"
        >
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-brand-800 font-playfair">Our Premium Products</h1>
            <div className="w-24 h-1 bg-gold-500 mx-auto mb-8"></div>
            <p className="text-lg md:text-xl text-brand-700">
              Discover our range of premium makhana snacks, handcrafted with care using the finest ingredients.
              Each flavor is designed to deliver a perfect balance of taste and nutrition.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Products Grid */}
      <section className="section-padding bg-cream-200">
        <div className="container-custom">
          {/* Search and Filter Bar */}
          <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:w-1/2 relative">
              <Input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-brand-600" />
            </div>
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-brand-600 text-brand-600">
                    <Filter className="h-4 w-4 mr-2" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuRadioGroup 
                    value={filterOptions.sort} 
                    onValueChange={(value) => setFilterOptions({ ...filterOptions, sort: value })}
                  >
                    <DropdownMenuRadioItem value="name-asc">Name (A-Z)</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="name-desc">Name (Z-A)</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="price-asc">Price (Low to High)</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="price-desc">Price (High to Low)</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button 
                variant="outline" 
                className="border-brand-600 text-brand-600"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
          
          {/* Filter Panel */}
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-cream-100 p-4 rounded-lg mb-8"
            >
              <h3 className="text-lg font-bold mb-4">Filter by Price</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min-price">Min Price</Label>
                  <Input
                    id="min-price"
                    type="number"
                    placeholder="₹0"
                    value={filterOptions.minPrice || ''}
                    onChange={(e) => setFilterOptions({
                      ...filterOptions,
                      minPrice: e.target.value ? parseInt(e.target.value) : null
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="max-price">Max Price</Label>
                  <Input
                    id="max-price"
                    type="number"
                    placeholder="₹1000"
                    value={filterOptions.maxPrice || ''}
                    onChange={(e) => setFilterOptions({
                      ...filterOptions,
                      maxPrice: e.target.value ? parseInt(e.target.value) : null
                    })}
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setFilterOptions({
                    sort: 'name-asc',
                    minPrice: null,
                    maxPrice: null,
                  })}
                >
                  Reset
                </Button>
                <Button 
                  className="bg-brand-600" 
                  onClick={() => setShowFilters(false)}
                >
                  Apply
                </Button>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => renderProductCard(product))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-xl text-brand-700">No products matching your search.</p>
              </div>
            )}
          </div>

          {/* Product Detail Dialog - Updated with explicit close button for mobile */}
          {isMobile ? (
            <Drawer open={!!selectedProduct} onOpenChange={closeProductDetails}>
              <DrawerContent className="px-4 pb-4 pt-1">
                {selectedProduct && (
                  <>
                    <DrawerHeader className="px-0">
                      <DrawerTitle className="text-2xl font-playfair">{selectedProduct.name}</DrawerTitle>
                      <DrawerDescription className="text-brand-700">
                        Premium Roasted Makhana
                      </DrawerDescription>
                    </DrawerHeader>
                    <DrawerClose className="absolute right-4 top-4 rounded-full bg-gray-100 p-2 opacity-100 hover:opacity-90">
                      <X className="h-6 w-6 text-brand-800" />
                      <span className="sr-only">Close</span>
                    </DrawerClose>
                    <div className="grid grid-cols-1 gap-6 py-4">
                      <div className="rounded-lg overflow-hidden">
                        <div className="aspect-square relative">
                          <img 
                            src={selectedProduct.image_url || '/placeholder.svg'}
                            alt={selectedProduct.name}
                            className="absolute w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <p className="text-brand-700">{selectedProduct.description}</p>
                          {selectedProduct.name === 'Assorted Pack' && selectedProduct.stock && selectedProduct.stock > 0 ? (
                            <div className="text-xl font-bold text-green-600">₹250</div>
                          ) : (
                            <div className="text-xl font-bold text-red-600">
                              Out of Stock
                            </div>
                          )}
                        </div>
                        
                        {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-lg mb-2">Choose Size</h4>
                            <RadioGroup 
                              value={selectedVariant} 
                              onValueChange={setSelectedVariant}
                              className="flex gap-4"
                            >
                              {selectedProduct.variants.map((variant) => (
                                <div key={variant.size} className="flex items-center space-x-2">
                                  <RadioGroupItem value={variant.size} id={`mobile-size-${variant.size}`} />
                                  <Label htmlFor={`mobile-size-${variant.size}`} className="cursor-pointer">
                                    {variant.size} - ₹{variant.price}
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          </div>
                        )}
                        
                        <div className="mb-4">
                          <h4 className="font-semibold text-lg mb-1">Details</h4>
                          <p className="text-brand-700 text-sm">{selectedProduct.details}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-lg mb-1">Nutritional Information</h4>
                          <p className="text-brand-700 text-sm">{selectedProduct.nutritional_info}</p>
                        </div>

                        {selectedProduct.rating && (
                          <div className="mt-4">
                            {renderStarRating(selectedProduct.rating)}
                          </div>
                        )}

                        <div className="mt-6">
                          {selectedProduct.stock && selectedProduct.stock > 0 ? (
                            <Button
                              className="w-full bg-brand-600 text-white"
                              onClick={() => handleAddToCart(selectedProduct)}
                            >
                              Add to Cart
                            </Button>
                          ) : (
                            <Button
                              className="w-full bg-gray-400 text-white cursor-not-allowed"
                              disabled
                            >
                              Out of Stock
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </DrawerContent>
            </Drawer>
          ) : (
            <Dialog open={!!selectedProduct} onOpenChange={closeProductDetails}>
              <DialogContent className="sm:max-w-[600px]">
                {selectedProduct && (
                  <>
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-playfair">{selectedProduct.name}</DialogTitle>
                      <DialogDescription className="text-brand-700">
                        Premium Roasted Makhana
                      </DialogDescription>
                    </DialogHeader>
                    <DialogClose className="absolute right-4 top-4 rounded-sm opacity-100 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                      <X className="h-6 w-6 text-brand-700" />
                      <span className="sr-only">Close</span>
                    </DialogClose>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                      <div className="rounded-lg overflow-hidden">
                        <div className="aspect-[550/1100] relative">
                          <img 
                            src={selectedProduct.image_url || '/placeholder.svg'}
                            alt={selectedProduct.name}
                            className="absolute w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <p className="text-brand-700">{selectedProduct.description}</p>
                          {selectedProduct.name === 'Assorted Pack' && selectedProduct.stock && selectedProduct.stock > 0 ? (
                            <div className="text-xl font-bold text-green-600">₹250</div>
                          ) : (
                            <div className="text-xl font-bold text-red-600">
                              Out of Stock
                            </div>
                          )}
                        </div>
                        
                        {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-lg mb-2">Choose Size</h4>
                            <RadioGroup 
                              value={selectedVariant} 
                              onValueChange={setSelectedVariant}
                              className="flex gap-4"
                            >
                              {selectedProduct.variants.map((variant) => (
                                <div key={variant.size} className="flex items-center space-x-2">
                                  <RadioGroupItem value={variant.size} id={`size-${variant.size}`} />
                                  <Label htmlFor={`size-${variant.size}`} className="cursor-pointer">
                                    {variant.size} - ₹{variant.price}
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          </div>
                        )}
                        
                        <div className="mb-4">
                          <h4 className="font-semibold text-lg mb-1">Details</h4>
                          <p className="text-brand-700 text-sm">{selectedProduct.details}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-lg mb-1">Nutritional Information</h4>
                          <p className="text-brand-700 text-sm">{selectedProduct.nutritional_info}</p>
                        </div>

                        {selectedProduct.rating && (
                          <div className="mt-4">
                            {renderStarRating(selectedProduct.rating)}
                          </div>
                        )}

                        <div className="mt-6">
                          {selectedProduct.stock && selectedProduct.stock > 0 ? (
                            <Button
                              className="w-full bg-brand-600 text-white"
                              onClick={() => handleAddToCart(selectedProduct)}
                            >
                              Add to Cart
                            </Button>
                          ) : (
                            <Button
                              className="w-full bg-gray-400 text-white cursor-not-allowed"
                              disabled
                            >
                              Out of Stock
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </DialogContent>
            </Dialog>
          )}
        </div>
      </section>

      {/* Product Info */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl font-bold mb-8 text-center font-playfair"
            >
              Why Choose Natural Puff
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-cream-100 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-xl font-bold mb-4 font-playfair">Quality Ingredients</h3>
                <p className="text-brand-700">
                  We source only the highest grade makhana and pair them with premium ingredients. 
                  No artificial colors, flavors, or preservatives - ever.
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-cream-100 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-xl font-bold mb-4 font-playfair">Nutritional Benefits</h3>
                <p className="text-brand-700">
                  Each serving is packed with protein, fiber, and essential nutrients. 
                  Our makhana snacks are naturally gluten-free and low in calories.
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-cream-100 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-xl font-bold mb-4 font-playfair">Artisanal Roasting</h3>
                <p className="text-brand-700">
                  Our special roasting process ensures perfect texture and flavor development 
                  while preserving nutritional benefits.
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-cream-100 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-xl font-bold mb-4 font-playfair">Sustainable Packaging</h3>
                <p className="text-brand-700">
                  We're committed to minimizing our environmental impact with 
                  eco-friendly packaging materials that keep your snacks fresh.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-brand-600 text-white">
        <div className="container-custom">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-playfair">Looking for Wholesale Opportunities?</h2>
            <p className="text-lg mb-8">
              We offer special pricing for bulk orders and retail partnerships. 
              Get in touch with our team to discuss how we can work together.
            </p>
            <Button 
              className="bg-gold-500 hover:bg-gold-600 text-brand-800 px-8 py-6 text-lg"
              onClick={() => setShowWholesaleForm(true)}
            >
              Contact Sales Team
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Wholesale Form Dialog */}
      <Dialog open={showWholesaleForm} onOpenChange={setShowWholesaleForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-playfair text-brand-800">Wholesale Inquiry</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleWholesaleSubmit} className="space-y-6 mt-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-brand-700 mb-1">
                Full Name*
              </label>
              <Input
                id="name"
                name="name"
                value={wholesaleFormData.name}
                onChange={handleWholesaleFormChange}
                placeholder="Your full name"
                className="w-full"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand-700 mb-1">
                Email Address*
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={wholesaleFormData.email}
                onChange={handleWholesaleFormChange}
                placeholder="Your email address"
                className="w-full"
                required
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-brand-700 mb-1">
                Phone Number*
              </label>
              <Input
                id="phone"
                name="phone"
                value={wholesaleFormData.phone}
                onChange={handleWholesaleFormChange}
                placeholder="Your phone number"
                className="w-full"
                required
              />
            </div>
            
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-brand-700 mb-1">
                Company Name*
              </label>
              <Input
                id="company"
                name="company"
                value={wholesaleFormData.company}
                onChange={handleWholesaleFormChange}
                placeholder="Your company name"
                className="w-full"
                required
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-brand-700 mb-1">
                Message*
              </label>
              <Textarea
                id="message"
                name="message"
                value={wholesaleFormData.message}
                onChange={handleWholesaleFormChange}
                placeholder="Tell us about your business and requirements"
                className="w-full min-h-[100px]"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-brand-600 hover:bg-brand-700 text-white py-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Submit Inquiry'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
