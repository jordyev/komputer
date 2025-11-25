import React, { useState, useMemo } from 'react';
import { Product, SaleItem } from '../types';
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, PackageX, FileText, User, Users } from 'lucide-react';
import QuotationModal from './QuotationModal';

interface SalesViewProps {
  products: Product[];
  onProcessSale: (items: SaleItem[]) => void;
}

const SalesView: React.FC<SalesViewProps> = ({ products, onProcessSale }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  
  // Quotation State
  const [isQuoteMode, setIsQuoteMode] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: '',
    document: '',
    contact: ''
  });

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category)));
    return ['Todas', ...cats];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = 
        p.model.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Todas' || p.category === selectedCategory;
      const inStock = p.stock > 0;
      return matchesSearch && matchesCategory && inStock;
    });
  }, [products, searchTerm, selectedCategory]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev; // Cannot exceed stock
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        return [...prev, { 
          productId: product.id, 
          productName: `${product.brand} ${product.model}`, 
          price: product.price, 
          quantity: 1 
        }];
      }
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.productId === productId) {
          const product = products.find(p => p.id === productId);
          if (!product) return item;
          
          const newQuantity = item.quantity + delta;
          if (newQuantity < 1) return item;
          if (newQuantity > product.stock) return item;
          
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    if (isQuoteMode) {
        if (!customerData.name.trim()) {
            alert("Por favor ingrese el nombre del cliente para la cotización.");
            return;
        }
        setShowQuoteModal(true);
    } else {
        if (window.confirm(`¿Confirmar venta por S/. ${totalAmount.toFixed(2)}?`)) {
            onProcessSale(cart);
            setCart([]);
        }
    }
  };

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setCustomerData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)] gap-6">
      {/* Left: Product Catalog */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        {/* Search & Filter Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar productos..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 border rounded-lg text-sm outline-none transition-all dark:text-white dark:placeholder-slate-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 border rounded-lg text-sm outline-none cursor-pointer dark:text-white"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <button 
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all text-left flex flex-col group h-full"
              >
                <div className="aspect-square bg-slate-100 dark:bg-slate-700 rounded-md mb-3 overflow-hidden">
                  <img src={product.imageUrl} alt={product.model} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{product.model}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{product.brand}</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">S/. {product.price.toFixed(2)}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded">Stock: {product.stock}</span>
                </div>
              </button>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
                <PackageX className="w-12 h-12 mb-2 opacity-50" />
                <p>No se encontraron productos disponibles</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right: Cart / Quote Panel */}
      <div className="w-full lg:w-96 flex flex-col bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        
        {/* Toggle Mode */}
        <div className="flex border-b border-slate-100 dark:border-slate-800">
            <button 
                onClick={() => setIsQuoteMode(false)}
                className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${!isQuoteMode ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
                <ShoppingCart className="w-4 h-4" /> Venta Rápida
            </button>
            <button 
                onClick={() => setIsQuoteMode(true)}
                className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${isQuoteMode ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
                <FileText className="w-4 h-4" /> Cotización
            </button>
        </div>

        {/* Customer Form (Only in Quote Mode) */}
        {isQuoteMode && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 space-y-3 animate-in slide-in-from-top-2 duration-200">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    <User className="w-3 h-3" /> Datos del Cliente
                </div>
                <input 
                    name="name"
                    value={customerData.name}
                    onChange={handleCustomerChange}
                    placeholder="Nombre / Razón Social *"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-indigo-500 dark:text-white"
                />
                <div className="flex gap-2">
                    <input 
                        name="document"
                        value={customerData.document}
                        onChange={handleCustomerChange}
                        placeholder="DNI / RUC"
                        className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-indigo-500 dark:text-white"
                    />
                    <input 
                        name="contact"
                        value={customerData.contact}
                        onChange={handleCustomerChange}
                        placeholder="Tel / Email"
                        className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-indigo-500 dark:text-white"
                    />
                </div>
            </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.map(item => (
            <div key={item.productId} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
              <div className="flex-1 min-w-0 mr-3">
                <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{item.productName}</h4>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">S/. {item.price.toFixed(2)}</p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm">
                  <button 
                    onClick={() => updateQuantity(item.productId, -1)}
                    className="p-1 text-slate-500 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-l-lg"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-semibold w-6 text-center text-slate-700 dark:text-slate-200">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.productId, 1)}
                    className="p-1 text-slate-500 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-r-lg"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <button 
                  onClick={() => removeFromCart(item.productId)}
                  className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600 py-10">
              {isQuoteMode ? <FileText className="w-12 h-12 mb-3 opacity-20" /> : <ShoppingCart className="w-12 h-12 mb-3 opacity-20" />}
              <p className="text-sm">
                  {isQuoteMode ? 'La cotización está vacía' : 'El carrito está vacío'}
              </p>
              <p className="text-xs mt-1">Selecciona productos para comenzar</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
            <span className="font-medium text-slate-900 dark:text-white">S/. {totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-lg font-bold">
            <span className="text-slate-800 dark:text-white">Total</span>
            <span className="text-indigo-600 dark:text-indigo-400">S/. {totalAmount.toFixed(2)}</span>
          </div>
          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className={`w-full py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2 ${isQuoteMode ? 'bg-slate-800 hover:bg-slate-700 text-white shadow-slate-200' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'}`}
          >
            {isQuoteMode ? (
                <>
                    <FileText className="w-5 h-5" /> Generar Ficha
                </>
            ) : (
                <>
                    <CreditCard className="w-5 h-5" /> Confirmar Venta
                </>
            )}
          </button>
        </div>
      </div>
      
      {/* Printable Quote Modal */}
      <QuotationModal 
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        items={cart}
        customer={customerData}
        total={totalAmount}
      />
    </div>
  );
};

export default SalesView;