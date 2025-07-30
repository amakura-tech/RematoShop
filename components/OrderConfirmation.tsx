
import React from 'react';
import type { OrderDetails } from '../types';

interface OrderConfirmationProps {
  orderDetails: OrderDetails;
  onNewOrder: () => void;
}

export const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ orderDetails, onNewOrder }) => {
  return (
    <div className="max-w-4xl mx-auto bg-card-bg p-6 sm:p-8 rounded-2xl shadow-lg ring-1 ring-border-soft/50">
        <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-200 mb-4">
                <svg className="h-10 w-10 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h2 className="text-3xl font-bold text-text-primary">¡Pedido realizado con éxito!</h2>
            <p className="text-text-secondary mt-2">¡Gracias por tu compra, {orderDetails.recipientName.split(' ')[0]}!</p>
            <div className="mt-4 bg-accent/10 border border-accent/20 rounded-lg p-3 text-center">
                <p className="text-sm text-accent-hover font-semibold">Tu ID de Pedido (guárdalo como referencia):</p>
                <p className="text-lg font-bold text-text-primary tracking-wider">{orderDetails.id}</p>
            </div>
        </div>

        <div className="mt-8 space-y-6">
            <div>
                <h3 className="text-lg font-bold text-text-primary mb-3">Resumen del Pedido</h3>
                <ul className="divide-y divide-border-soft border-t border-border-soft">
                    {orderDetails.cart.map(({ product, quantity }) => (
                        <li key={product.id} className="flex justify-between items-center py-3">
                            <span className="text-text-secondary">{product.name} <span className="text-xs">(x{quantity})</span></span>
                            <span className="font-semibold text-text-primary">${(product.price * quantity).toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
                <div className="space-y-1 border-t border-border-soft pt-3 mt-3">
                  <div className="flex justify-between text-sm text-text-secondary">
                      <span>Subtotal</span>
                      <span className="font-semibold text-text-primary">${orderDetails.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-text-secondary">
                      <span>Envío</span>
                      <span className="font-semibold text-text-primary">${orderDetails.shippingCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-text-primary mt-1 border-t border-dashed pt-2">
                      <span>Total Pagado</span>
                      <span>${orderDetails.total.toFixed(2)}</span>
                  </div>
                </div>
            </div>
            <div>
                <h3 className="text-lg font-bold text-text-primary mb-2">Detalles de Entrega</h3>
                <div className="text-text-secondary space-y-1 text-sm bg-background/50 p-4 rounded-lg border border-border-soft">
                    <p><span className="font-semibold">Recibe:</span> {orderDetails.recipientName}</p>
                    <p><span className="font-semibold">Dirección:</span> {orderDetails.deliveryAddress}</p>
                    <p><span className="font-semibold">Fecha:</span> {new Date(orderDetails.deliveryDate + 'T00:00:00').toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p><span className="font-semibold">Hora:</span> {orderDetails.deliveryTime}</p>
                </div>
            </div>
        </div>

        <div className="mt-10 text-center">
            <button onClick={onNewOrder} className="bg-accent text-white font-bold py-3 px-8 rounded-xl hover:bg-accent-hover transition-colors duration-200 shadow-lg hover:shadow-xl text-lg">
                Hacer una nueva compra
            </button>
        </div>
    </div>
  );
};
