
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coupon } from '@/types/product';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';

interface CouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (couponData: Partial<Coupon>) => Promise<void>;
  isSubmitting: boolean;
}

const CouponDialog = ({ open, onOpenChange, onSave, isSubmitting }: CouponDialogProps) => {
  const { user } = useAuth();
  
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(10);
  const [isActive, setIsActive] = useState(true);
  const [expiryDate, setExpiryDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    // Validate inputs
    if (!code.trim()) {
      setError('Coupon code is required');
      return;
    }
    
    if (discountPercent <= 0 || discountPercent > 100) {
      setError('Discount must be between 1 and 100 percent');
      return;
    }
    
    setError(null);

    // Prepare coupon data
    const couponData: Partial<Coupon> = {
      code: code.trim().toUpperCase(),
      discount_percent: discountPercent,
      is_active: isActive,
      created_by: user?.id || null,
    };

    // Add expiry date if provided
    if (expiryDate) {
      couponData.expires_at = new Date(expiryDate).toISOString();
    }

    try {
      await onSave(couponData);
      
      // Reset form
      setCode('');
      setDiscountPercent(10);
      setIsActive(true);
      setExpiryDate('');
    } catch (error) {
      console.error('Error saving coupon:', error);
      setError('Failed to save coupon');
    }
  };

  const generateRandomCode = () => {
    const charset = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Omitted confusable characters
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setCode(result);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Coupon</DialogTitle>
          <DialogDescription>
            Add a new discount coupon code for your customers.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          {error && <div className="text-red-500 text-sm">{error}</div>}
          
          <div className="space-y-1">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label htmlFor="code">Coupon Code</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="SUMMER20"
                  className="uppercase"
                  maxLength={10}
                />
              </div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={generateRandomCode}
                className="h-10"
              >
                Generate
              </Button>
            </div>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="discount">Discount Percentage</Label>
            <div className="flex items-center gap-2">
              <Input
                id="discount"
                type="number"
                min="1"
                max="100"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(parseInt(e.target.value) || 0)}
              />
              <span className="text-lg">%</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="expiry">Expiry Date (Optional)</Label>
            <Input
              id="expiry"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]} // Prevent past dates
            />
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Switch 
              id="active" 
              checked={isActive} 
              onCheckedChange={setIsActive} 
            />
            <Label htmlFor="active">Active</Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSubmitting || !code.trim() || discountPercent <= 0}
            className="bg-brand-600 hover:bg-brand-700"
          >
            {isSubmitting ? 'Creating...' : 'Create Coupon'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CouponDialog;
