import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { useToast } from '../hooks/use-toast';
import { API_URL } from '../lib/config';
import axios from 'axios';
import { CreditCard, Smartphone, QrCode, CheckCircle, Clock, XCircle } from 'lucide-react';

const PaymentSystem = ({ booking, onPaymentSuccess, onPaymentCancel }) => {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [paymentData, setPaymentData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [checkingStatus, setCheckingStatus] = useState(false);
  const { toast } = useToast();

  // PIX Payment Form Data
  const [pixData, setPixData] = useState({
    payer_email: '',
    payer_name: '',
    payer_identification: '',
    payer_identification_type: 'CPF'
  });

  // Credit Card Payment Form Data
  const [cardData, setCardData] = useState({
    card_number: '',
    card_holder: '',
    expiry_date: '',
    cvv: '',
    payer_email: '',
    payer_name: '',
    payer_identification: '',
    payer_identification_type: 'CPF'
  });

  const handlePixPayment = async () => {
    if (!pixData.payer_email || !pixData.payer_name || !pixData.payer_identification) {
      toast({
        variant: "destructive",
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios para PIX."
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/payments/pix`,
        {
          booking_id: booking.id,
          ...pixData
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setPaymentData(response.data);
      setPaymentStatus('pending');
      
      toast({
        title: "PIX gerado com sucesso!",
        description: "Escaneie o QR Code ou copie o código PIX para pagar."
      });

      // Start checking payment status
      startStatusCheck(response.data.payment_id);

    } catch (error) {
      console.error('Erro ao criar pagamento PIX:', error);
      toast({
        variant: "destructive",
        title: "Erro no pagamento",
        description: error.response?.data?.detail || "Não foi possível processar o pagamento PIX."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCardPayment = async () => {
    if (!cardData.card_number || !cardData.card_holder || !cardData.expiry_date || !cardData.cvv) {
      toast({
        variant: "destructive",
        title: "Dados incompletos",
        description: "Preencha todos os campos do cartão."
      });
      return;
    }

    setLoading(true);
    try {
      // In a real implementation, you would tokenize the card with Mercado Pago
      const cardToken = `card_token_${Date.now()}`;
      
      const response = await axios.post(
        `${API_URL}/api/payments/credit-card`,
        {
          booking_id: booking.id,
          card_token: cardToken,
          installments: 1,
          payer_email: cardData.payer_email,
          payer_name: cardData.payer_name,
          payer_identification: cardData.payer_identification,
          payer_identification_type: cardData.payer_identification_type
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setPaymentData(response.data);
      setPaymentStatus(response.data.status);
      
      if (response.data.status === 'approved') {
        toast({
          title: "Pagamento aprovado!",
          description: "Seu pagamento foi processado com sucesso."
        });
        onPaymentSuccess?.(response.data);
      } else {
        toast({
          title: "Pagamento pendente",
          description: "Aguardando confirmação do pagamento."
        });
        startStatusCheck(response.data.payment_id);
      }

    } catch (error) {
      console.error('Erro ao processar pagamento com cartão:', error);
      toast({
        variant: "destructive",
        title: "Erro no pagamento",
        description: error.response?.data?.detail || "Não foi possível processar o pagamento."
      });
    } finally {
      setLoading(false);
    }
  };

  const startStatusCheck = (paymentId) => {
    setCheckingStatus(true);
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/payments/${paymentId}/status`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        setPaymentStatus(response.data.status);
        
        if (response.data.status === 'approved') {
          clearInterval(interval);
          setCheckingStatus(false);
          toast({
            title: "Pagamento aprovado!",
            description: "Seu pagamento foi confirmado com sucesso."
          });
          onPaymentSuccess?.(response.data);
        } else if (response.data.status === 'rejected') {
          clearInterval(interval);
          setCheckingStatus(false);
          toast({
            variant: "destructive",
            title: "Pagamento rejeitado",
            description: "Seu pagamento foi rejeitado. Tente novamente."
          });
        }
      } catch (error) {
        console.error('Erro ao verificar status do pagamento:', error);
      }
    }, 3000); // Check every 3 seconds

    // Stop checking after 5 minutes
    setTimeout(() => {
      clearInterval(interval);
      setCheckingStatus(false);
    }, 300000);
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

  if (paymentData && paymentStatus === 'pending') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(paymentStatus)}
            Pagamento PIX - {getStatusText(paymentStatus)}
          </CardTitle>
          <CardDescription>
            {checkingStatus ? 'Verificando status do pagamento...' : 'Aguardando confirmação do pagamento'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {paymentData.qr_code_base64 && (
            <div className="text-center">
              <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 inline-block">
                <img 
                  src={`data:image/png;base64,${paymentData.qr_code_base64}`} 
                  alt="QR Code PIX" 
                  className="w-48 h-48 mx-auto"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Escaneie o QR Code com seu app bancário
              </p>
            </div>
          )}

          {paymentData.qr_code && (
            <div className="space-y-2">
              <Label>Código PIX (Copiar e Colar)</Label>
              <div className="flex gap-2">
                <Input 
                  value={paymentData.qr_code} 
                  readOnly 
                  className="font-mono text-xs"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(paymentData.qr_code);
                    toast({ title: "Código PIX copiado!" });
                  }}
                >
                  Copiar
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Valor: <span className="font-semibold">R$ {booking.preco_total.toFixed(2)}</span>
            </div>
            <Badge className={getStatusColor(paymentStatus)}>
              {getStatusText(paymentStatus)}
            </Badge>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onPaymentCancel}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              onClick={() => startStatusCheck(paymentData.payment_id)}
              disabled={checkingStatus}
              className="flex-1"
            >
              {checkingStatus ? 'Verificando...' : 'Verificar Status'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (paymentData && paymentStatus === 'approved') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Pagamento Aprovado!
          </CardTitle>
          <CardDescription>
            Seu pagamento foi processado com sucesso.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              R$ {booking.preco_total.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600">
              Agendamento confirmado e pago
            </p>
          </div>
          
          <Button 
            onClick={() => onPaymentSuccess?.(paymentData)}
            className="w-full"
          >
            Continuar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Pagamento do Serviço</CardTitle>
        <CardDescription>
          Escolha a forma de pagamento para o agendamento #{booking.id.slice(0, 8)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={paymentMethod} onValueChange={setPaymentMethod} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pix" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              PIX
            </TabsTrigger>
            <TabsTrigger value="credit_card" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Cartão
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pix" className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pix_email">Email *</Label>
                  <Input
                    id="pix_email"
                    type="email"
                    value={pixData.payer_email}
                    onChange={(e) => setPixData(prev => ({ ...prev, payer_email: e.target.value }))}
                    placeholder="seu@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="pix_name">Nome Completo *</Label>
                  <Input
                    id="pix_name"
                    value={pixData.payer_name}
                    onChange={(e) => setPixData(prev => ({ ...prev, payer_name: e.target.value }))}
                    placeholder="Seu Nome"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="pix_cpf">CPF *</Label>
                <Input
                  id="pix_cpf"
                  value={pixData.payer_identification}
                  onChange={(e) => setPixData(prev => ({ ...prev, payer_identification: e.target.value }))}
                  placeholder="000.000.000-00"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-blue-800">Pagamento PIX</span>
                </div>
                <p className="text-sm text-blue-700">
                  Pague instantaneamente com PIX. Você receberá um QR Code para escanear com seu app bancário.
                </p>
              </div>

              <Button 
                onClick={handlePixPayment} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Gerando PIX...' : `Pagar R$ ${booking.preco_total.toFixed(2)} com PIX`}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="credit_card" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="card_number">Número do Cartão *</Label>
                <Input
                  id="card_number"
                  value={cardData.card_number}
                  onChange={(e) => setCardData(prev => ({ ...prev, card_number: e.target.value }))}
                  placeholder="0000 0000 0000 0000"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="card_holder">Nome no Cartão *</Label>
                  <Input
                    id="card_holder"
                    value={cardData.card_holder}
                    onChange={(e) => setCardData(prev => ({ ...prev, card_holder: e.target.value }))}
                    placeholder="Nome como no cartão"
                  />
                </div>
                <div>
                  <Label htmlFor="expiry_date">Validade *</Label>
                  <Input
                    id="expiry_date"
                    value={cardData.expiry_date}
                    onChange={(e) => setCardData(prev => ({ ...prev, expiry_date: e.target.value }))}
                    placeholder="MM/AA"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cvv">CVV *</Label>
                  <Input
                    id="cvv"
                    type="password"
                    value={cardData.cvv}
                    onChange={(e) => setCardData(prev => ({ ...prev, cvv: e.target.value }))}
                    placeholder="000"
                  />
                </div>
                <div>
                  <Label htmlFor="installments">Parcelas</Label>
                  <Input
                    id="installments"
                    value="1"
                    disabled
                    placeholder="1x"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="card_email">Email *</Label>
                  <Input
                    id="card_email"
                    type="email"
                    value={cardData.payer_email}
                    onChange={(e) => setCardData(prev => ({ ...prev, payer_email: e.target.value }))}
                    placeholder="seu@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="card_name">Nome Completo *</Label>
                  <Input
                    id="card_name"
                    value={cardData.payer_name}
                    onChange={(e) => setCardData(prev => ({ ...prev, payer_name: e.target.value }))}
                    placeholder="Seu Nome"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="card_cpf">CPF *</Label>
                <Input
                  id="card_cpf"
                  value={cardData.payer_identification}
                  onChange={(e) => setCardData(prev => ({ ...prev, payer_identification: e.target.value }))}
                  placeholder="000.000.000-00"
                />
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-800">Pagamento com Cartão</span>
                </div>
                <p className="text-sm text-green-700">
                  Pagamento seguro com cartão de crédito. Processado pelo Mercado Pago.
                </p>
              </div>

              <Button 
                onClick={handleCardPayment} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Processando...' : `Pagar R$ ${booking.preco_total.toFixed(2)} com Cartão`}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total a pagar:</span>
            <span className="text-lg font-bold">R$ {booking.preco_total.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentSystem;
