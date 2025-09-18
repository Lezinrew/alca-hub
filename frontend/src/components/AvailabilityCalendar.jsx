// Calendário de Disponibilidade - Alça Hub
import React, { useState, useEffect, useMemo } from 'react'
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Star, MapPin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const AvailabilityCalendar = ({ professional, onDateSelect, onTimeSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [availability, setAvailability] = useState({})
  const [timeSlots, setTimeSlots] = useState([])
  const [loading, setLoading] = useState(false)

  // Dados de disponibilidade do profissional
  const professionalAvailability = {
    workingHours: {
      start: '08:00',
      end: '18:00'
    },
    workingDays: ['segunda', 'terça', 'quarta', 'quinta', 'sexta'],
    blockedDates: ['2024-01-20', '2024-01-25'],
    timeOff: [
      { start: '2024-01-15', end: '2024-01-17', reason: 'Férias' },
      { start: '2024-02-10', end: '2024-02-12', reason: 'Treinamento' }
    ],
    preferences: {
      minAdvanceBooking: 24, // horas
      maxAdvanceBooking: 30, // dias
      slotDuration: 30, // minutos
      maxBookingsPerDay: 8
    }
  }

  // Gerar disponibilidade para um mês
  const generateMonthAvailability = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const availability = {}

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day)
      const dayOfWeek = currentDate.toLocaleDateString('pt-BR', { weekday: 'long' })
      const dateString = currentDate.toISOString().split('T')[0]
      
      const isWorkingDay = professionalAvailability.workingDays.includes(dayOfWeek)
      const isBlocked = professionalAvailability.blockedDates.includes(dateString)
      const isTimeOff = professionalAvailability.timeOff.some(period => 
        dateString >= period.start && dateString <= period.end
      )
      
      if (isWorkingDay && !isBlocked && !isTimeOff) {
        // Gerar slots disponíveis para o dia
        const slots = generateTimeSlots(dateString)
        availability[dateString] = {
          available: true,
          slots: slots,
          totalSlots: slots.length,
          bookedSlots: Math.floor(Math.random() * Math.min(slots.length, 3)), // Simular alguns slots ocupados
          status: 'available'
        }
      } else {
        availability[dateString] = {
          available: false,
          slots: [],
          totalSlots: 0,
          bookedSlots: 0,
          status: isTimeOff ? 'time_off' : isBlocked ? 'blocked' : 'not_working'
        }
      }
    }

    return availability
  }

  // Gerar slots de tempo para um dia
  const generateTimeSlots = (date) => {
    const slots = []
    const startHour = 8
    const endHour = 18
    const slotDuration = professionalAvailability.preferences.slotDuration

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const isAvailable = Math.random() > 0.2 // 80% de chance de estar disponível
        
        slots.push({
          time: timeString,
          available: isAvailable,
          price: professional.pricing?.hourly?.average || 100,
          duration: slotDuration
        })
      }
    }

    return slots
  }

  // Carregar disponibilidade do mês atual
  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      const monthAvailability = generateMonthAvailability(currentMonth)
      setAvailability(monthAvailability)
      setLoading(false)
    }, 500)
  }, [currentMonth])

  // Carregar slots de tempo quando uma data for selecionada
  useEffect(() => {
    if (selectedDate && availability[selectedDate]) {
      setTimeSlots(availability[selectedDate].slots)
    }
  }, [selectedDate, availability])

  // Navegar entre meses
  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(currentMonth.getMonth() + direction)
    setCurrentMonth(newMonth)
    setSelectedDate('')
    setSelectedTime('')
  }

  // Selecionar data
  const handleDateSelect = (date) => {
    if (availability[date]?.available) {
      setSelectedDate(date)
      onDateSelect?.(date)
    }
  }

  // Selecionar horário
  const handleTimeSelect = (time) => {
    setSelectedTime(time)
    onTimeSelect?.(time)
  }

  // Renderizar calendário
  const renderCalendar = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const days = []
    
    // Dias do mês anterior
    for (let i = 0; i < startingDay; i++) {
      days.push(null)
    }
    
    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateString = date.toISOString().split('T')[0]
      const dayAvailability = availability[dateString]
      
      days.push({
        day,
        date: dateString,
        availability: dayAvailability
      })
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Cabeçalho dos dias da semana */}
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
        
        {/* Dias do calendário */}
        {days.map((dayData, index) => {
          if (!dayData) {
            return <div key={index} className="p-2"></div>
          }

          const { day, date, availability: dayAvailability } = dayData
          const isSelected = selectedDate === date
          const isToday = date === new Date().toISOString().split('T')[0]

          return (
            <motion.button
              key={date}
              onClick={() => handleDateSelect(date)}
              disabled={!dayAvailability?.available}
              className={`p-2 text-center rounded-lg transition-colors ${
                isSelected
                  ? 'bg-primary-500 text-white'
                  : dayAvailability?.available
                  ? 'bg-green-50 text-green-700 hover:bg-green-100'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
              whileHover={dayAvailability?.available ? { scale: 1.05 } : {}}
              whileTap={dayAvailability?.available ? { scale: 0.95 } : {}}
            >
              <div className="text-sm font-medium">{day}</div>
              {dayAvailability?.available && (
                <div className="text-xs mt-1">
                  {dayAvailability.totalSlots - dayAvailability.bookedSlots} slots
                </div>
              )}
            </motion.button>
          )
        })}
      </div>
    )
  }

  // Renderizar slots de tempo
  const renderTimeSlots = () => {
    if (!selectedDate || timeSlots.length === 0) return null

    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Horários Disponíveis para {new Date(selectedDate).toLocaleDateString('pt-BR')}
        </h3>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
          {timeSlots.map((slot, index) => (
            <motion.button
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
              whileHover={slot.available ? { scale: 1.05 } : {}}
              whileTap={slot.available ? { scale: 0.95 } : {}}
            >
              <div className="text-sm font-medium">{slot.time}</div>
              <div className="text-xs text-gray-500">R$ {slot.price}</div>
            </motion.button>
          ))}
        </div>
      </div>
    )
  }

  // Renderizar informações do profissional
  const renderProfessionalInfo = () => {
    return (
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-4">
          <img
            src={professional.avatar}
            alt={professional.name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{professional.name}</h3>
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
    )
  }

  // Renderizar estatísticas de disponibilidade
  const renderAvailabilityStats = () => {
    const totalDays = Object.keys(availability).length
    const availableDays = Object.values(availability).filter(day => day.available).length
    const totalSlots = Object.values(availability).reduce((sum, day) => sum + day.totalSlots, 0)
    const bookedSlots = Object.values(availability).reduce((sum, day) => sum + day.bookedSlots, 0)

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{availableDays}</div>
          <div className="text-sm text-gray-600">Dias Disponíveis</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{totalSlots - bookedSlots}</div>
          <div className="text-sm text-gray-600">Slots Livres</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {Math.round(((totalSlots - bookedSlots) / totalSlots) * 100)}%
          </div>
          <div className="text-sm text-gray-600">Disponibilidade</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Informações do Profissional */}
      {renderProfessionalInfo()}

      {/* Estatísticas de Disponibilidade */}
      {renderAvailabilityStats()}

      {/* Navegação do Calendário */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          ←
        </button>
        <h2 className="text-xl font-semibold text-gray-900">
          {currentMonth.toLocaleDateString('pt-BR', { 
            month: 'long', 
            year: 'numeric' 
          })}
        </h2>
        <button
          onClick={() => navigateMonth(1)}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          →
        </button>
      </div>

      {/* Calendário */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          renderCalendar()
        )}
      </div>

      {/* Slots de Tempo */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {renderTimeSlots()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legenda */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Legenda</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 rounded"></div>
            <span>Disponível</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 rounded"></div>
            <span>Indisponível</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary-500 rounded"></div>
            <span>Selecionado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded ring-2 ring-blue-500"></div>
            <span>Hoje</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AvailabilityCalendar
