import React from 'react';
import type { CartItem } from '../types';

interface OrderSummaryProps {
  cartItems: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId:string) => void;
  onGoBack: () => void;
  onProceed: () => void;
}

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

export const OrderSummary: React.FC<OrderSummaryProps> = ({ cartItems, subtotal, shippingCost, total, onUpdateQuantity, onRemoveItem, onGoBack, onProceed }) => {
  return (
    <div className="max-w-4xl mx-auto bg-card-bg p-6 sm:p-8 rounded-2xl shadow-lg ring-1 ring-border-soft/50">
      <h2 className="text-3xl font-bold text-text-primary mb-6">Resumen de tu Pedido</h2>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-text-secondary">Tu carrito está vacío.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <ul className="divide-y divide-border-soft">
            {cartItems.map(({ product, quantity }) => (
              <li key={product.id} className="flex flex-col sm:flex-row items-start sm:items-center py-4 gap-4">
                <div className="flex-grow">
                  <p className="font-semibold text-text-primary">{product.name}</p>
                  <p className="text-sm text-text-secondary">${product.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => onUpdateQuantity(product.id, quantity - 1)} className="h-8 w-8 rounded-md border border-border-soft text-text-secondary hover:bg-gray-100 transition">-</button>
                  <span className="w-10 text-center font-semibold">{quantity}</span>
                  <button onClick={() => onUpdateQuantity(product.id, quantity + 1)} disabled={quantity >= product.stock} className="h-8 w-8 rounded-md border border-border-soft text-text-secondary hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed">+</button>
                </div>
                <p className="w-24 text-right font-bold text-text-primary text-lg">${(product.price * quantity).toFixed(2)}</p>
                <button onClick={() => onRemoveItem(product.id)} className="text-red-500/70 hover:text-red-600 p-2 rounded-full hover:bg-red-100/50 transition" aria-label={`Eliminar ${product.name}`}>
                  <TrashIcon />
                </button>
              </li>
            ))}
          </ul>
          <div className="pt-6 border-t border-border-soft space-y-2">
            <div className="flex justify-between text-text-secondary">
              <span>Subtotal</span>
              <span className="font-semibold text-text-primary">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>Envío</span>
              <span className="font-semibold text-text-primary">${shippingCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-text-primary border-t border-dashed border-border-soft pt-2 mt-2">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
        <button onClick={onGoBack} className="bg-gray-200 text-text-secondary font-bold py-3 px-6 rounded-xl hover:bg-gray-300 transition-colors duration-200 text-lg">
          &larr; Volver a la Tienda
        </button>
        <button onClick={onProceed} disabled={cartItems.length === 0} className="bg-accent text-white font-bold py-3 px-6 rounded-xl hover:bg-accent-hover transition-colors duration-200 shadow-lg hover:shadow-xl text-lg disabled:bg-gray-400 disabled:cursor-not-allowed">
          Continuar con la Entrega &rarr;
        </button>
      </div>
    </div>
  );
};