import React from 'react';
import { X, Tag, Box, Info, Printer } from 'lucide-react';
import { Product } from '../types';

interface ImagePreviewModalProps {
  product: Product | null;
  onClose: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ product, onClose }) => {
  if (!product) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-200 no-print"
      onClick={onClose}
    >
      <div 
        className="printable-content bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300 border border-slate-200 dark:border-slate-800 print-layout-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Print Only Header */}
        <div className="hidden print:flex items-center gap-4 mb-6 border-b border-black pb-4">
            <div className="w-16 h-16 bg-black text-yellow-400 flex items-center justify-center rounded-lg font-bold text-2xl">K</div>
            <div>
                <h1 className="text-2xl font-bold">KOMPUTER SAC</h1>
                <p className="text-sm text-gray-600">Ficha de Producto</p>
            </div>
        </div>

        {/* Image Section */}
        <div className="w-full md:w-3/5 bg-black flex items-center justify-center p-4 relative group print:bg-white print:p-0 print:mb-6">
           <img 
             src={product.imageUrl} 
             alt={product.model} 
             className="max-w-full max-h-[40vh] md:max-h-[85vh] object-contain transition-transform duration-300 print-image-size" 
           />
           <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors md:hidden no-print"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Details Section */}
        <div className="w-full md:w-2/5 p-6 md:p-8 flex flex-col overflow-y-auto bg-white dark:bg-slate-900 relative print-full-width print:p-0">
          
          {/* Actions Bar (No Print) */}
          <div className="flex justify-end gap-2 absolute top-4 right-4 no-print">
            <button 
                onClick={handlePrint}
                className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Imprimir Ficha"
            >
                <Printer className="w-6 h-6" />
            </button>
            <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors hidden md:block"
            >
                <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-6 print:mt-4">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 mb-3 print:border print:border-gray-300 print:bg-transparent print:text-black">
              {product.category.toUpperCase()}
            </span>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight mb-2">
              {product.model}
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
              {product.brand}
            </p>
          </div>

          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100 dark:border-slate-800 print:border-gray-300">
             <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Precio</p>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  S/. {product.price.toFixed(2)}
                </p>
             </div>
             <div className="h-10 w-px bg-slate-200 dark:bg-slate-700 mx-2 print:bg-gray-300"></div>
             <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Stock</p>
                <div className={`flex items-center gap-2 font-medium ${product.stock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                   <Box className="w-5 h-5" />
                   {product.stock} unidades
                </div>
             </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3 text-slate-800 dark:text-slate-200 font-semibold">
               <Info className="w-5 h-5 text-indigo-500 print:text-black" />
               Descripción
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg text-justify">
              {product.description}
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 font-mono print:border-gray-300">
             ID de Producto: {product.id}
             <br />
             <span className="hidden print:inline mt-2 text-gray-500">Documento generado el {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagePreviewModal;