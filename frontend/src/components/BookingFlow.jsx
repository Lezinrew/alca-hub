// Fluxo de Agendamento Estilo Companhia Aérea - Alça Hub
import React, { useState, useEffect } from 'react'
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  DollarSign, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  CreditCard,
  Shield,
  Star,
  Phone,
  MessageCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const BookingFlow = ({ service, professional, onBookingComplete, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [bookingData, setBookingData] = useState({
    service: service,
    professional: professional,
    date: '',
    time: '',
    duration: 1,
    address: '',
    contact: '',
    notes: '',
    paymentMethod: 'credit_card',
    totalPrice: 0
  })

  // Passos do fluxo
  const steps = [
    { id: 1, title: 'Selecionar Data', icon: Calendar, description: 'Escolha a data e horário' },
    { id: 2, title: 'Detalhes do Serviço', icon: User, description: 'Informe os detalhes' },
    { id: 3, title: 'Localização', icon: MapPin, description: 'Onde será o serviço' },
    { id: 4, title: 'Pagamento', icon: CreditCard, description: 'Forma de pagamento' },
    { id: 5, title: 'Confirmação', icon: CheckCircle, description: 'Revise e confirme' }
  ]

  // Gerar datas disponíveis
  const getAvailableDates = () => {
    const dates = []
    const today = new Date()
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      const dayOfWeek = date.toLocaleDateString('pt-BR', { weekday: 'long' })
      const isWorkingDay = ['segunda', 'terça', 'quarta', 'quinta', 'sexta'].includes(dayOfWeek)
      
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
        })
      }
    }
    
    return dates
  }

  // Gerar horários disponíveis
  const getAvailableTimes = (date) => {
    const times = []
    const startHour = 8
    const endHour = 18
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const isAvailable = Math.random() > 0.3 // Simular disponibilidade
        
        if (isAvailable) {
          times.push({
            time: timeString,
            available: true,
            price: professional.pricing?.hourly?.average || 100
          })
        }
      }
    }
    
    return times
  }

  const availableDates = getAvailableDates()
  const availableTimes = bookingData.date ? getAvailableTimes(bookingData.date) : []

  // Calcular preço total
  useEffect(() => {
    const basePrice = professional.pricing?.hourly?.average || 100
    const total = basePrice * bookingData.duration
    setBookingData(prev => ({ ...prev, totalPrice: total }))
  }, [bookingData.duration, professional.pricing])

  // Navegar entre passos
  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Finalizar agendamento
  const completeBooking = () => {
    onBookingComplete?.(bookingData)
  }

  // Renderizar passo atual
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
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
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
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
                <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                  {availableTimes.map((timeSlot, index) => (
                    <button
                      key={index}
                      onClick={() => setBookingData(prev => ({ ...prev, time: timeSlot.time }))}
                      disabled={!timeSlot.available}
                      className={`p-3 rounded-lg border text-center transition-colors ${
                        bookingData.time === timeSlot.time
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : timeSlot.available
                          ? 'border-gray-200 hover:border-gray-300'
                          : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <div className="text-sm font-medium">{timeSlot.time}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Seleção de Duração */}
            {bookingData.time && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Duração</h4>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 6, 8].map((duration) => (
                    <button
                      key={duration}
                      onClick={() => setBookingData(prev => ({ ...prev, duration }))}
                      className={`p-4 rounded-lg border text-center transition-colors ${
                        bookingData.duration === duration
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-lg font-semibold">{duration}h</div>
                      <div className="text-sm text-gray-500">
                        R$ {(professional.pricing?.hourly?.average || 100) * duration}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Detalhes do Serviço</h3>
            
            {/* Informações do Profissional */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <img
                  src={professional.avatar}
                  alt={professional.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{professional.name}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span>{professional.rating} ({professional.reviews} avaliações)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{professional.distance}km</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detalhes do Serviço */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Serviço Selecionado</h4>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900">{service.name}</h5>
                <p className="text-gray-600 text-sm mt-1">{service.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm text-gray-500">Duração: {bookingData.duration}h</span>
                  <span className="text-lg font-semibold text-primary-500">
                    R$ {bookingData.totalPrice}
                  </span>
                </div>
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações (opcional)
              </label>
              <textarea
                value={bookingData.notes}
                onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Informe detalhes específicos sobre o serviço..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows={3}
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Localização</h3>
            
            {/* Endereço */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endereço do Serviço *
              </label>
              <input
                type="text"
                value={bookingData.address}
                onChange={(e) => setBookingData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Rua, número, bairro, cidade"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Contato */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone de Contato *
              </label>
              <input
                type="tel"
                value={bookingData.contact}
                onChange={(e) => setBookingData(prev => ({ ...prev, contact: e.target.value }))}
                placeholder="(11) 99999-9999"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Mapa */}
            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Mapa será exibido aqui</p>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Pagamento</h3>
            
            {/* Resumo do Pedido */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Resumo do Pedido</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Serviço:</span>
                  <span>{service.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Profissional:</span>
                  <span>{professional.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Data:</span>
                  <span>{new Date(bookingData.date).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Horário:</span>
                  <span>{bookingData.time}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duração:</span>
                  <span>{bookingData.duration}h</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t border-gray-200 pt-2">
                  <span>Total:</span>
                  <span className="text-primary-500">R$ {bookingData.totalPrice}</span>
                </div>
              </div>
            </div>

            {/* Métodos de Pagamento */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Método de Pagamento</h4>
              <div className="space-y-3">
                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credit_card"
                    checked={bookingData.paymentMethod === 'credit_card'}
                    onChange={(e) => setBookingData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="mr-3"
                  />
                  <CreditCard className="w-5 h-5 mr-3" />
                  <span>Cartão de Crédito</span>
                </label>
                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="pix"
                    checked={bookingData.paymentMethod === 'pix'}
                    onChange={(e) => setBookingData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="mr-3"
                  />
                  <Shield className="w-5 h-5 mr-3" />
                  <span>PIX</span>
                </label>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Confirmação</h3>
            
            {/* Resumo Final */}
            <div className="bg-green-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <h4 className="text-lg font-semibold text-gray-900">Resumo Final</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Serviço:</span>
                  <p className="font-medium">{service.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Profissional:</span>
                  <p className="font-medium">{professional.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Data:</span>
                  <p className="font-medium">
                    {new Date(bookingData.date).toLocaleDateString('pt-BR', { 
                      weekday: 'long', 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Horário:</span>
                  <p className="font-medium">{bookingData.time}</p>
                </div>
                <div>
                  <span className="text-gray-600">Duração:</span>
                  <p className="font-medium">{bookingData.duration} horas</p>
                </div>
                <div>
                  <span className="text-gray-600">Total:</span>
                  <p className="font-medium text-2xl text-primary-500">R$ {bookingData.totalPrice}</p>
                </div>
              </div>
            </div>

            {/* Informações de Contato */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Informações de Contato</h4>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                  <Phone className="w-4 h-4" />
                  Ligar
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </button>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

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
            <h2 className="text-2xl font-bold text-gray-900">Agendamento</h2>
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
                    ? 'border-primary-500 bg-primary-500 text-white'
                    : 'border-gray-300 text-gray-400'
                }`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-primary-500' : 'text-gray-400'
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
                  (currentStep === 1 && (!bookingData.date || !bookingData.time || !bookingData.duration)) ||
                  (currentStep === 3 && (!bookingData.address || !bookingData.contact))
                }
                className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
  )
}

export default BookingFlow
