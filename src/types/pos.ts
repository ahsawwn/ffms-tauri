export interface CartAddon { id: string; name: string; price: number; inventoryItemId?: string; requiredQuantity?: number; }
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  note: string;
  variantId?: string;
  variantName?: string;
  variantPriceDelta?: number;
  addons?: CartAddon[];
}
export interface OrderMetadata {
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'PICKUP' | 'DELIVERY';
  tableNumber?: string;
  serviceCharge?: number;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
}
