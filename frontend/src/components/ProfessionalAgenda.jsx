// Agenda do Profissional - Alça Hub
import React, { useState, useEffect, useMemo } from 'react'
import { Calendar, Clock, DollarSign, Star, MapPin, User, Phone, MessageCircle, CheckCircle, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const ProfessionalAgenda = ({ professional, service, onBookingSelect, onClose }) => {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedDuration, setSelectedDuration] = useState(1)
  const [bookingStep, setBookingStep] = useState(1) // 1: Seleção, 2: Confirmação, 3: Finalização
  const [availableSlots, setAvailableSlots] = useState([])
  const [pricing, setPricing] = useState(null)

  // Dados do profissional (em produção viria da API)
  const professionalData = {
    id: professional.id,
    name: professional.name,
    avatar: professional.avatar,
    rating: professional.rating,
    reviews: professional.reviews,
    distance: professional.distance,
    isOnline: professional.isOnline,
    specialties: ['Limpeza Residencial', 'Limpeza Comercial', 'Organização'],
    experience: '5 anos',
    languages: ['Português', 'Inglês'],
    responseTime: '2 horas',
    completionRate: 98,
    pricing: {
      hourly: {
        min: 80,
        max: 120,
        average: 100
      },
      packages: [
        {
          name: 'Limpeza Básica',
          duration: 2,
          price: 160,
          description: 'Limpeza geral da casa'
        },
        {
          name: 'Limpeza Completa',
          duration: 4,
          price: 300,
          description: 'Limpeza profunda com organização'
        },
        {
          name: 'Limpeza Premium',
          duration: 6,
          price: 420,
          description: 'Limpeza completa + produtos premium'
        }
      ]
    },
    availability: {
      workingHours: {
        start: '08:00',
        end: '18:00'
      },
      workingDays: ['segunda', 'terça', 'quarta', 'quinta', 'sexta'],
      blockedDates: ['2024-01-20', '2024-01-25'],
      nextAvailable: '2024-01-15'
    },
    services: [
      {
        name: 'Limpeza Residencial',
        basePrice: 100,
        duration: 2,
        description: 'Limpeza completa da residência'
      },
      {
        name: 'Limpeza Comercial',
        basePrice: 120,
        duration: 3,
        description: 'Limpeza de escritórios e comércios'
      },
      {
        name: 'Organização',
        basePrice: 80,
        duration: 2,
        description: 'Organização de ambientes'
      }
    ]
  }

  // Gerar slots disponíveis para uma data
  const generateAvailableSlots = (date) => {
    const slots = []
    const startHour = 8
    const endHour = 18
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const isAvailable = Math.random() > 0.3 // Simular disponibilidade
        
        if (isAvailable) {
          slots.push({
            time: timeString,
            available: true,
            price: professionalData.pricing.hourly.average
          })
        }
      }
    }
    
    return slots
  }

  // Carregar slots disponíveis quando a data for selecionada
  useEffect(() => {
    if (selectedDate) {
      const slots = generateAvailableSlots(selectedDate)
      setAvailableSlots(slots)
    }
  }, [selectedDate])

  // Calcular preço total
  const totalPrice = useMemo(() => {
    if (!selectedTime || !selectedDuration) return 0
    
    const basePrice = professionalData.pricing.hourly.average
    return basePrice * selectedDuration
  }, [selectedTime, selectedDuration, professionalData.pricing.hourly.average])

  // Gerar próximas datas disponíveis
  const getAvailableDates = () => {
    const dates = []
    const today = new Date()
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      const dayOfWeek = date.toLocaleDateString('pt-BR', { weekday: 'long' })
      const isWorkingDay = professionalData.availability.workingDays.includes(dayOfWeek)
      const dateString = date.toISOString().split('T')[0]
      const isBlocked = professionalData.availability.blockedDates.includes(dateString)
      
      if (isWorkingDay && !isBlocked) {
        dates.push({
          date: dateString,
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

  const availableDates = getAvailableDates()

  // Selecionar data
  const handleDateSelect = (date) => {
    setSelectedDate(date)
    setSelectedTime('')
  }

  // Selecionar horário
  const handleTimeSelect = (time) => {
    setSelectedTime(time)
  }

  // Selecionar duração
  const handleDurationSelect = (duration) => {
    setSelectedDuration(duration)
  }

  // Prosseguir para confirmação
  const handleContinue = () => {
    if (selectedDate && selectedTime && selectedDuration) {
      setBookingStep(2)
    }
  }

  // Finalizar agendamento
  const handleConfirmBooking = () => {
    const booking = {
      professional: professionalData,
      service: service,
      date: selectedDate,
      time: selectedTime,
      duration: selectedDuration,
      totalPrice: totalPrice,
      status: 'pending'
    }
    
    onBookingSelect?.(booking)
    setBookingStep(3)
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={professionalData.avatar}
                alt={professionalData.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {professionalData.name}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span>{professionalData.rating} ({professionalData.reviews} avaliações)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{professionalData.distance}km</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Resposta em {professionalData.responseTime}</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          {bookingStep === 1 && (
            <div className="space-y-6">
              {/* Informações do Profissional */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Informações do Profissional</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Especialidades:</span>
                    <p className="font-medium">{professionalData.specialties.join(', ')}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Experiência:</span>
                    <p className="font-medium">{professionalData.experience}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Taxa de Conclusão:</span>
                    <p className="font-medium">{professionalData.completionRate}%</p>
                  </div>
                </div>
              </div>

              {/* Preços */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Preços e Pacotes</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {professionalData.pricing.packages.map((pkg, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-900">{pkg.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{pkg.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary-500">
                          R$ {pkg.price}
                        </span>
                        <span className="text-sm text-gray-500">{pkg.duration}h</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seleção de Data */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Selecione a Data</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availableDates.slice(0, 8).map((dateInfo) => (
                    <button
                      key={dateInfo.date}
                      onClick={() => handleDateSelect(dateInfo.date)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        selectedDate === dateInfo.date
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
              {selectedDate && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Selecione o Horário</h3>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                    {availableSlots.map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => handleTimeSelect(slot.time)}
                        disabled={!slot.available}
                        className={`p-3 rounded-lg border text-center transition-colors ${
                          selectedTime === slot.time
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : slot.available
                            ? 'border-gray-200 hover:border-gray-300'
                            : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <div className="text-sm font-medium">{slot.time}</div>
                        <div className="text-xs text-gray-500">R$ {slot.price}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Seleção de Duração */}
              {selectedTime && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Selecione a Duração</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 6, 8].map((duration) => (
                      <button
                        key={duration}
                        onClick={() => handleDurationSelect(duration)}
                        className={`p-4 rounded-lg border text-center transition-colors ${
                          selectedDuration === duration
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-lg font-semibold">{duration}h</div>
                        <div className="text-sm text-gray-500">
                          R$ {professionalData.pricing.hourly.average * duration}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Resumo e Botão Continuar */}
              {selectedDate && selectedTime && selectedDuration && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Resumo do Agendamento</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Data:</span>
                      <p className="font-medium">
                        {new Date(selectedDate).toLocaleDateString('pt-BR', { 
                          weekday: 'long', 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Horário:</span>
                      <p className="font-medium">{selectedTime}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Duração:</span>
                      <p className="font-medium">{selectedDuration} horas</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-2xl font-bold text-green-600">
                        R$ {totalPrice}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleContinue}
                    className="w-full mt-4 bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    Continuar para Confirmação
                  </button>
                </div>
              )}
            </div>
          )}

          {bookingStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900">Confirmação do Agendamento</h3>
              
              {/* Detalhes do Agendamento */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Detalhes do Serviço</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">Profissional:</span>
                    <p className="font-medium">{professionalData.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Serviço:</span>
                    <p className="font-medium">{service.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Data:</span>
                    <p className="font-medium">
                      {new Date(selectedDate).toLocaleDateString('pt-BR', { 
                        weekday: 'long', 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Horário:</span>
                    <p className="font-medium">{selectedTime}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Duração:</span>
                    <p className="font-medium">{selectedDuration} horas</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Total:</span>
                    <p className="font-medium text-2xl text-primary-500">R$ {totalPrice}</p>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-4">
                <button
                  onClick={() => setBookingStep(1)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={handleConfirmBooking}
                  className="flex-1 bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Confirmar Agendamento
                </button>
              </div>
            </div>
          )}

          {bookingStep === 3 && (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Agendamento Confirmado!
              </h3>
              <p className="text-gray-600 mb-6">
                Seu agendamento foi confirmado com sucesso. Você receberá uma confirmação por email.
              </p>
              <button
                onClick={onClose}
                className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors"
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default ProfessionalAgenda
