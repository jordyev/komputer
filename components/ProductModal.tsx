import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { X, Upload, Sparkles, Image as ImageIcon } from 'lucide-react';
import AIImageEditor from './AIImageEditor';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: Product) => void;
  product?: Product; // If provided, we are in edit mode
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSubmit, product }) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    id: '',
    brand: '',
    model: '',
    description: '',
    stock: 0,
    price: 0,
    category: '',
    imageUrl: ''
  });
  
  const [showAIEditor, setShowAIEditor] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (product) {
        setFormData({ ...product });
      } else {
        // Generate a random ID for new products for this demo
        setFormData({
            id: `KMP-${Math.floor(Math.random() * 10000)}`,
            brand: '',
            model: '',
            description: '',
            stock: 0,
            price: 0,
            category: '',
            imageUrl: ''
        });
      }
      setShowAIEditor(false);
    }
  }, [isOpen, product]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'stock' || name === 'price' ? parseFloat(value) || 0 : value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyAIImage = (newImage: string) => {
    setFormData(prev => ({ ...prev, imageUrl: newImage }));
    setShowAIEditor(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) {
        // Set a placeholder if empty
        formData.imageUrl = `https://picsum.photos/400/400?random=${Date.now()}`;
    }
    onSubmit(formData as Product);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col transition-colors duration-300">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            {product ? 'Editar Producto' : 'Agregar Nuevo Producto'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-950/50">
          
          {showAIEditor && formData.imageUrl ? (
             <AIImageEditor 
                currentImage={formData.imageUrl} 
                onSave={handleApplyAIImage} 
                onCancel={() => setShowAIEditor(false)} 
             />
          ) : (
            <form id="product-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Image */}
                <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Imagen de Referencia</label>
                <div className="relative group w-full aspect-square bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center overflow-hidden hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors">
                    {formData.imageUrl ? (
                    <>
                        <img 
                            src={formData.imageUrl} 
                            alt="Preview" 
                            className="w-full h-full object-contain p-2" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <label className="cursor-pointer bg-white text-slate-800 px-4 py-2 rounded-lg font-medium hover:bg-slate-100 flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                Cambiar
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowAIEditor(true)}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2"
                            >
                                <Sparkles className="w-4 h-4" />
                                Edición IA
                            </button>
                        </div>
                    </>
                    ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full p-4">
                        <ImageIcon className="w-12 h-12 text-slate-400 dark:text-slate-600 mb-3" />
                        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Subir Imagen</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                    )}
                </div>
                {formData.imageUrl && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                        Usa el botón Edición IA para mejorar o modificar la imagen con Gemini.
                    </p>
                )}
                </div>

                {/* Right Column: Form Fields */}
                <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">ID</label>
                            <input 
                                name="id" 
                                value={formData.id} 
                                readOnly 
                                className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 cursor-not-allowed" 
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Marca</label>
                            <input 
                                name="brand" 
                                required
                                value={formData.brand} 
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white" 
                                placeholder="ej. Logitech"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Modelo</label>
                        <input 
                            name="model" 
                            required
                            value={formData.model} 
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white" 
                            placeholder="ej. MX Master 3S"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Categoría</label>
                        <input 
                            name="category" 
                            list="categories"
                            required
                            value={formData.category} 
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white" 
                            placeholder="ej. Periféricos"
                        />
                        <datalist id="categories">
                            <option value="Periféricos" />
                            <option value="Portátiles" />
                            <option value="Monitores" />
                            <option value="Componentes" />
                            <option value="Audio" />
                            <option value="Teclados" />
                        </datalist>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Precio (S/.)</label>
                            <input 
                                type="number"
                                name="price" 
                                required
                                min="0"
                                step="0.01"
                                value={formData.price} 
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white" 
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Cantidad Stock</label>
                            <input 
                                type="number"
                                name="stock" 
                                required
                                min="0"
                                value={formData.stock} 
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white" 
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Descripción</label>
                        <textarea 
                            name="description" 
                            rows={3}
                            value={formData.description} 
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none dark:text-white" 
                            placeholder="Detalles del producto..."
                        />
                    </div>
                </div>
            </form>
          )}
        </div>

        {/* Footer */}
        {!showAIEditor && (
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end gap-3">
            <button 
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
                Cancelar
            </button>
            <button 
                type="submit" 
                form="product-form"
                className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-all transform active:scale-95"
            >
                {product ? 'Actualizar Producto' : 'Crear Producto'}
            </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default ProductModal;