
import React from 'react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import ProductForm from './ProductForm';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/product';

interface ProductDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  categories: string[];
  onSave: (product: Product) => Promise<void>;
  isSubmitting: boolean;
}

const ProductDrawer: React.FC<ProductDrawerProps> = ({
  open,
  onOpenChange,
  product,
  categories,
  onSave,
  isSubmitting
}) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{product?.id === 0 ? 'Create New Product' : 'Edit Product'}</DrawerTitle>
          <DrawerDescription>
            {product?.id === 0
              ? 'Fill out the form below to create a new product.'
              : 'Modify the product details and save.'}
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-6 pb-6">
          <ProductForm
            product={product}
            categories={categories}
            onSave={onSave}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
          />
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ProductDrawer;
