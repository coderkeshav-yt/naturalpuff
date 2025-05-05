
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageIcon, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/components/ui/use-toast';
import { Product } from '@/types/product';

// Generate a unique ID for uploads
const generateUniqueId = () => {
  return uuidv4();
};

type FormErrors = Partial<Record<keyof Product, string>>;

interface ProductFormProps {
  product: Product | null;
  categories: string[];
  onSave: (product: Product) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  categories,
  onSave,
  onCancel,
  isSubmitting
}) => {
  const { toast } = useToast();
  const [activeProduct, setActiveProduct] = useState<Product | null>(product);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleProductChange = (field: keyof Product, value: string | number) => {
    setActiveProduct(prev => {
      if (!prev) return prev;
      
      // Ensure price and stock are properly converted to numbers
      if (field === 'price') {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        return { ...prev, [field]: numValue };
      } else if (field === 'stock') {
        const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
        return { ...prev, [field]: numValue };
      }
      
      return { ...prev, [field]: value };
    });
  };

  const validateForm = (product: Product): FormErrors => {
    const errors: FormErrors = {};
    if (!product.name) errors.name = 'Name is required';
    if (!product.description) errors.description = 'Description is required';
    if (product.price === undefined || product.price === null || product.price < 0) errors.price = 'Price must be a non-negative number';
    if (!product.image_url) errors.image_url = 'Image URL is required';
    if (product.stock === undefined || product.stock === null || product.stock < 0) errors.stock = 'Stock must be a non-negative integer';
    if (!product.category) errors.category = 'Category is required';
    return errors;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile || !activeProduct) {
      toast({ title: "Error", description: "Please select an image to upload." });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create a FormData object to upload the image
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('filename', `product_image_${generateUniqueId()}_${selectedFile.name}`);
      
      // Use a mock URL for now - normally this would be uploaded to a storage service
      const mockImageUrl = `https://picsum.photos/seed/${Math.random()}/800/600`;
      
      // In a real implementation, you would upload to a storage service
      // and get back a URL. Here, we're simulating that with a timeout
      setTimeout(() => {
        // Update the product with the new image URL
        handleProductChange('image_url', mockImageUrl);
        
        toast({ title: "Success", description: "Image uploaded successfully." });
        setIsUploading(false);
        setUploadProgress(100);
        setSelectedFile(null);
      }, 1000);
    } catch (error) {
      toast({ title: "Error", description: "Failed to upload image." });
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async () => {
    if (!activeProduct) return;

    const errors = validateForm(activeProduct);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast({
        title: "Error!",
        description: "Please correct the form errors.",
      });
      return;
    }

    try {
      await onSave(activeProduct);
    } catch (error: any) {
      toast({
        title: "Error!",
        description: error.message,
      });
    }
  };

  if (!activeProduct) return null;

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          type="text"
          id="name"
          value={activeProduct?.name || ''}
          onChange={(e) => handleProductChange('name', e.target.value)}
          disabled={isSubmitting}
        />
        {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={activeProduct?.description || ''}
          onChange={(e) => handleProductChange('description', e.target.value)}
          disabled={isSubmitting}
        />
        {formErrors.description && <p className="text-red-500 text-sm">{formErrors.description}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="price">Price</Label>
        <Input
          type="number"
          id="price"
          value={activeProduct?.price?.toString() || ''}
          onChange={(e) => handleProductChange('price', parseFloat(e.target.value))}
          disabled={isSubmitting}
        />
        {formErrors.price && <p className="text-red-500 text-sm">{formErrors.price}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="stock">Stock</Label>
        <Input
          type="number"
          id="stock"
          value={activeProduct?.stock?.toString() || ''}
          onChange={(e) => handleProductChange('stock', parseInt(e.target.value, 10))}
          disabled={isSubmitting}
        />
        {formErrors.stock && <p className="text-red-500 text-sm">{formErrors.stock}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="category">Category</Label>
        <div className="flex items-center">
          <Select 
            onValueChange={(value) => handleProductChange('category', value)} 
            defaultValue={activeProduct?.category || 'General'}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {formErrors.category && <p className="text-red-500 text-sm">{formErrors.category}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="image_url">Image URL</Label>
        <div className="flex items-center space-x-4">
          <Input
            type="text"
            id="image_url"
            className="flex-grow"
            value={activeProduct?.image_url || ''}
            onChange={(e) => handleProductChange('image_url', e.target.value)}
            disabled={isSubmitting || isUploading}
          />
          <label htmlFor="upload-image">
            <Input
              type="file"
              id="upload-image"
              className="hidden"
              onChange={handleFileSelect}
              disabled={isSubmitting || isUploading}
            />
            <Button variant="secondary" asChild disabled={isSubmitting || isUploading}>
              <label htmlFor="upload-image" className="cursor-pointer">
                {isUploading ? 'Uploading...' : 'Choose File'}
              </label>
            </Button>
          </label>
          {selectedFile && (
            <Button variant="secondary" onClick={handleImageUpload} disabled={isSubmitting || isUploading}>
              <ImageIcon className="w-4 h-4 mr-2" />
              Upload
            </Button>
          )}
        </div>
        {formErrors.image_url && <p className="text-red-500 text-sm">{formErrors.image_url}</p>}
        {isUploading && (
          <progress value={uploadProgress} max="100" className="w-full">
            {uploadProgress}%
          </progress>
        )}
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save'
          )}
        </Button>
      </div>
    </div>
  );
};

export default ProductForm;
