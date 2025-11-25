import { Product, ProductFilters, Sale, SaleItem } from '../types';
import { supabase } from './supabaseClient';

// Helper to map DB snake_case to App camelCase
const mapProductFromDB = (data: any): Product => ({
  id: data.id,
  brand: data.brand,
  model: data.model,
  description: data.description,
  stock: Number(data.stock),
  price: Number(data.price),
  category: data.category,
  imageUrl: data.image_url
});

const mapSaleFromDB = (data: any): Sale => ({
  id: data.id,
  date: data.date,
  totalAmount: Number(data.total_amount),
  items: data.items // JSONB auto parses to object/array
});

// Initial mock data used for seeding if DB is empty
const INITIAL_PRODUCTS = [
  {
    id: 'KMP-001',
    brand: 'Logitech',
    model: 'MX Master 3S',
    description: 'Ratón inalámbrico de alto rendimiento, desplazamiento ultrarrápido, 8K DPI.',
    stock: 45,
    price: 99.99,
    category: 'Periféricos',
    imageUrl: 'https://picsum.photos/400/400?random=1'
  },
  {
    id: 'KMP-002',
    brand: 'Keychron',
    model: 'K2 Pro',
    description: 'Teclado mecánico inalámbrico, programable QMK/VIA.',
    stock: 12,
    price: 119.00,
    category: 'Teclados',
    imageUrl: 'https://picsum.photos/400/400?random=2'
  },
  {
    id: 'KMP-003',
    brand: 'Dell',
    model: 'UltraSharp U2723QE',
    description: 'Monitor Hub USB-C 4K de 27 pulgadas, tecnología IPS Black.',
    stock: 8,
    price: 629.99,
    category: 'Monitores',
    imageUrl: 'https://picsum.photos/400/400?random=3'
  },
  {
    id: 'KMP-004',
    brand: 'Apple',
    model: 'MacBook Pro 14"',
    description: 'Chip M3 Pro, 18GB de memoria, 512GB SSD, Negro Espacial.',
    stock: 5,
    price: 1999.00,
    category: 'Portátiles',
    imageUrl: 'https://picsum.photos/400/400?random=4'
  },
  {
    id: 'KMP-005',
    brand: 'NVIDIA',
    model: 'GeForce RTX 4080',
    description: '16GB GDDR6X, arquitectura Ada Lovelace.',
    stock: 0,
    price: 1199.00,
    category: 'Componentes',
    imageUrl: 'https://picsum.photos/400/400?random=5'
  },
  {
    id: 'KMP-006',
    brand: 'Sony',
    model: 'WH-1000XM5',
    description: 'Auriculares inalámbricos con cancelación de ruido, batería de 30 horas.',
    stock: 25,
    price: 348.00,
    category: 'Audio',
    imageUrl: 'https://picsum.photos/400/400?random=6'
  }
];

class InventoryService {
  
  // Cache for brands and categories to reduce DB hits for filters
  private brandsCache: Set<string> = new Set();
  private categoriesCache: Set<string> = new Set();

  constructor() {
    this.seedIfNeeded();
  }

  private async seedIfNeeded() {
    // Check if products exist, if not, seed.
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (!error && count === 0) {
      console.log("Seeding Database...");
      const productsToInsert = INITIAL_PRODUCTS.map(p => ({
        id: p.id,
        brand: p.brand,
        model: p.model,
        description: p.description,
        stock: p.stock,
        price: p.price,
        category: p.category,
        image_url: p.imageUrl
      }));
      
      await supabase.from('products').insert(productsToInsert);
    }
  }

  async getAll(filters?: ProductFilters): Promise<Product[]> {
    let query = supabase.from('products').select('*').order('created_at', { ascending: false });

    if (filters) {
      if (filters.search) {
        // Simple search on model or brand or description
        // Supabase 'or' syntax: brand.ilike.%q%,model.ilike.%q%
        const q = `%${filters.search}%`;
        query = query.or(`brand.ilike.${q},model.ilike.${q},id.ilike.${q},description.ilike.${q}`);
      }
      if (filters.brand) {
        query = query.eq('brand', filters.brand);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }
    }

    const { data, error } = await query;
    if (error) {
        console.error("Error fetching products:", error);
        return [];
    }

    const products = data.map(mapProductFromDB);
    
    // Update caches
    products.forEach(p => {
        this.brandsCache.add(p.brand);
        this.categoriesCache.add(p.category);
    });

    return products;
  }

  async getById(id: string): Promise<Product | undefined> {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error || !data) return undefined;
    return mapProductFromDB(data);
  }

  async add(product: Product): Promise<void> {
    const { error } = await supabase.from('products').insert({
        id: product.id,
        brand: product.brand,
        model: product.model,
        description: product.description,
        stock: product.stock,
        price: product.price,
        category: product.category,
        image_url: product.imageUrl
    });
    if (error) throw error;
  }

  async update(product: Product): Promise<void> {
    const { error } = await supabase.from('products').update({
        brand: product.brand,
        model: product.model,
        description: product.description,
        stock: product.stock,
        price: product.price,
        category: product.category,
        image_url: product.imageUrl
    }).eq('id', product.id);
    if (error) throw error;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  }

  getBrands(): string[] {
    return Array.from(this.brandsCache).sort();
  }

  getCategories(): string[] {
    return Array.from(this.categoriesCache).sort();
  }

  // Sales Methods

  async getSales(): Promise<Sale[]> {
    const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('date', { ascending: false });
    
    if (error) {
        console.error("Error fetching sales:", error);
        return [];
    }
    return data.map(mapSaleFromDB);
  }

  async processSale(items: SaleItem[]): Promise<Sale> {
    // 1. Validate Stock (and get current stock)
    const productIds = items.map(i => i.productId);
    const { data: productsInDb, error: fetchError } = await supabase
        .from('products')
        .select('id, stock, model')
        .in('id', productIds);
    
    if (fetchError || !productsInDb) throw new Error('Error verificando stock');

    for (const item of items) {
        const product = productsInDb.find(p => p.id === item.productId);
        if (!product) throw new Error(`Producto ${item.productName} no encontrado`);
        if (Number(product.stock) < item.quantity) throw new Error(`Stock insuficiente para ${item.productName}`);
    }

    // 2. Deduct Stock (One by one for simplicity in this demo, real world use RPC or Transaction)
    for (const item of items) {
        const product = productsInDb.find(p => p.id === item.productId)!;
        const newStock = Number(product.stock) - item.quantity;
        await supabase.from('products').update({ stock: newStock }).eq('id', item.productId);
    }

    // 3. Create Sale Record
    const totalAmount = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const saleId = `SALE-${Date.now()}`;
    const saleDate = new Date().toISOString();
    
    const { data, error } = await supabase.from('sales').insert({
        id: saleId,
        date: saleDate,
        total_amount: totalAmount,
        items: items
    }).select().single();

    if (error) throw error;
    return mapSaleFromDB(data);
  }

  // Real-time Subscriptions
  subscribeToChanges(callback: () => void) {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          console.log('Product change received!', payload);
          callback();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sales' },
        (payload) => {
          console.log('Sale change received!', payload);
          callback();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const inventoryService = new InventoryService();