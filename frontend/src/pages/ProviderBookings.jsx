import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  Eye,
  Edit
} from 'lucide-react';

const ProviderBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');

  const statusOptions = [
    { value: 'all', label: 'Todos os status' },
    { value: 'pending', label: 'Pendente' },
    { value: 'confirmed', label: 'Confirmado' },
    { value: 'in_progress', label: 'Em Andamento' },
    { value: 'completed', label: 'Concluído' },
    { value: 'cancelled', label: 'Cancelado' }
  ];

  useEffect(() => {
    // Simular carregamento de dados
    const loadBookings = async () => {
      setIsLoading(true);
      
      setTimeout(() => {
        setBookings([
          {
            id: 1,
            client: {
              name: 'Maria Silva',
              email: 'maria.silva@email.com',
              phone: '(11) 99999-9999',
              avatar: '/images/avatar1.jpg'
            },
            service: {
              title: 'Limpeza Residencial Completa',
              category: 'Limpeza',
              duration: '4 horas'
            },
            date: '2024-01-15',
            time: '14:00',
            status: 'confirmed',
            value: 120.00,
            address: {
              street: 'Rua das Flores, 123',
              neighborhood: 'Centro',
              city: 'São Paulo',
              state: 'SP',
              zipCode: '01234-567'
            },
            notes: 'Cliente solicitou atenção especial para o quarto das crianças.',
            createdAt: '2024-01-10T10:30:00Z'
          },
          {
            id: 2,
            client: {
              name: 'João Santos',
              email: 'joao.santos@email.com',
              phone: '(11) 88888-8888',
              avatar: '/images/avatar2.jpg'
            },
            service: {
              title: 'Manutenção Elétrica',
              category: 'Elétrica',
              duration: '2 horas'
            },
            date: '2024-01-16',
            time: '09:00',
            status: 'pending',
            value: 150.00,
            address: {
              street: 'Av. Paulista, 1000',
              neighborhood: 'Bela Vista',
              city: 'São Paulo',
              state: 'SP',
              zipCode: '01310-100'
            },
            notes: 'Problema com a fiação do banheiro.',
            createdAt: '2024-01-11T14:20:00Z'
          },
          {
            id: 3,
            client: {
              name: 'Ana Costa',
              email: 'ana.costa@email.com',
              phone: '(11) 77777-7777',
              avatar: '/images/avatar3.jpg'
            },
            service: {
              title: 'Pintura de Paredes',
              category: 'Pintura',
              duration: '6 horas'
            },
            date: '2024-01-17',
            time: '16:00',
            status: 'in_progress',
            value: 200.00,
            address: {
              street: 'Rua Augusta, 456',
              neighborhood: 'Consolação',
              city: 'São Paulo',
              state: 'SP',
              zipCode: '01305-000'
            },
            notes: 'Pintura da sala e quarto principal.',
            createdAt: '2024-01-12T09:15:00Z'
          },
          {
            id: 4,
            client: {
              name: 'Carlos Oliveira',
              email: 'carlos.oliveira@email.com',
              phone: '(11) 66666-6666',
              avatar: '/images/avatar4.jpg'
            },
            service: {
              title: 'Jardinagem',
              category: 'Jardinagem',
              duration: '3 horas'
            },
            date: '2024-01-18',
            time: '08:00',
            status: 'completed',
            value: 80.00,
            address: {
              street: 'Rua dos Jardins, 789',
              neighborhood: 'Jardins',
              city: 'São Paulo',
              state: 'SP',
              zipCode: '01452-000'
            },
            notes: 'Manutenção do jardim e poda das árvores.',
            createdAt: '2024-01-13T16:45:00Z'
          }
        ]);
        setIsLoading(false);
      }, 1000);
    };

    loadBookings();
  }, []);

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.service.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    const matchesDate = !selectedDate || booking.date === selectedDate;
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'confirmed':
        return 'Confirmado';
      case 'in_progress':
        return 'Em Andamento';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Desconhecido';
    }
  };

  const BookingCard = ({ booking }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {booking.client.name}
              </h3>
              <p className="text-sm text-gray-600">{booking.service.title}</p>
              <div className="flex items-center mt-1 text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(booking.date).toLocaleDateString('pt-BR')} às {booking.time}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
              {getStatusIcon(booking.status)}
              <span className="ml-1">{getStatusLabel(booking.status)}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Informações do Cliente</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                {booking.client.email}
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                {booking.client.phone}
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Localização</h4>
            <div className="flex items-start">
              <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
              <div className="text-sm text-gray-600">
                <div>{booking.address.street}</div>
                <div>{booking.address.neighborhood}, {booking.address.city} - {booking.address.state}</div>
                <div>CEP: {booking.address.zipCode}</div>
              </div>
            </div>
          </div>
        </div>

        {booking.notes && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-1">Observações</h4>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
              {booking.notes}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              <span className="font-medium">Duração:</span> {booking.service.duration}
            </div>
            <div className="text-sm text-gray-500">
              <span className="font-medium">Categoria:</span> {booking.service.category}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-lg font-semibold text-green-600">
                R$ {booking.value.toFixed(2)}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Eye className="w-4 h-4 mr-1" />
                Ver
              </button>
              <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <MessageSquare className="w-4 h-4 mr-1" />
                Chat
              </button>
              {booking.status === 'pending' && (
                <button className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Confirmar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando agendamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Agendamentos
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Calendar className="w-4 h-4 mr-2" />
                Calendário
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por cliente ou serviço..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-6">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Calendar className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum agendamento encontrado
              </h3>
              <p className="text-gray-600">
                {searchTerm || filterStatus !== 'all' || selectedDate
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Você ainda não possui agendamentos.'
                }
              </p>
            </div>
          ) : (
            filteredBookings.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderBookings;
