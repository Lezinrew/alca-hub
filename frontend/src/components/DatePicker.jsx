import React, { useState, useEffect } from 'react';
import { Calendar, Clock, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { format, addDays, isSameDay, isBefore, startOfDay, addMonths, subMonths, getDaysInMonth, getDay, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DatePicker = ({ onDateSelect, onClose, professional }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Dados do profissional
  const professionalData = professional || {
    name: 'João Silva',
    category: 'Limpeza Residencial',
    rating: 4.8,
    pricing: {
      hourly: { average: 80 },
      packages: [
        { name: 'Limpeza Básica', duration: 2, price: 160, description: 'Limpeza geral da casa' },
        { name: 'Limpeza Completa', duration: 4, price: 300, description: 'Limpeza profunda com organização' },
        { name: 'Limpeza Premium', duration: 6, price: 420, description: 'Limpeza profunda com organização e extras' }
      ]
    },
    availability: {
      workingDays: ['segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'],
      blockedDates: [],
      workingHours: { start: '08:00', end: '18:00' }
    }
  };

  // Horários disponíveis
  const availableTimes = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  // Verificar se uma data está disponível
  const isDateAvailable = (date) => {
    const today = startOfDay(new Date());
    const dateStart = startOfDay(date);
    
    // Não permitir datas passadas
    if (isBefore(dateStart, today)) return false;
    
    // Verificar se é dia útil
    const dayOfWeek = format(date, 'EEEE', { locale: ptBR }).toLowerCase();
    const isWorkingDay = professionalData.availability.workingDays.includes(dayOfWeek);
    
    // Verificar se não está bloqueada
    const dateString = format(date, 'yyyy-MM-dd');
    const isBlocked = professionalData.availability.blockedDates.includes(dateString);
    
    return isWorkingDay && !isBlocked;
  };

  // Gerar dias do mês
  const generateMonthDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = startOfMonth(currentMonth);
    const lastDay = endOfMonth(currentMonth);
    const startDate = startOfDay(firstDay);
    const endDate = startOfDay(lastDay);
    
    const days = [];
    const startDayOfWeek = getDay(firstDay); // 0 = domingo, 1 = segunda, etc.
    
    // Adicionar dias vazios do início
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    // Adicionar dias do mês
    for (let day = 1; day <= getDaysInMonth(currentMonth); day++) {
      const date = new Date(year, month, day);
      days.push(date);
    }
    
    return days;
  };

  const monthDays = generateMonthDays();

  // Navegar entre meses
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  // Selecionar data
  const handleDateClick = (date) => {
    if (isDateAvailable(date)) {
      setSelectedDate(date);
      setSelectedTime(null); // Reset time when date changes
    }
  };

  // Selecionar horário
  const handleTimeClick = (time) => {
    setSelectedTime(time);
  };

  // Selecionar pacote
  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
  };

  // Confirmar agendamento
  const handleConfirm = () => {
    if (selectedDate && selectedTime && selectedPackage) {
      const bookingData = {
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        package: selectedPackage,
        professional: professionalData.name,
        total: selectedPackage.price
      };
      onDateSelect(bookingData);
    }
  };

  // Renderizar dia do calendário
  const renderDay = (date, index) => {
    if (!date) {
      return <div key={index} className="h-10"></div>;
    }

    const isAvailable = isDateAvailable(date);
    const isSelected = selectedDate && isSameDay(selectedDate, date);
    const isToday = isSameDay(date, new Date());

    return (
      <button
        key={date.toISOString()}
        onClick={() => handleDateClick(date)}
        disabled={!isAvailable}
        className={`
          h-10 w-full rounded-lg text-sm font-medium transition-all duration-200
          ${isSelected 
            ? 'bg-blue-600 text-white shadow-lg transform scale-105' 
            : isAvailable 
              ? 'bg-white text-gray-900 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md border border-gray-200' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
          }
          ${isToday && !isSelected ? 'ring-2 ring-blue-300' : ''}
        `}
      >
        {format(date, 'd')}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Agendar Serviço</h2>
              <p className="text-blue-100 mt-1">
                {professionalData.name} • {professionalData.category}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Coluna 1: Calendário */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={goToPreviousMonth}
                    className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                  </h3>
                  <button
                    onClick={goToNextMonth}
                    className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Dias da semana */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Dias do mês */}
                <div className="grid grid-cols-7 gap-1">
                  {monthDays.map((date, index) => renderDay(date, index))}
                </div>

                {/* Legenda */}
                <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-600 rounded"></div>
                    <span>Selecionado</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-100 rounded"></div>
                    <span>Indisponível</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna 2: Horários e Pacotes */}
            <div className="space-y-6">
              
              {/* Horários */}
              {selectedDate && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Horários para {format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {availableTimes.map(time => (
                      <button
                        key={time}
                        onClick={() => handleTimeClick(time)}
                        className={`
                          p-3 rounded-lg text-sm font-medium transition-all duration-200
                          ${selectedTime === time
                            ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                            : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-700 border border-gray-200'
                          }
                        `}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pacotes */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Escolha o Pacote</h3>
                <div className="space-y-3">
                  {professionalData.pricing.packages.map((pkg, index) => (
                    <button
                      key={index}
                      onClick={() => handlePackageSelect(pkg)}
                      className={`
                        w-full p-4 rounded-lg border text-left transition-all duration-200
                        ${selectedPackage?.name === pkg.name
                          ? 'border-blue-600 bg-blue-50 shadow-lg transform scale-105'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{pkg.name}</h4>
                          <p className="text-sm text-gray-600">{pkg.description}</p>
                          <p className="text-xs text-gray-500 mt-1">Duração: {pkg.duration}h</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-600">R$ {pkg.price}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Resumo */}
              {selectedDate && selectedTime && selectedPackage && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">Resumo do Agendamento</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>Data:</strong> {format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}</p>
                    <p><strong>Horário:</strong> {selectedTime}</p>
                    <p><strong>Serviço:</strong> {selectedPackage.name}</p>
                    <p><strong>Duração:</strong> {selectedPackage.duration}h</p>
                    <div className="pt-2 border-t border-blue-200">
                      <p className="text-lg font-bold text-blue-800">
                        Total: R$ {selectedPackage.price}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedDate || !selectedTime || !selectedPackage}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Confirmar Agendamento
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatePicker;