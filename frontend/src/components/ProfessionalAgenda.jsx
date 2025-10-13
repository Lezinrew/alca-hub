// Agenda do Profissional - Alça Hub
import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Calendar, Clock, DollarSign, Star, MapPin, User, Phone, MessageCircle, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import DatePicker from './DatePicker'

const ProfessionalAgenda = ({ professional, service = null, onBookingSelect, onClose }) => {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedDuration, setSelectedDuration] = useState(1)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [bookingStep, setBookingStep] = useState(1) // 1: Seleção, 2: Confirmação, 3: Finalização
  const [availableSlots, setAvailableSlots] = useState([])
  const [pricing, setPricing] = useState(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const confirmButtonRef = useRef(null)

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
      workingDays: ['segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'],
      blockedDates: [],
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
    const selectedDateObj = new Date(date)
    const today = new Date()
    const isToday = selectedDateObj.toDateString() === today.toDateString()
    const currentHour = today.getHours()
    const currentMinute = today.getMinutes()
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        
        // Verificar se é um horário passado (apenas se for hoje)
        let isPastTime = false
        if (isToday) {
          const slotHour = hour
          const slotMinute = minute
          if (slotHour < currentHour || (slotHour === currentHour && slotMinute <= currentMinute)) {
            isPastTime = true
          }
        }
        
        const isAvailable = Math.random() > 0.3 // Simular disponibilidade
        
        if (isAvailable) {
          slots.push({
            time: timeString,
            available: true,
            price: professionalData.pricing.hourly.average,
            isPastTime: isPastTime
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
    
    // Incluir hoje se ainda houver horários disponíveis
    const todayString = today.toISOString().split('T')[0]
    const todayDayOfWeek = today.toLocaleDateString('pt-BR', { weekday: 'long' })
    const isTodayWorkingDay = professionalData.availability.workingDays.includes(todayDayOfWeek)
    const isTodayBlocked = professionalData.availability.blockedDates.includes(todayString)
    
    if (isTodayWorkingDay && !isTodayBlocked) {
      dates.push({
        date: todayString,
        display: 'Hoje - ' + today.toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          weekday: 'long'
        }),
        available: true
      })
    }
    
    // Próximos 30 dias
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

  // Selecionar pacote
  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg)
    setSelectedDuration(pkg.duration)
  }

  // Prosseguir para confirmação
  const handleContinue = () => {
    if (selectedDate && selectedTime && (selectedPackage || selectedDuration)) {
      setBookingStep(2)
    }
  }

  // Finalizar agendamento
  const handleConfirmBooking = () => {
    const booking = {
      professional: professionalData,
      service: service || { name: 'Limpeza Residencial', basePrice: 100 },
      package: selectedPackage,
      date: selectedDate,
      time: selectedTime,
      duration: selectedDuration,
      totalPrice: selectedPackage ? selectedPackage.price : totalPrice,
      status: 'pending'
    }
    
    onBookingSelect?.(booking)
    setBookingStep(3)
  }

  const handleDatePickerSelect = (bookingData) => {
    // Agendamento selecionado
    // Sincronizar os dados selecionados
    if (bookingData.date) {
      setSelectedDate(bookingData.date)
    }
    if (bookingData.time) {
      setSelectedTime(bookingData.time)
    }
    if (bookingData.package) {
      setSelectedPackage(bookingData.package)
    }
    setShowDatePicker(false)
  }

  const handleCloseDatePicker = () => {
    setShowDatePicker(false)
    // Retornar à página anterior e focar no botão de confirmação
    setTimeout(() => {
      if (confirmButtonRef.current) {
        confirmButtonRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
        confirmButtonRef.current.focus()
      }
    }, 100)
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

              {/* Seleção de Pacotes */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Escolha um Pacote</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {professionalData.pricing.packages.map((pkg, index) => (
                    <button
                      key={index}
                      onClick={() => handlePackageSelect(pkg)}
                      className={`p-4 rounded-lg border text-left transition-colors ${
                        selectedPackage?.name === pkg.name
                          ? 'border-blue-400 bg-blue-100 text-blue-800'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <h4 className="font-semibold text-gray-900 mb-2">{pkg.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-green-600">
                          R$ {pkg.price}
                        </span>
                        <span className="text-sm text-gray-500">{pkg.duration}h</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Seleção de Data */}
              <div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availableDates.slice(0, 8).map((dateInfo) => (
                    <button
                      key={dateInfo.date}
                      onClick={() => handleDateSelect(dateInfo.date)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        selectedDate === dateInfo.date
                          ? 'border-blue-400 bg-blue-100 text-blue-800'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-sm font-medium">{dateInfo.display}</div>
                    </button>
                  ))}
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => setShowDatePicker(true)}
                    className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors"
                  >
                    📅 Ver mais datas disponíveis
                  </button>
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
                        onClick={() => !slot.isPastTime ? handleTimeSelect(slot.time) : null}
                        disabled={!slot.available || slot.isPastTime}
                        className={`p-3 rounded-lg border text-center transition-colors ${
                          selectedTime === slot.time
                            ? 'border-blue-400 bg-blue-100 text-blue-800'
                            : slot.isPastTime
                            ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed opacity-50'
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
                            ? 'border-blue-400 bg-blue-100 text-blue-800'
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

              {/* Botão Principal para Abrir Calendário - Só mostra se não tiver data selecionada */}
              {!selectedDate && (
                <div className="mt-8">
                  <button
                    onClick={() => setShowDatePicker(true)}
                    className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-5 h-5" />
                    Selecione a Data
                  </button>
                </div>
              )}

              {/* Botão para Abrir Calendário quando já tem pacote mas não tem data */}
              {selectedDate && !selectedTime && (selectedPackage || selectedDuration) && (
                <div className="mt-4">
                  <button
                    onClick={() => setShowDatePicker(true)}
                    className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    Selecionar Horário
                  </button>
                </div>
              )}

              {/* Resumo e Botão Continuar */}
              {(selectedPackage || selectedDuration) && (
                <div className={`rounded-lg p-4 ${
                  selectedDate && selectedTime && (selectedPackage || selectedDuration) 
                    ? 'bg-green-50 border-2 border-green-200' 
                    : 'bg-blue-50 border-2 border-blue-200'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Resumo do Agendamento</h3>
                    {selectedDate && selectedTime && (selectedPackage || selectedDuration) && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Completo</span>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {selectedDate && (
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
                    )}
                    {selectedTime && (
                      <div>
                        <span className="text-gray-600">Horário:</span>
                        <p className="font-medium">{selectedTime}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">Pacote:</span>
                      <p className="font-medium">{selectedPackage?.name || 'Serviço Personalizado'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Duração:</span>
                      <p className="font-medium">{selectedDuration} horas</p>
                    </div>
                    {!selectedDate && (
                      <div className="md:col-span-3">
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            <strong>⚠️ Atenção:</strong> Selecione uma data para continuar.
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedDate && !selectedTime && (
                      <div className="md:col-span-3">
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>📅 Data selecionada:</strong> Agora escolha um horário.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-2xl font-bold text-green-600">
                        R$ {selectedPackage ? selectedPackage.price : totalPrice}
                      </span>
                    </div>
                  </div>
                  
                  {/* Botões de Ação - Sempre visíveis quando pacote selecionado */}
                  <div className="mt-4">
                    {!selectedDate && !selectedTime && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Próximo passo:</strong> Selecione a data e horário para continuar com o agendamento.
                        </p>
                      </div>
                    )}
                    
                    {selectedDate && selectedTime && (selectedPackage || selectedDuration) && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">
                          <strong>✅ Tudo selecionado!</strong> Você pode finalizar o agendamento.
                        </p>
                      </div>
                    )}
                    
                    <div className="flex gap-3">
                      {selectedDate && selectedTime ? (
                        // Se data e horário estão selecionados, mostrar botão de finalizar
                        <button
                          onClick={handleConfirmBooking}
                          className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Finalizar Agendamento
                        </button>
                      ) : (
                        // Se apenas pacote está selecionado, mostrar botão para continuar
                        <button
                          onClick={handleContinue}
                          disabled={!selectedPackage && !selectedDuration}
                          className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center gap-2"
                        >
                          {selectedDate && selectedTime ? 'Finalizar Agendamento' : 'Continuar para Data/Horário'}
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
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
                    <p className="font-medium">{service?.name || 'Limpeza Residencial'}</p>
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
                  className="flex-1 bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
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
      
      {/* DatePicker Modal */}
      {showDatePicker && (
        <DatePicker
          onDateSelect={handleDatePickerSelect}
          onClose={handleCloseDatePicker}
          professional={professionalData}
        />
      )}
    </div>
  )
}

export default ProfessionalAgenda
