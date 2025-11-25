import React, { useMemo } from 'react';
import { Sale, Product } from '../types';
import { DollarSign, TrendingUp, ShoppingBag, Calendar, ArrowUpRight, Package } from 'lucide-react';

interface DashboardViewProps {
  sales: Sale[];
  products: Product[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ sales, products }) => {
  
  const stats = useMemo(() => {
    const totalRevenue = sales.reduce((acc, sale) => acc + sale.totalAmount, 0);
    const totalOrders = sales.length;
    
    // Count total items sold
    const totalItemsSold = sales.reduce((acc, sale) => acc + sale.items.reduce((s, i) => s + i.quantity, 0), 0);

    // Sales by Category
    const categorySales: Record<string, number> = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        // Find product category (might be slow for large datasets, acceptable for mock)
        const product = products.find(p => p.id === item.productId);
        const category = product?.category || 'Otros';
        categorySales[category] = (categorySales[category] || 0) + (item.price * item.quantity);
      });
    });

    // Find top selling category
    const topCategory = Object.entries(categorySales).sort((a, b) => b[1] - a[1])[0];

    return {
      totalRevenue,
      totalOrders,
      totalItemsSold,
      categorySales,
      topCategory: topCategory ? topCategory[0] : 'N/A'
    };
  }, [sales, products]);

  // Determine max value for chart scaling
  const maxCategorySale = Math.max(...(Object.values(stats.categorySales) as number[]), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Revenue */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +12%
            </span>
          </div>
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Ingresos Totales</h3>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">S/. {stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>

        {/* Card 2: Orders */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total de Pedidos</h3>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.totalOrders}</p>
        </div>

        {/* Card 3: Items Sold */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Package className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Productos Vendidos</h3>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.totalItemsSold}</p>
        </div>

        {/* Card 4: Top Category */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400">
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Categoría Top</h3>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.topCategory}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Ventas por Categoría</h3>
          <div className="space-y-4">
            {Object.entries(stats.categorySales).map(([category, amount]) => (
              <div key={category} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{category}</span>
                  <span className="text-slate-500 dark:text-slate-400">S/. {(amount as number).toLocaleString()}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${((amount as number) / maxCategorySale) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {Object.keys(stats.categorySales).length === 0 && (
                <p className="text-slate-400 dark:text-slate-500 text-sm text-center py-8">No hay datos de ventas disponibles.</p>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col transition-colors">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Actividad Reciente</h3>
          <div className="flex-1 overflow-y-auto max-h-[400px] pr-2 space-y-4">
            {sales.slice(0, 10).map(sale => (
              <div key={sale.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Venta #{sale.id.slice(-4)}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(sale.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold text-slate-800 dark:text-white">S/. {sale.totalAmount.toLocaleString()}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{sale.items.length} ítems</p>
                </div>
              </div>
            ))}
             {sales.length === 0 && (
                <p className="text-slate-400 dark:text-slate-500 text-sm text-center py-8">No hay transacciones recientes.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;