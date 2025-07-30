import React, { useState, useEffect, useMemo } from 'react';

interface DateTimePickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (date: string, time: string) => void;
    initialDate: string;
    initialTime: string;
}

const ChevronLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
);
const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
);


export const DateTimePickerModal: React.FC<DateTimePickerModalProps> = ({ isOpen, onClose, onSave, initialDate, initialTime }) => {
    
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState('');
    
    const TIME_SLOTS = [
        '09:00 - 11:00',
        '11:00 - 13:00',
        '13:00 - 15:00',
        '15:00 - 17:00',
        '17:00 - 19:00',
    ];

    useEffect(() => {
        if (isOpen) {
            let initialD: Date;
            if (initialDate) {
                const [year, month, day] = initialDate.split('-').map(Number);
                initialD = new Date(year, month - 1, day);
            } else {
                initialD = new Date();
            }
            setCurrentMonth(initialD);
            setSelectedDate(initialDate ? initialD : null);
            setSelectedTime(initialTime || '');
        }
    }, [isOpen, initialDate, initialTime]);

    const handleSave = () => {
        if (selectedDate && selectedTime) {
            const dateString = selectedDate.toISOString().split('T')[0];
            onSave(dateString, selectedTime);
        }
    };

    const daysInMonth = useMemo(() => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        return date.getDate();
    }, [currentMonth]);
    
    const firstDayOfMonth = useMemo(() => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        return date.getDay(); 
    }, [currentMonth]);

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };
    
    const renderCalendar = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`blank-${i}`} className="p-2"></div>);
        }
        
        for (let day = 1; day <= daysInMonth; day++) {
            const dayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const isPast = dayDate < today;
            const isSelected = selectedDate && dayDate.getTime() === selectedDate.getTime();

            days.push(
                <button
                    key={day}
                    disabled={isPast}
                    onClick={() => setSelectedDate(dayDate)}
                    className={`w-10 h-10 flex items-center justify-center rounded-full text-sm transition-colors ${
                        isSelected ? 'bg-accent text-white font-bold' 
                        : isPast ? 'text-gray-400 cursor-not-allowed'
                        : 'text-text-primary hover:bg-gray-200'
                    }`}
                >
                    {day}
                </button>
            );
        }
        return days;
    };
    
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-start sm:items-center overflow-y-auto p-4 animate-fade-in-up"
            style={{ animationDuration: '0.3s' }}
            onClick={onClose}
        >
            <div 
                className="bg-card-bg rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-2xl font-bold text-text-primary mb-6 text-center">Selecciona Fecha y Hora</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Calendar */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-200 transition"><ChevronLeftIcon /></button>
                            <span className="font-bold text-text-primary capitalize text-lg">
                                {currentMonth.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
                            </span>
                            <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-200 transition"><ChevronRightIcon /></button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-xs text-text-secondary font-semibold mb-2">
                            {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map(d => <div key={d}>{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1 place-items-center">
                            {renderCalendar()}
                        </div>
                    </div>
                    {/* Time Slots */}
                    <div className="border-t pt-6 md:border-t-0 md:pt-0 md:border-l md:pl-8">
                         <h4 className="text-lg font-bold text-text-primary mb-4 text-center md:text-left">Elige un horario</h4>
                         <div className="flex flex-col space-y-2">
                            {TIME_SLOTS.map(slot => (
                                <button
                                    key={slot}
                                    onClick={() => setSelectedTime(slot)}
                                    className={`w-full p-3 rounded-lg text-sm font-semibold transition-colors border ${
                                        selectedTime === slot 
                                        ? 'bg-accent text-white border-accent'
                                        : 'bg-background text-text-primary border-border-soft hover:border-accent'
                                    }`}
                                >
                                    {slot}
                                </button>
                            ))}
                         </div>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="bg-gray-200 text-text-secondary font-bold py-3 px-6 rounded-xl hover:bg-gray-300 transition-colors duration-200"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="button"
                        onClick={handleSave}
                        disabled={!selectedDate || !selectedTime}
                        className="bg-accent text-white font-bold py-3 px-6 rounded-xl hover:bg-accent-hover transition-colors duration-200 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
};