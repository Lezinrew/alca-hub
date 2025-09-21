import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, MapPin, CreditCard, CheckCircle, ArrowRight, ArrowLeft, Star, Phone, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PROFESSIONALS_DATA } from '../data/professionals';

const NewBooking = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [bookingData, setBookingData] = useState({
    service: {
      name: "Limpeza Residencial",
      category: "Limpeza Residencial",
      description: "Limpeza geral da casa incluindo sala, cozinha, banheiros e quartos"
    },
    professional: null,
    date: '',
    time: '',
    duration: 2,
    address: '',
    contact: '',
    notes: '',
    paymentMethod: 'credit_card',
    totalPrice: 0
  });

  // Passos do fluxo
  const steps = [
    { id: 1, title: 'Selecionar Profissional', icon: User, description: 'Escolha o profissional' },
    { id: 2, title: 'Selecionar Data', icon: Calendar, description: 'Escolha a data e horário' },
    { id: 3, title: 'Detalhes do Serviço', icon: User, description: 'Informe os detalhes' },
    { id: 4, title: 'Localização', icon: MapPin, description: 'Onde será o serviço' },
    { id: 5, title: 'Pagamento', icon: CreditCard, description: 'Forma de pagamento' },
    { id: 6, title: 'Confirmação', icon: CheckCircle, description: 'Revise e confirme' }
  ];

  // Gerar datas disponíveis
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayOfWeek = date.toLocaleDateString('pt-BR', { weekday: 'long' });
      const isWorkingDay = ['segunda', 'terça', 'quarta', 'quinta', 'sexta'].includes(dayOfWeek);
      
      if (isWorkingDay) {
        dates.push({
          date: date.toISOString().split('T')[0],
          display: date.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            weekday: 'long'
          }),
          available: true
        });
      }
    }
    
    return dates;
  };

  // Gerar horários disponíveis
  const getAvailableTimes = (date) => {
    const times = [];
    const startHour = 8;
    const endHour = 18;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const isAvailable = Math.random() > 0.3; // Simular disponibilidade
        
        if (isAvailable) {
          times.push({
            time: timeString,
            available: true,
            price: selectedProfessional?.pricing?.hourly?.average || 100
          });
        }
      }
    }
    
    return times;
  };

  const availableDates = getAvailableDates();
  const availableTimes = bookingData.date ? getAvailableTimes(bookingData.date) : [];

  // Calcular preço total
  useEffect(() => {
    if (selectedProfessional) {
      const basePrice = selectedProfessional.pricing?.hourly?.average || 100;
      const total = basePrice * bookingData.duration;
      setBookingData(prev => ({ ...prev, totalPrice: total }));
    }
  }, [bookingData.duration, selectedProfessional]);

  // Navegar entre passos
  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Finalizar agendamento
  const completeBooking = () => {
    // Simular salvamento do agendamento
    console.log('Agendamento finalizado:', bookingData);
    alert('Agendamento realizado com sucesso!');
    onClose?.();
  };

  // Renderizar passo atual
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Selecione o Profissional</h3>
            <p className="text-gray-600">Escolha um profissional para o seu serviço de limpeza residencial.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PROFESSIONALS_DATA.map((professional) => (
                <button
                  key={professional.id}
                  onClick={() => {
                    setSelectedProfessional(professional);
                    setBookingData(prev => ({ ...prev, professional }));
                  }}
                  className={`p-4 rounded-lg border text-left transition-colors ${
                    selectedProfessional?.id === professional.id
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={professional.avatar}
                      alt={professional.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{professional.name}</h4>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-sm text-gray-600">
                          {professional.rating} ({professional.reviews} avaliações)
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Preço médio: R$ {professional.pricing.hourly.average}/hora
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Selecione a Data e Horário</h3>
            
            {/* Seleção de Data */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Data</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {availableDates.slice(0, 8).map((dateInfo) => (
                  <button
                    key={dateInfo.date}
                    onClick={() => setBookingData(prev => ({ ...prev, date: dateInfo.date }))}
                    className={`p-4 rounded-lg border text-left transition-colors ${
                      bookingData.date === dateInfo.date
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-medium">{dateInfo.display}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Seleção de Horário */}
            {bookingData.date && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Horário</h4>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {availableTimes.slice(0, 12).map((timeInfo) => (
                    <button
                      key={timeInfo.time}
                      onClick={() => setBookingData(prev => ({ ...prev, time: timeInfo.time }))}
                      className={`p-3 rounded-lg border text-center transition-colors ${
                        bookingData.time === timeInfo.time
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-sm font-medium">{timeInfo.time}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Duração */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Duração do Serviço</h4>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 6, 8].map((hours) => (
                  <button
                    key={hours}
                    onClick={() => setBookingData(prev => ({ ...prev, duration: hours }))}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      bookingData.duration === hours
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {hours}h
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Detalhes do Serviço</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações Especiais
                </label>
                <textarea
                  value={bookingData.notes}
                  onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Descreva qualquer necessidade especial ou detalhes importantes..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={4}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Localização</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Endereço Completo
                </label>
                <input
                  type="text"
                  value={bookingData.address}
                  onChange={(e) => setBookingData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Rua, número, bairro, cidade..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone de Contato
                </label>
                <input
                  type="tel"
                  value={bookingData.contact}
                  onChange={(e) => setBookingData(prev => ({ ...prev, contact: e.target.value }))}
                  placeholder="(11) 99999-9999"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Forma de Pagamento</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setBookingData(prev => ({ ...prev, paymentMethod: 'credit_card' }))}
                  className={`p-4 rounded-lg border text-left transition-colors ${
                    bookingData.paymentMethod === 'credit_card'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CreditCard className="w-6 h-6 mb-2" />
                  <h4 className="font-semibold">Cartão de Crédito</h4>
                  <p className="text-sm text-gray-600">Parcelamento em até 12x</p>
                </button>
                
                <button
                  onClick={() => setBookingData(prev => ({ ...prev, paymentMethod: 'pix' }))}
                  className={`p-4 rounded-lg border text-left transition-colors ${
                    bookingData.paymentMethod === 'pix'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-6 h-6 mb-2 bg-green-500 rounded"></div>
                  <h4 className="font-semibold">PIX</h4>
                  <p className="text-sm text-gray-600">Desconto de 5%</p>
                </button>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Confirmação do Agendamento</h3>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Resumo do Agendamento</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Profissional:</span>
                  <span className="font-medium">{selectedProfessional?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Serviço:</span>
                  <span className="font-medium">{bookingData.service.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data:</span>
                  <span className="font-medium">{bookingData.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Horário:</span>
                  <span className="font-medium">{bookingData.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duração:</span>
                  <span className="font-medium">{bookingData.duration} horas</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Endereço:</span>
                  <span className="font-medium">{bookingData.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Forma de Pagamento:</span>
                  <span className="font-medium">
                    {bookingData.paymentMethod === 'credit_card' ? 'Cartão de Crédito' : 'PIX'}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-indigo-600">R$ {bookingData.totalPrice}</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Novo Agendamento</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.id
                    ? 'border-indigo-500 bg-indigo-500 text-white'
                    : 'border-gray-300 text-gray-400'
                }`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-indigo-500' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-gray-300 mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderCurrentStep()}
            </motion.div>
          </AnimatePresence>

          {/* Navegação */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
            
            {currentStep < steps.length ? (
              <button
                onClick={nextStep}
                disabled={
                  (currentStep === 1 && !selectedProfessional) ||
                  (currentStep === 2 && (!bookingData.date || !bookingData.time || !bookingData.duration)) ||
                  (currentStep === 4 && (!bookingData.address || !bookingData.contact))
                }
                className="flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continuar
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={completeBooking}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Confirmar Agendamento
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NewBooking;
