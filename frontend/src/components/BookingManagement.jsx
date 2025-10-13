import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, User, MapPin, Phone, MessageCircle, CheckCircle, XCircle, AlertCircle, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useToast } from '../hooks/use-toast';
import { API_URL } from '../lib/config';
import axios from 'axios';

const BookingManagement = ({ user }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/bookings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar agendamentos",
        description: "Não foi possível carregar seus agendamentos.",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      await axios.patch(`${API_URL}/api/bookings/${bookingId}`, {
        status: status
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: status }
            : booking
        )
      );

      toast({
        title: "Status atualizado!",
        description: `Agendamento ${status === 'confirmed' ? 'confirmado' : 'cancelado'}.`,
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status do agendamento.",
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelado';
      case 'completed':
        return 'Concluído';
      default:
        return 'Desconhecido';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString.substring(0, 5);
  };

  const filteredBookings = (status) => {
    return bookings.filter(booking => booking.status === status);
  };

  const BookingCard = ({ booking }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {getStatusIcon(booking.status)}
            <Badge className={getStatusColor(booking.status)}>
              {getStatusText(booking.status)}
            </Badge>
          </div>
          
          <h3 className="font-semibold text-gray-900 mb-1">
            {booking.service_name || 'Serviço'}
          </h3>
          
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(booking.data_agendamento)}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>{formatTime(booking.horario_inicio)} - {formatTime(booking.horario_fim)}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>{booking.provider_name || 'Prestador'}</span>
            </div>
            
            {booking.endereco && (
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{booking.endereco}</span>
              </div>
            )}
          </div>
          
          {booking.observacoes && (
            <p className="text-sm text-gray-500 mt-2 italic">
              "{booking.observacoes}"
            </p>
          )}
        </div>
        
        <div className="flex flex-col space-y-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedBooking(booking);
              setShowDetails(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          {booking.status === 'pending' && (
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                className="text-green-600 hover:text-green-700"
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                className="text-red-600 hover:text-red-700"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  const BookingDetails = ({ booking, onClose }) => (
    <Dialog open={showDetails} onOpenChange={setShowDetails}>
      <DialogContent className="max-w-2xl" aria-describedby="booking-details-description">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Detalhes do Agendamento</span>
          </DialogTitle>
          <p id="booking-details-description" className="text-sm text-gray-600">
            Visualize todos os detalhes do agendamento selecionado
          </p>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Serviço</label>
              <p className="text-lg font-semibold">{booking.service_name || 'Serviço'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="flex items-center space-x-2">
                {getStatusIcon(booking.status)}
                <Badge className={getStatusColor(booking.status)}>
                  {getStatusText(booking.status)}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Data</label>
              <p className="text-lg">{formatDate(booking.data_agendamento)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Horário</label>
              <p className="text-lg">{formatTime(booking.horario_inicio)} - {formatTime(booking.horario_fim)}</p>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Prestador</label>
            <p className="text-lg">{booking.provider_name || 'Prestador'}</p>
          </div>
          
          {booking.endereco && (
            <div>
              <label className="text-sm font-medium text-gray-500">Endereço</label>
              <p className="text-lg">{booking.endereco}</p>
            </div>
          )}
          
          {booking.observacoes && (
            <div>
              <label className="text-sm font-medium text-gray-500">Observações</label>
              <p className="text-lg italic">"{booking.observacoes}"</p>
            </div>
          )}
          
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            {booking.status === 'pending' && (
              <>
                <Button
                  onClick={() => {
                    updateBookingStatus(booking.id, 'confirmed');
                    onClose();
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Confirmar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    updateBookingStatus(booking.id, 'cancelled');
                    onClose();
                  }}
                >
                  Cancelar
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando agendamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Meus Agendamentos</h2>
        <Button onClick={loadBookings} variant="outline">
          Atualizar
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Todos ({bookings.length})</TabsTrigger>
          <TabsTrigger value="pending">Pendentes ({filteredBookings('pending').length})</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmados ({filteredBookings('confirmed').length})</TabsTrigger>
          <TabsTrigger value="completed">Concluídos ({filteredBookings('completed').length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelados ({filteredBookings('cancelled').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <AnimatePresence>
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum agendamento</h3>
                <p className="text-gray-500">Você ainda não tem agendamentos.</p>
              </div>
            ) : (
              bookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </AnimatePresence>
        </TabsContent>

        {['pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            <AnimatePresence>
              {filteredBookings(status).length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum agendamento {getStatusText(status).toLowerCase()}
                  </h3>
                  <p className="text-gray-500">
                    Não há agendamentos com status "{getStatusText(status)}".
                  </p>
                </div>
              ) : (
                filteredBookings(status).map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              )}
            </AnimatePresence>
          </TabsContent>
        ))}
      </Tabs>

      {selectedBooking && (
        <BookingDetails 
          booking={selectedBooking} 
          onClose={() => {
            setShowDetails(false);
            setSelectedBooking(null);
          }} 
        />
      )}
    </div>
  );
};

export default BookingManagement;
