import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { useToast } from '../hooks/use-toast';
import { API_URL } from '../lib/config';
import axios from 'axios';
import { CreditCard, Smartphone, Plus, Trash2, Edit, Shield } from 'lucide-react';

const PaymentMethods = ({ user, onUpdate }) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const { toast } = useToast();

  // Form data for adding/editing payment methods
  const [formData, setFormData] = useState({
    tipo: 'cartao',
    nome: '',
    dados: {
      // For credit card
      card_number: '',
      card_holder: '',
      expiry_date: '',
      cvv: '',
      // For PIX
      pix_key: '',
      pix_type: 'email',
      // For bank account
      bank_name: '',
      account_number: '',
      agency: '',
      account_type: 'checking'
    }
  });

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/profile/payment-methods`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setPaymentMethods(response.data.payment_methods || []);
    } catch (error) {
      console.error('Erro ao carregar métodos de pagamento:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar métodos",
        description: "Não foi possível carregar seus métodos de pagamento."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = async () => {
    if (!formData.nome) {
      toast({
        variant: "destructive",
        title: "Nome obrigatório",
        description: "Digite um nome para identificar este método de pagamento."
      });
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/profile/payment-methods`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      toast({
        title: "Método adicionado!",
        description: "Seu método de pagamento foi adicionado com sucesso."
      });

      setShowAddDialog(false);
      setFormData({
        tipo: 'cartao',
        nome: '',
        dados: {}
      });
      loadPaymentMethods();
      onUpdate?.();

    } catch (error) {
      console.error('Erro ao adicionar método de pagamento:', error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar",
        description: error.response?.data?.detail || "Não foi possível adicionar o método de pagamento."
      });
    }
  };

  const handleRemovePaymentMethod = async (methodId) => {
    if (!confirm('Tem certeza que deseja remover este método de pagamento?')) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/api/profile/payment-methods/${methodId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      toast({
        title: "Método removido!",
        description: "Seu método de pagamento foi removido com sucesso."
      });

      loadPaymentMethods();
      onUpdate?.();

    } catch (error) {
      console.error('Erro ao remover método de pagamento:', error);
      toast({
        variant: "destructive",
        title: "Erro ao remover",
        description: error.response?.data?.detail || "Não foi possível remover o método de pagamento."
      });
    }
  };

  const getMethodIcon = (tipo) => {
    switch (tipo) {
      case 'cartao':
        return <CreditCard className="h-5 w-5" />;
      case 'pix':
        return <Smartphone className="h-5 w-5" />;
      case 'conta_bancaria':
        return <Shield className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const getMethodName = (tipo) => {
    switch (tipo) {
      case 'cartao':
        return 'Cartão de Crédito';
      case 'pix':
        return 'PIX';
      case 'conta_bancaria':
        return 'Conta Bancária';
      default:
        return 'Método de Pagamento';
    }
  };

  const getMethodColor = (tipo) => {
    switch (tipo) {
      case 'cartao':
        return 'bg-blue-100 text-blue-800';
      case 'pix':
        return 'bg-green-100 text-green-800';
      case 'conta_bancaria':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const maskCardNumber = (number) => {
    if (!number) return '';
    const cleaned = number.replace(/\D/g, '');
    return cleaned.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1 **** **** $4');
  };

  const maskPixKey = (key, type) => {
    if (!key) return '';
    if (type === 'email') return key;
    if (type === 'cpf') return key.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.***.***-$4');
    return key.replace(/(.{4})(.{4})(.{4})(.{4})/, '$1 **** **** $4');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Métodos de Pagamento</CardTitle>
          <CardDescription>Carregando seus métodos de pagamento...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
            <CardTitle>Métodos de Pagamento</CardTitle>
            <CardDescription>
              Gerencie suas formas de pagamento salvas
            </CardDescription>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Adicionar Método de Pagamento</DialogTitle>
                <DialogDescription>
                  Adicione uma nova forma de pagamento para facilitar suas compras.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="method_type">Tipo de Método</Label>
                  <select
                    id="method_type"
                    value={formData.tipo}
                    onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="cartao">Cartão de Crédito</option>
                    <option value="pix">PIX</option>
                    <option value="conta_bancaria">Conta Bancária</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="method_name">Nome do Método *</Label>
                  <Input
                    id="method_name"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: Cartão Principal, PIX Pessoal, etc."
                  />
                </div>

                {formData.tipo === 'cartao' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="card_number">Número do Cartão *</Label>
                      <Input
                        id="card_number"
                        value={formData.dados.card_number || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          dados: { ...prev.dados, card_number: e.target.value }
                        }))}
                        placeholder="0000 0000 0000 0000"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="card_holder">Nome no Cartão *</Label>
                        <Input
                          id="card_holder"
                          value={formData.dados.card_holder || ''}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            dados: { ...prev.dados, card_holder: e.target.value }
                          }))}
                          placeholder="Nome como no cartão"
                        />
                      </div>
                      <div>
                        <Label htmlFor="expiry_date">Validade *</Label>
                        <Input
                          id="expiry_date"
                          value={formData.dados.expiry_date || ''}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            dados: { ...prev.dados, expiry_date: e.target.value }
                          }))}
                          placeholder="MM/AA"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.tipo === 'pix' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="pix_type">Tipo de Chave PIX</Label>
                      <select
                        id="pix_type"
                        value={formData.dados.pix_type || 'email'}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          dados: { ...prev.dados, pix_type: e.target.value }
                        }))}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="email">Email</option>
                        <option value="cpf">CPF</option>
                        <option value="phone">Telefone</option>
                        <option value="random">Chave Aleatória</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="pix_key">Chave PIX *</Label>
                      <Input
                        id="pix_key"
                        value={formData.dados.pix_key || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          dados: { ...prev.dados, pix_key: e.target.value }
                        }))}
                        placeholder="Digite sua chave PIX"
                      />
                    </div>
                  </div>
                )}

                {formData.tipo === 'conta_bancaria' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="bank_name">Nome do Banco *</Label>
                      <Input
                        id="bank_name"
                        value={formData.dados.bank_name || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          dados: { ...prev.dados, bank_name: e.target.value }
                        }))}
                        placeholder="Ex: Banco do Brasil, Itaú, etc."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="agency">Agência *</Label>
                        <Input
                          id="agency"
                          value={formData.dados.agency || ''}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            dados: { ...prev.dados, agency: e.target.value }
                          }))}
                          placeholder="0000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="account_number">Conta *</Label>
                        <Input
                          id="account_number"
                          value={formData.dados.account_number || ''}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            dados: { ...prev.dados, account_number: e.target.value }
                          }))}
                          placeholder="00000-0"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="account_type">Tipo de Conta</Label>
                      <select
                        id="account_type"
                        value={formData.dados.account_type || 'checking'}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          dados: { ...prev.dados, account_type: e.target.value }
                        }))}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="checking">Conta Corrente</option>
                        <option value="savings">Conta Poupança</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAddDialog(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleAddPaymentMethod}
                    className="flex-1"
                  >
                    Adicionar Método
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {paymentMethods.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum método de pagamento
            </h3>
            <p className="text-gray-600 mb-4">
              Adicione um método de pagamento para facilitar suas compras.
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Método
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {getMethodIcon(method.tipo)}
                  </div>
                  <div>
                    <div className="font-semibold">{method.nome}</div>
                    <div className="text-sm text-gray-600">
                      {getMethodName(method.tipo)}
                      {method.tipo === 'cartao' && method.dados.card_number && (
                        <span className="ml-2 font-mono">
                          {maskCardNumber(method.dados.card_number)}
                        </span>
                      )}
                      {method.tipo === 'pix' && method.dados.pix_key && (
                        <span className="ml-2">
                          {maskPixKey(method.dados.pix_key, method.dados.pix_type)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={getMethodColor(method.tipo)}>
                    {getMethodName(method.tipo)}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePaymentMethod(method.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentMethods;
