// Dashboard Aprimorado com Busca e Agendamento - Alça Hub
import React, { useState, useEffect } from 'react'
import { Search, MapPin, Calendar, Star, Filter, Clock, Users, TrendingUp, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import EnhancedSearchSystem from './EnhancedSearchSystem'
import ProfessionalAgenda from './ProfessionalAgenda'
import BookingFlow from './BookingFlow'
import PricingDisplay from './PricingDisplay'
import AvailabilityCalendar from './AvailabilityCalendar'

const EnhancedDashboard = () => {
  const [activeTab, setActiveTab] = useState('search')
  const [searchResults, setSearchResults] = useState([])
  const [selectedProfessional, setSelectedProfessional] = useState(null)
  const [selectedService, setSelectedService] = useState(null)
  const [showAgenda, setShowAgenda] = useState(false)
  const [showBooking, setShowBooking] = useState(false)
  const [showPricing, setShowPricing] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [recentBookings, setRecentBookings] = useState([])
  const [favorites, setFavorites] = useState([])
  const [scheduledAppointments, setScheduledAppointments] = useState([])

  // Dados de exemplo
  const mockData = {
    user: {
      name: 'João Silva',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      location: 'São Paulo, SP',
      preferences: ['limpeza', 'manutenção', 'tecnologia']
    },
    stats: {
      totalBookings: 12,
      completedBookings: 10,
      pendingBookings: 2,
      totalSpent: 1250,
      averageRating: 4.8
    },
    scheduledAppointments: [
      {
        id: 1,
        service: 'Limpeza Residencial',
        professional: 'João Silva',
        date: '2024-01-20',
        time: '09:00',
        duration: 2,
        status: 'confirmado',
        address: 'Rua das Flores, 123 - Vila Madalena, São Paulo'
      },
      {
        id: 2,
        service: 'Organização Residencial',
        professional: 'Maria Santos',
        date: '2024-01-22',
        time: '14:00',
        duration: 3,
        status: 'pendente',
        address: 'Rua das Flores, 123 - Vila Madalena, São Paulo'
      },
      {
        id: 3,
        service: 'Limpeza Comercial',
        professional: 'Carlos Oliveira',
        date: '2024-01-25',
        time: '08:00',
        duration: 4,
        status: 'confirmado',
        address: 'Av. Paulista, 1000 - Bela Vista, São Paulo'
      }
    ],
    recentBookings: [
      {
        id: 1,
        service: 'Limpeza Residencial',
        professional: 'Maria Silva',
        date: '2024-01-15',
        time: '14:00',
        status: 'completed',
        rating: 5
      },
      {
        id: 2,
        service: 'Manutenção de Computador',
        professional: 'João Santos',
        date: '2024-01-20',
        time: '10:00',
        status: 'pending',
        rating: null
      }
    ]
  }

  // Carregar dados iniciais
  useEffect(() => {
    setRecentBookings(mockData.recentBookings)
    setFavorites(JSON.parse(localStorage.getItem('favorites') || '[]'))
  }, [])

  // Handlers
  const handleSearchResults = (results) => {
    setSearchResults(results)
  }

  const handleProfessionalSelect = (professional) => {
    setSelectedProfessional(professional)
    setSelectedService(professional.services?.[0] || null)
    setShowAgenda(true)
  }

  const handleBookingComplete = (bookingData) => {
    console.log('Agendamento concluído:', bookingData)
    setShowBooking(false)
    setShowAgenda(false)
    // Aqui você faria a chamada para a API para salvar o agendamento
  }

  const handlePriceSelect = (pricing) => {
    console.log('Preço selecionado:', pricing)
    setShowPricing(false)
  }

  const handleDateSelect = (date) => {
    console.log('Data selecionada:', date)
  }

  const handleTimeSelect = (time) => {
    console.log('Horário selecionado:', time)
  }

  // Renderizar tabs
  const renderTabs = () => {
    const tabs = [
      { id: 'search', label: 'Buscar Serviços', icon: Search },
      { id: 'bookings', label: 'Meus Agendamentos', icon: Calendar },
      { id: 'favorites', label: 'Favoritos', icon: Star },
      { id: 'stats', label: 'Estatísticas', icon: TrendingUp }
    ]

    return (
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white text-indigo-600 shadow-md border border-indigo-200'
                : 'text-gray-600 hover:text-indigo-700 hover:bg-indigo-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    )
  }

  // Renderizar conteúdo baseado na tab ativa
  const renderContent = () => {
    switch (activeTab) {
      case 'search':
        return (
          <div>
            <EnhancedSearchSystem
              onSearchResults={handleSearchResults}
              onProfessionalSelect={handleProfessionalSelect}
            />
          </div>
        )

      case 'scheduled':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Horários Agendados</h2>
            
            {mockData.scheduledAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum horário agendado
                </h3>
                <p className="text-gray-500">
                  Você ainda não tem agendamentos confirmados
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {mockData.scheduledAppointments.map((appointment) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Calendar className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{appointment.service}</h3>
                            <p className="text-sm text-gray-600">Profissional: {appointment.professional}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(appointment.date).toLocaleDateString('pt-BR')}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>{appointment.time} ({appointment.duration}h)</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate">{appointment.address}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          appointment.status === 'confirmado'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {appointment.status === 'confirmado' ? 'Confirmado' : 'Pendente'}
                        </span>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Ver Detalhes
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )

      case 'bookings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Meus Agendamentos</h2>
            
            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-8 h-8 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{mockData.stats.totalBookings}</div>
                    <div className="text-sm text-gray-600">Total de Agendamentos</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold text-green-600">{mockData.stats.completedBookings}</div>
                    <div className="text-sm text-gray-600">Concluídos</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-8 h-8 text-yellow-500" />
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">{mockData.stats.pendingBookings}</div>
                    <div className="text-sm text-gray-600">Pendentes</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                  <div>
                    <div className="text-2xl font-bold text-purple-600">R$ {mockData.stats.totalSpent}</div>
                    <div className="text-sm text-gray-600">Total Gasto</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de Agendamentos */}
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-primary-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{booking.service}</h3>
                        <p className="text-sm text-gray-600">Profissional: {booking.professional}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(booking.date).toLocaleDateString('pt-BR')} às {booking.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        booking.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {booking.status === 'completed' ? 'Concluído' : 'Pendente'}
                      </span>
                      {booking.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">{booking.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )

      case 'favorites':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Profissionais Favoritos</h2>
            
            {favorites.length === 0 ? (
              <div className="text-center py-12">
                <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum favorito ainda
                </h3>
                <p className="text-gray-500">
                  Adicione profissionais aos seus favoritos para acesso rápido
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.map((favorite) => (
                  <motion.div
                    key={favorite.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={favorite.avatar}
                        alt={favorite.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{favorite.name}</h3>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">{favorite.rating}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{favorite.specialty}</p>
                    <button
                      onClick={() => {
                        setSelectedProfessional(favorite)
                        setShowAgenda(true)
                      }}
                      className="w-full bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600 transition-colors"
                    >
                      Ver Agenda
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )

      case 'stats':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Estatísticas</h2>
            
            {/* Gráficos e métricas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Gastos por Mês</h3>
                <div className="space-y-3">
                  {['Janeiro', 'Fevereiro', 'Março', 'Abril'].map((month, index) => (
                    <div key={month} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{month}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-500 h-2 rounded-full"
                            style={{ width: `${(index + 1) * 25}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          R$ {300 + index * 100}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Serviços Mais Utilizados</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Limpeza Residencial', count: 8, percentage: 67 },
                    { name: 'Manutenção', count: 3, percentage: 25 },
                    { name: 'Entrega', count: 1, percentage: 8 }
                  ].map((service) => (
                    <div key={service.name} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{service.name}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${service.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{service.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{mockData.user.location}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={mockData.user.avatar}
                  alt={mockData.user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-sm font-medium text-gray-900">{mockData.user.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabs()}
        {renderContent()}
      </div>

      {/* Modais */}
      <AnimatePresence>
        {showAgenda && selectedProfessional && selectedService && (
          <ProfessionalAgenda
            professional={selectedProfessional}
            service={selectedService}
            onBookingSelect={(booking) => {
              setShowBooking(true)
              setShowAgenda(false)
            }}
            onClose={() => setShowAgenda(false)}
          />
        )}

        {showBooking && selectedProfessional && selectedService && (
          <BookingFlow
            professional={selectedProfessional}
            service={selectedService}
            onBookingComplete={handleBookingComplete}
            onClose={() => setShowBooking(false)}
          />
        )}

        {showPricing && selectedProfessional && (
          <PricingDisplay
            professional={selectedProfessional}
            service={selectedService}
            onPriceSelect={handlePriceSelect}
            onClose={() => setShowPricing(false)}
          />
        )}

        {showCalendar && selectedProfessional && (
          <AvailabilityCalendar
            professional={selectedProfessional}
            onDateSelect={handleDateSelect}
            onTimeSelect={handleTimeSelect}
            onClose={() => setShowCalendar(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default EnhancedDashboard
