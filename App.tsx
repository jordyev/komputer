import React, { useState, useEffect, useMemo } from 'react';
import { Product, ProductFilters, ViewMode, Sale, SaleItem, AppTab } from './types';
import { inventoryService } from './services/inventoryService';
import { authService, User } from './services/authService';
import ProductModal from './components/ProductModal';
import DashboardView from './components/DashboardView';
import SalesView from './components/SalesView';
import LoginView from './components/LoginView';
import ImagePreviewModal from './components/ImagePreviewModal';
import { 
  LayoutGrid, 
  List, 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  Package, 
  DollarSign, 
  AlertTriangle,
  Menu,
  Filter,
  Sun,
  Moon,
  LogOut,
  X,
  RotateCcw,
  Loader2,
  ZoomIn
} from 'lucide-react';

// Placeholder logo matching the black/yellow brand colors
// Replace this URL with your actual hosted logo URL
export const LOGO_URL = "https://placehold.co/400x400/000000/FACC15?text=K&font=roboto";

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // App State
  const [activeTab, setActiveTab] = useState<AppTab>('INVENTORY');
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.TABLE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Image Preview State
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  
  // Delete Modal State
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Theme State
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Check Auth on Mount
  useEffect(() => {
    const initAuth = async () => {
        try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
        } catch (e) {
            console.error("Auth init error", e);
        } finally {
            setAuthLoading(false);
        }
    };
    initAuth();
  }, []);

  // Check screen size for sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Apply Theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);
  
  // Filters
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
  });

  // Load Data
  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
        const productData = await inventoryService.getAll(filters);
        const salesData = await inventoryService.getSales();
        setProducts(productData);
        setSales(salesData);
    } catch (error) {
        console.error("Error loading data:", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, user]); // Re-fetch when filters change or user logs in

  // Real-time Subscription
  useEffect(() => {
    if (!user) return;
    
    // Subscribe to DB changes to auto-update UI
    const unsubscribe = inventoryService.subscribeToChanges(() => {
        // Debounce or just re-fetch
        fetchData(); 
    });

    return () => {
        unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Auth Actions
  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    if (window.confirm('¿Cerrar sesión?')) {
        try {
            await authService.logout();
        } catch (error) {
            console.error("Error signing out:", error);
        } finally {
            setUser(null);
            if (window.innerWidth < 768) setIsSidebarOpen(false);
        }
    }
  };

  // Actions
  const handleAdd = () => {
    setEditingProduct(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const openDeleteModal = (product: Product) => {
    setProductToDelete(product);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    
    setIsDeleting(true);
    try {
      await inventoryService.delete(productToDelete.id);
      // Not need to call fetchData manually, subscription will handle it
      setProductToDelete(null); // Close modal
    } catch (e) {
      console.error(e);
      alert("Error al eliminar el producto. Inténtelo de nuevo.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async (product: Product) => {
    try {
        if (editingProduct) {
            await inventoryService.update(product);
        } else {
            await inventoryService.add(product);
        }
        // fetchData is called by subscription
    } catch (e) {
        console.error(e);
        alert("Error al guardar el producto");
    }
  };

  const handleProcessSale = async (items: SaleItem[]) => {
    try {
      await inventoryService.processSale(items);
      // fetchData is called by subscription
      setActiveTab('DASHBOARD'); // Redirect to dashboard to see the sale
    } catch (error: any) {
      alert(error.message || 'Error al procesar la venta');
    }
  };

  // Stats for Inventory Header
  const stats = useMemo(() => {
    const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
    const totalValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
    const lowStock = products.filter(p => p.stock < 10).length;
    return { totalStock, totalValue, lowStock };
  }, [products]);

  if (authLoading) {
     return <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
     </div>;
  }

  if (!user) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  // Renderers
  const renderProductGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map(product => (
        <div key={product.id} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow group">
          <div 
            className="relative aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-zoom-in group-hover:opacity-95 transition-opacity"
            onClick={() => setPreviewProduct(product)}
            title="Click para ver detalles y hacer zoom"
          >
             <img src={product.imageUrl} alt={product.model} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
             <div className="absolute top-2 right-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm pointer-events-none">
                {product.brand}
             </div>
             {/* Hover Overlay Icon */}
             <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 pointer-events-none">
                <div className="bg-white/90 dark:bg-black/70 p-2 rounded-full backdrop-blur-sm">
                    <ZoomIn className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
             </div>

             {product.stock === 0 && (
                 <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                     <span className="text-white font-bold bg-red-500 px-3 py-1 rounded-full text-sm">Sin Stock</span>
                 </div>
             )}
          </div>
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-white line-clamp-1">{product.model}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{product.category}</p>
                </div>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">S/. {product.price.toFixed(2)}</span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 mb-4 h-8">{product.description}</p>
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${product.stock < 10 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                    Stock: {product.stock}
                </span>
                <div className="flex gap-1">
                    <button onClick={() => handleEdit(product)} className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => openDeleteModal(product)} className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderProductTable = () => (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Producto</th>
              <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Categoría</th>
              <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Stock</th>
              <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Precio</th>
              <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div 
                        className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 cursor-zoom-in relative group"
                        onClick={() => setPreviewProduct(product)}
                        title="Ver imagen"
                    >
                        <img src={product.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <ZoomIn className="w-4 h-4 text-white" />
                        </div>
                    </div>
                    <div>
                        <div className="font-medium text-slate-900 dark:text-white">{product.model}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{product.brand} • {product.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{product.category}</td>
                <td className="px-6 py-4">
                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.stock < 5 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : product.stock < 10 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}>
                        {product.stock} unidades
                    </span>
                </td>
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">S/. {product.price.toFixed(2)}</td>
                <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(product)} className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => openDeleteModal(product)} className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </td>
              </tr>
            ))}
             {products.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                        {loading ? 'Cargando...' : 'No se encontraron productos.'}
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-slate-900/50 z-20 md:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative z-30 h-full
        bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 
        flex flex-col transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-20'}
      `}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 h-20">
            <div className="w-10 h-10 bg-slate-900 dark:bg-black rounded-lg flex items-center justify-center shrink-0 overflow-hidden border border-slate-200 dark:border-slate-800">
                <img src={LOGO_URL} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div className={`transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
                <h1 className="font-bold text-slate-800 dark:text-white leading-tight whitespace-nowrap">KOMPUTER SAC</h1>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Panel de Admin</p>
            </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <button 
                onClick={() => { setActiveTab('INVENTORY'); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'INVENTORY' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                title="Inventario"
            >
                <Package className="w-5 h-5 shrink-0" />
                <span className={`transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>Inventario</span>
            </button>
            <button 
                onClick={() => { setActiveTab('DASHBOARD'); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'DASHBOARD' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                title="Tablero"
            >
                <LayoutGrid className="w-5 h-5 shrink-0" />
                <span className={`transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>Tablero</span>
            </button>
            <button 
                onClick={() => { setActiveTab('SALES'); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'SALES' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                title="Ventas"
            >
                <DollarSign className="w-5 h-5 shrink-0" />
                <span className={`transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>Ventas</span>
            </button>
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
             {/* User Info */}
             <div className={`mb-2 px-2 text-sm transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Conectado como:</p>
                <p className="font-semibold text-slate-800 dark:text-white truncate" title={user.email}>{user.email}</p>
             </div>

            <button 
                onClick={toggleTheme}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${isSidebarOpen ? 'justify-start' : 'justify-center'} text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800`}
                title={darkMode ? "Modo Claro" : "Modo Oscuro"}
            >
                {darkMode ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />}
                <span className={`transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
                    {darkMode ? "Modo Claro" : "Modo Oscuro"}
                </span>
            </button>
            
            <button 
                type="button"
                onClick={handleLogout}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${isSidebarOpen ? 'justify-start' : 'justify-center'} text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20`}
                title="Cerrar Sesión"
            >
                <LogOut className="w-5 h-5 shrink-0" />
                <span className={`transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>Cerrar Sesión</span>
            </button>

            <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="hidden md:flex w-full items-center justify-center p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors mt-2"
            >
                {isSidebarOpen ? <Menu className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Top Header */}
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 shrink-0 transition-colors duration-300">
            <div className="flex items-center gap-4 flex-1">
                 <button className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" onClick={() => setIsSidebarOpen(true)}>
                    <Menu className="w-6 h-6" />
                 </button>
                 
                <div className="relative w-full max-w-md hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Buscar por ID, Marca, Modelo..." 
                        className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 border rounded-lg text-sm outline-none transition-all dark:text-white dark:placeholder-slate-500"
                        value={filters.search}
                        onChange={(e) => {
                            setFilters(prev => ({...prev, search: e.target.value}));
                            if (activeTab !== 'INVENTORY') setActiveTab('INVENTORY'); // Auto switch if searching via top bar
                        }}
                    />
                </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
                {activeTab === 'INVENTORY' && (
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                        <button 
                            onClick={() => setViewMode(ViewMode.TABLE)}
                            className={`p-1.5 rounded-md transition-all ${viewMode === ViewMode.TABLE ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setViewMode(ViewMode.GRID)}
                            className={`p-1.5 rounded-md transition-all ${viewMode === ViewMode.GRID ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {activeTab === 'INVENTORY' && (
                    <button 
                        onClick={handleAdd}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium shadow-lg shadow-indigo-200 dark:shadow-none transition-all transform active:scale-95 text-sm sm:text-base"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Agregar Producto</span>
                        <span className="sm:hidden">Nuevo</span>
                    </button>
                )}
            </div>
        </header>

        {/* Mobile Search Bar (Visible only on small screens) */}
        <div className="sm:hidden px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                    type="text" 
                    placeholder="Buscar..." 
                    className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 border rounded-lg text-sm outline-none transition-all dark:text-white dark:placeholder-slate-500"
                    value={filters.search}
                    onChange={(e) => {
                        setFilters(prev => ({...prev, search: e.target.value}));
                        if (activeTab !== 'INVENTORY') setActiveTab('INVENTORY');
                    }}
                />
            </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8">
            
            {loading && activeTab === 'INVENTORY' && products.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-slate-400 dark:text-slate-600">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
                </div>
            ) : (
                <>
                    {activeTab === 'INVENTORY' && (
                        <>
                             {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4 transition-colors">
                                    <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <Package className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Artículos</p>
                                        <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.totalStock}</p>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4 transition-colors">
                                    <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                        <DollarSign className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Valor Total</p>
                                        <p className="text-2xl font-bold text-slate-800 dark:text-white">S/. {stats.totalValue.toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4 transition-colors">
                                    <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                        <AlertTriangle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Alertas Stock Bajo</p>
                                        <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.lowStock}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Filter Bar (Simplified) */}
                            <div className="flex flex-wrap items-center gap-3">
                                <button className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-default">
                                    <Filter className="w-4 h-4" />
                                    Filtrar
                                </button>
                                <button 
                                    onClick={() => setFilters({ search: '' })}
                                    className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg text-sm font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors flex items-center gap-2"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    Mostrar Todo
                                </button>
                                {inventoryService.getBrands().map(brand => (
                                    <button 
                                        key={brand}
                                        onClick={() => setFilters(prev => ({...prev, brand: prev.brand === brand ? undefined : brand}))}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${filters.brand === brand ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-700 dark:text-indigo-300' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                    >
                                        {brand}
                                    </button>
                                ))}
                            </div>

                            {/* Products Display */}
                            {viewMode === ViewMode.TABLE ? renderProductTable() : renderProductGrid()}
                        </>
                    )}

                    {activeTab === 'DASHBOARD' && (
                        <DashboardView sales={sales} products={products} />
                    )}

                    {activeTab === 'SALES' && (
                        <SalesView products={products} onProcessSale={handleProcessSale} />
                    )}
                </>
            )}
        </div>
      </main>

      <ProductModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
        product={editingProduct}
      />

      <ImagePreviewModal
        product={previewProduct}
        onClose={() => setPreviewProduct(null)}
      />

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col transition-colors duration-300 animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
                <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trash2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">¿Eliminar Producto?</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                        Estás a punto de eliminar <span className="font-semibold text-slate-800 dark:text-white">{productToDelete.model}</span>. Esta acción no se puede deshacer.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button 
                            onClick={() => setProductToDelete(null)}
                            disabled={isDeleting}
                            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 shadow-lg shadow-red-200 dark:shadow-none transition-all flex items-center gap-2"
                        >
                            {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isDeleting ? 'Eliminando...' : 'Eliminar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;