export interface Product {
  id: string;
  brand: string;
  model: string;
  description: string;
  stock: number;
  price: number;
  imageUrl: string;
  category: string;
}

export interface ProductFilters {
  search: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  category?: string;
}

export enum ViewMode {
  GRID = 'GRID',
  TABLE = 'TABLE'
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  totalAmount: number;
  date: string;
}

export type AppTab = 'INVENTORY' | 'DASHBOARD' | 'SALES';
