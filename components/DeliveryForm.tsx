
import React, { useState } from 'react';
import type { OrderDetails } from '../types';
import { DateTimePickerModal } from './DateTimePickerModal';

interface DeliveryFormProps {
    onGoBack: () => void;
    onFinalizeOrder: (deliveryDetails: Omit<OrderDetails, 'id' | 'cart' | 'total' | 'subtotal' | 'shippingCost'>) => void;
    subtotal: number;
    shippingCost: number;
    total: number;
}

const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-text-secondary group-hover:text-text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

export const DeliveryForm: React.FC<DeliveryFormProps> = ({ onGoBack, onFinalizeOrder, subtotal, shippingCost, total }) => {
    const [formData, setFormData] = useState({ recipientName: '', deliveryAddress: '', deliveryDate: '', deliveryTime: '' });
    const [error, setError] = useState('');
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDateTimeSave = (date: string, time: string) => {
        setFormData(prev => ({ ...prev, deliveryDate: date, deliveryTime: time }));
        setIsPickerOpen(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { recipientName, deliveryAddress, deliveryDate, deliveryTime } = formData;
        if (!recipientName || !deliveryAddress || !deliveryDate || !deliveryTime) {
            setError('Todos los campos, incluyendo fecha y hora, son obligatorios.');
            return;
        }
        setError('');
        onFinalizeOrder(formData);
    };
    
    const displayDateTime = () => {
        if (formData.deliveryDate && formData.deliveryTime) {
            try {
                 // Create date from "YYYY-MM-DD" string to avoid timezone issues.
                 const [year, month, day] = formData.deliveryDate.split('-').map(Number);
                 const date = new Date(year, month - 1, day);
                 const dateString = date.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                 // The time is now a slot, e.g., "09:00 - 11:00"
                 return `${dateString} / ${formData.deliveryTime}`;
            } catch(e) {
                console.error("Error formatting date:", e);
                return 'Seleccionar fecha y hora';
            }
        }
        return 'Seleccionar fecha y hora';
    };


    return (
        <>
            <div className="max-w-4xl mx-auto bg-card-bg p-6 sm:p-8 rounded-2xl shadow-lg ring-1 ring-border-soft/50">
                <h2 className="text-3xl font-bold text-text-primary mb-6">Datos de Entrega</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
                    <form id="delivery-form" onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="recipientName" className="block text-sm font-semibold text-text-secondary mb-2">¿Quién recibe?</label>
                            <input 
                                type="text"
                                id="recipientName" 
                                name="recipientName"
                                value={formData.recipientName} 
                                onChange={handleChange}
                                className="w-full bg-background rounded-lg p-3 text-base text-text-primary ring-1 ring-inset ring-border-soft focus:outline-none focus:ring-2 focus:ring-accent transition shadow-sm"
                                placeholder="Nombre completo"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="deliveryAddress" className="block text-sm font-semibold text-text-secondary mb-2">Dirección de Entrega</label>
                            <textarea 
                                id="deliveryAddress" 
                                name="deliveryAddress"
                                value={formData.deliveryAddress} 
                                onChange={handleChange}
                                className="w-full bg-background rounded-lg p-3 text-base text-text-primary ring-1 ring-inset ring-border-soft focus:outline-none focus:ring-2 focus:ring-accent transition shadow-sm"
                                rows={3}
                                placeholder="Calle, número, colonia, código postal..."
                                required
                            />
                        </div>

                         <div>
                            <label className="block text-sm font-semibold text-text-secondary mb-2">Fecha y Hora de Entrega</label>
                            <button
                                type="button"
                                onClick={() => setIsPickerOpen(true)}
                                className="w-full bg-background rounded-lg p-3 text-base text-text-primary ring-1 ring-inset ring-border-soft focus:outline-none focus:ring-2 focus:ring-accent transition shadow-sm flex items-center justify-start text-left group"
                            >
                                <CalendarIcon />
                                <span className={!formData.deliveryDate ? 'text-text-secondary/70' : ''}>
                                    {displayDateTime()}
                                </span>
                            </button>
                        </div>
                        
                        {error && <p className="text-red-600 text-sm text-center font-semibold">{error}</p>}
                    </form>

                    <div className="bg-background/50 p-6 rounded-xl flex flex-col h-full">
                        <h3 className="text-xl font-bold text-text-primary mb-4">Resumen de Pago</h3>
                        <div className="space-y-2 flex-grow">
                            <div className="flex justify-between text-text-secondary">
                                <span>Subtotal</span>
                                <span className="font-semibold text-text-primary">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-text-secondary">
                                <span>Envío</span>
                                <span className="font-semibold text-text-primary">${shippingCost.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="flex justify-between text-2xl font-bold text-text-primary border-t border-dashed border-border-soft pt-3 mt-3">
                            <span>Total a Pagar</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                <div className="mt-8 pt-6 border-t border-border-soft flex flex-col sm:flex-row justify-between gap-4">
                    <button type="button" onClick={onGoBack} className="bg-gray-200 text-text-secondary font-bold py-3 px-6 rounded-xl hover:bg-gray-300 transition-colors duration-200 text-lg">
                        &larr; Volver al Resumen
                    </button>
                    <button type="submit" form="delivery-form" className="bg-accent text-white font-bold py-3 px-6 rounded-xl hover:bg-accent-hover transition-colors duration-200 shadow-lg hover:shadow-xl text-lg">
                        Confirmar Pedido
                    </button>
                </div>
            </div>

            <DateTimePickerModal 
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                onSave={handleDateTimeSave}
                initialDate={formData.deliveryDate}
                initialTime={formData.deliveryTime}
            />
        </>
    );
};
