import React, { useState, useEffect } from 'react';
import { X, Printer, MapPin, Phone, Mail, Calendar, Globe, Building } from 'lucide-react';
import { SaleItem } from '../types';
import { LOGO_URL } from '../App';

interface CustomerData {
  name: string;
  document: string;
  contact: string;
}

interface QuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: SaleItem[];
  customer: CustomerData;
  total: number;
}

const QuotationModal: React.FC<QuotationModalProps> = ({ isOpen, onClose, items, customer, total }) => {
  const [quoteNumber, setQuoteNumber] = useState('');

  // Generate sequence number when modal opens
  useEffect(() => {
    if (isOpen) {
      const storedSeq = localStorage.getItem('komputer_quotation_seq');
      // Default to 0 if not exists, so next is 1
      const nextSeq = storedSeq ? parseInt(storedSeq) + 1 : 1;
      
      localStorage.setItem('komputer_quotation_seq', nextSeq.toString());
      setQuoteNumber(`COT-${nextSeq.toString().padStart(6, '0')}`);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const date = new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200 no-print"
      onClick={onClose}
    >
      <div 
        className="printable-content bg-white w-full max-w-4xl h-[90vh] md:h-auto md:max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-300 print:shadow-none print:h-auto print:max-h-none print:overflow-visible"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Actions Toolbar (Hidden on Print) */}
        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50 rounded-t-xl no-print">
          <h3 className="font-bold text-slate-700">Vista Previa de Cotización</h3>
          <div className="flex gap-2">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-8 md:p-12 text-slate-900 print:p-0">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-8 border-b-2 border-slate-800 pb-6">
            <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-black text-yellow-400 flex items-center justify-center rounded-lg overflow-hidden border border-black shrink-0">
                     <img src={LOGO_URL} alt="Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-tight">KOMPUTER SAC EIRL</h1>
                    <p className="text-sm text-slate-500 font-medium">RUC: 20606970766</p>
                    <p className="text-xs text-slate-400 mt-1">Soluciones Tecnológicas</p>
                </div>
            </div>
            <div className="text-right">
                <h2 className="text-2xl font-bold text-indigo-600 print:text-black">COTIZACIÓN</h2>
                <p className="text-lg font-mono text-slate-600">#{quoteNumber}</p>
                <p className="text-sm text-slate-500 mt-1 capitalize">{date}</p>
            </div>
          </div>

          {/* Company & Client Grid */}
          <div className="grid grid-cols-2 gap-12 mb-10">
            {/* Company Info */}
            <div className="space-y-3 text-xs text-slate-600">
                <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2 uppercase tracking-wider">De</h3>
                
                <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
                    <div className="space-y-1">
                        <p><span className="font-semibold">Legal:</span> JR. FRANCISCO IRAZOLA # 602, SATIPO - JUNÍN</p>
                        <p><span className="font-semibold">Comercial:</span> JR. FRANCISCO IRAZOLA # 531 CON JR. JULIO C. TELLO #607</p>
                        <p><span className="font-semibold">Oficina:</span> OFICINA PRINCIPAL LIMA - SAN ISIDRO</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 shrink-0 text-slate-400" />
                    <span>994943410</span>
                </div>
                
                <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 shrink-0 text-slate-400" />
                    <span>komputer_pc@hotmail.es</span>
                </div>

                <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 shrink-0 text-slate-400" />
                    <span>komputer.wayraerp.pe/ecommerce</span>
                </div>
            </div>

            {/* Client Info */}
            <div className="space-y-3 text-sm">
                <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2 uppercase tracking-wider text-xs">Para</h3>
                <div className="space-y-1">
                    <span className="text-slate-500 text-xs uppercase">Cliente / Empresa</span>
                    <p className="font-bold text-lg text-slate-900">{customer.name || 'Cliente General'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <span className="text-slate-500 text-xs uppercase">RUC / DNI</span>
                        <p className="font-medium">{customer.document || '-'}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-slate-500 text-xs uppercase">Contacto</span>
                        <p className="font-medium">{customer.contact || '-'}</p>
                    </div>
                </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full text-sm border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-xs">
                    <tr>
                        <th className="px-4 py-3 text-left rounded-l-lg">Descripción</th>
                        <th className="px-4 py-3 text-center">Cant.</th>
                        <th className="px-4 py-3 text-right">Precio Unit.</th>
                        <th className="px-4 py-3 text-right rounded-r-lg">Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {items.map((item, index) => (
                        <tr key={index}>
                            <td className="px-4 py-3">
                                <p className="font-bold text-slate-800">{item.productName}</p>
                                <p className="text-xs text-slate-500">ID: {item.productId}</p>
                            </td>
                            <td className="px-4 py-3 text-center text-slate-600">{item.quantity}</td>
                            <td className="px-4 py-3 text-right text-slate-600">S/. {item.price.toFixed(2)}</td>
                            <td className="px-4 py-3 text-right font-medium text-slate-900">S/. {(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2">
                <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>S/. {(total / 1.18).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                    <span>IGV (18%)</span>
                    <span>S/. {(total - (total / 1.18)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-xl text-slate-900 border-t-2 border-slate-900 pt-2 mt-2">
                    <span>Total</span>
                    <span>S/. {total.toFixed(2)}</span>
                </div>
            </div>
          </div>

          {/* Bank Accounts Footer */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-8 text-xs">
              <h4 className="font-bold text-slate-800 mb-3 uppercase flex items-center gap-2">
                  <Building className="w-4 h-4" /> Cuentas Bancarias
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <p className="font-bold text-slate-900">INTERBANK Soles</p>
                      <div className="grid grid-cols-[30px_1fr] gap-1 mt-1 text-slate-600">
                          <span className="font-medium">N°:</span>
                          <span>200-300-5648899</span>
                          <span className="font-medium">CCI:</span>
                          <span>003-200-003005648899-39</span>
                      </div>
                  </div>
                  <div>
                      <p className="font-bold text-slate-900">BANCO DE CRÉDITO DEL PERÚ Soles</p>
                      <div className="grid grid-cols-[30px_1fr] gap-1 mt-1 text-slate-600">
                          <span className="font-medium">N°:</span>
                          <span>191-8741553-0-13</span>
                          <span className="font-medium">CCI:</span>
                          <span>002-19100874155301355</span>
                      </div>
                  </div>
              </div>
          </div>

          {/* Footer Terms */}
          <div className="border-t border-slate-200 pt-6 text-[10px] text-slate-500">
            <h4 className="font-bold text-slate-700 mb-2 uppercase">Términos y Condiciones</h4>
            <ul className="list-disc pl-4 space-y-1 mb-6">
                <li>Esta cotización es válida por 15 días calendario.</li>
                <li>Los precios incluyen IGV.</li>
                <li>La disponibilidad de stock puede variar al momento de confirmar la compra.</li>
                <li>Garantía de 12 meses por defectos de fábrica.</li>
            </ul>
            
            <div className="flex justify-between items-end mt-12 pt-4">
                 <div className="text-center w-48">
                    <div className="h-16 border-b border-slate-400 mb-2"></div>
                    <p>Firma Autorizada</p>
                    <p className="font-bold">KOMPUTER SAC EIRL</p>
                 </div>
                 <p className="italic">Gracias por su preferencia.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default QuotationModal;