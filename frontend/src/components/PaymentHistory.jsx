import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useToast } from '../hooks/use-toast';
import { API_URL } from '../lib/config';
import axios from 'axios';
import { CreditCard, Smartphone, CheckCircle, Clock, XCircle, Download, Filter } from 'lucide-react';

const PaymentHistory = ({ user }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  const loadPaymentHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/profile/payments`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setPayments(response.data.payments || []);
    } catch (error) {
      console.error('Erro ao carregar histórico de pagamentos:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar histórico",
        description: "Não foi possível carregar seu histórico de pagamentos."
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'Aprovado';
      case 'pending':
        return 'Pendente';
      case 'rejected':
        return 'Rejeitado';
      default:
        return 'Desconhecido';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'pix':
        return <Smartphone className="h-4 w-4" />;
      case 'credit_card':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getMethodName = (method) => {
    switch (method) {
      case 'pix':
        return 'PIX';
      case 'credit_card':
        return 'Cartão de Crédito';
      default:
        return 'Pagamento';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true;
    return payment.status === filter;
  });

  const exportPayments = () => {
    const csvContent = [
      ['Data', 'Método', 'Status', 'Valor', 'ID do Pagamento'],
      ...filteredPayments.map(payment => [
        formatDate(payment.created_at),
        getMethodName(payment.payment_method),
        getStatusText(payment.status),
        formatCurrency(payment.amount),
        payment.payment_id
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pagamentos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Exportação realizada!",
      description: "Seu histórico de pagamentos foi exportado com sucesso."
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pagamentos</CardTitle>
          <CardDescription>Carregando seu histórico de pagamentos...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Histórico de Pagamentos</CardTitle>
            <CardDescription>
              Visualize todos os seus pagamentos realizados
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="all">Todos</option>
              <option value="approved">Aprovados</option>
              <option value="pending">Pendentes</option>
              <option value="rejected">Rejeitados</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={exportPayments}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredPayments.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum pagamento encontrado
            </h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'Você ainda não realizou nenhum pagamento.'
                : `Nenhum pagamento com status "${getStatusText(filter)}" encontrado.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getMethodIcon(payment.payment_method)}
                    <span className="text-sm text-gray-600">
                      {getMethodName(payment.payment_method)}
                    </span>
                  </div>
                  
                  <div>
                    <div className="font-semibold">
                      {formatCurrency(payment.amount)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatDate(payment.created_at)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(payment.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(payment.status)}
                      {getStatusText(payment.status)}
                    </div>
                  </Badge>
                  
                  <div className="text-right">
                    <div className="text-xs text-gray-500">
                      ID: {payment.payment_id.slice(0, 8)}...
                    </div>
                    {payment.booking_id && (
                      <div className="text-xs text-gray-500">
                        Agendamento: {payment.booking_id.slice(0, 8)}...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {filteredPayments.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>
                Total: {filteredPayments.length} pagamento(s)
              </span>
              <span>
                Valor total: {formatCurrency(
                  filteredPayments
                    .filter(p => p.status === 'approved')
                    .reduce((sum, p) => sum + p.amount, 0)
                )}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentHistory;
