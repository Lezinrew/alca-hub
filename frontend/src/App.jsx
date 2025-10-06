import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { Sheet, SheetContent, SheetHeader as UISheetHeader, SheetTitle as UISheetTitle, SheetTrigger, SheetClose } from "./components/ui/sheet";
import SideMenu from "./components/SideMenu";
import GlobalHeader from "./components/GlobalHeader";
import PageWrapper from "./components/PageWrapper";
import { Label } from "./components/ui/label";
import { Textarea } from "./components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { SERVICE_CATEGORIES_DATA } from "./components/ServiceCategories";
import { Calendar, Clock, User, Star, MapPin, Phone, Mail, Plus, Home, Settings, LogOut, Users, CreditCard, Zap, Map, MessageCircle } from "lucide-react";
import { useToast } from "./hooks/use-toast";
import { Toaster } from "./components/ui/toaster";
import { QRCodeCanvas } from "qrcode.react";
import UberStyleMap from "./components/UberStyleMap.jsx";
import EnhancedSearchSystem from "./components/EnhancedSearchSystem";
import MobileBookingFlow from "./components/MobileBookingFlow";
import ProfessionalAgenda from "./components/ProfessionalAgenda";
import BookingFlow from "./components/BookingFlow";
import PricingDisplay from "./components/PricingDisplay";
import ChatSystem from "./components/ChatSystem";
import BookingManagement from "./components/BookingManagement";
import UserLocationManager from "./components/UserLocationManager";
import ProfileSelector from "./components/ProfileSelector";
import PaymentSystem from "./components/PaymentSystem";
import PaymentMethods from "./components/PaymentMethods";
import PaymentHistory from "./components/PaymentHistory";
import LoginForm from "./components/LoginForm";
import ModeSwitcher from "./components/ModeSwitcher";
import AvailabilityCalendar from "./components/AvailabilityCalendar";
import EnhancedDashboard from "./components/EnhancedDashboard";
import ServiceManagement from "./components/ServiceManagement";
import { PROFESSIONALS_DATA } from "./data/professionals";
import { getOrderStats } from "./data/orders";
import MyOrders from "./components/MyOrders";
import ReviewScreen from "./components/ReviewScreen";
import { API_URL } from "./lib/config";
import AdminDashboard from "./pages/AdminDashboard";
import Mapa from "./pages/Mapa";

const API = `${API_URL}/api`;

// Componente wrapper para busca com navegação
const SearchWithNavigation = () => {
  const navigate = useNavigate();
  
  const handleProfessionalSelect = (professional) => {
    navigate(`/agenda/${professional.id}`);
  };
  
  return (
    <EnhancedSearchSystem 
      onSearchResults={() => {}} 
      onProfessionalSelect={handleProfessionalSelect} 
    />
  );
};

// Componente para novo agendamento com profissionais recentes
const NewBookingFlow = () => {
  const navigate = useNavigate();
  
  // Dados de profissionais recentes (simulados)
  const recentProfessionals = [
    {
      id: '1',
      name: 'João Silva',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      rating: 4.8,
      reviews: 127,
      lastService: 'Limpeza Residencial',
      lastDate: '15/01/2024',
      distance: '2.5 km',
      responseTime: 'Resposta em 2 horas',
      experience: '5 anos de experiência',
      completionRate: '98%',
      pricing: { hourly: { average: 80, min: 60, max: 120 } },
      services: ['Limpeza Residencial', 'Limpeza Comercial', 'Organização']
    },
    {
      id: '2',
      name: 'Maria Santos',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      rating: 4.9,
      reviews: 89,
      lastService: 'Limpeza Industrial',
      lastDate: '10/01/2024',
      distance: '1.8 km',
      responseTime: 'Resposta em 1 hora',
      experience: '8 anos de experiência',
      completionRate: '99%',
      pricing: { hourly: { average: 120, min: 100, max: 150 } },
      services: ['Limpeza Industrial', 'Manutenção', 'Limpeza Pós-Obra']
    },
    {
      id: '3',
      name: 'Carlos Oliveira',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      rating: 4.7,
      reviews: 156,
      lastService: 'Organização',
      lastDate: '08/01/2024',
      distance: '3.2 km',
      responseTime: 'Resposta em 3 horas',
      experience: '10 anos de experiência',
      completionRate: '97%',
      pricing: { hourly: { average: 100, min: 80, max: 130 } },
      services: ['Limpeza Comercial', 'Limpeza Industrial', 'Manutenção']
    }
  ];

  const handleProfessionalSelect = (professional) => {
    navigate(`/agenda/${professional.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Novo Agendamento</h1>
        <p className="text-gray-600">Escolha um profissional que você já utilizou anteriormente</p>
      </div>

      <div className="grid gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-indigo-600" />
            Profissionais Recentes
          </h2>
          
          <div className="grid gap-4">
            {recentProfessionals.map((professional) => (
              <div
                key={professional.id}
                onClick={() => handleProfessionalSelect(professional)}
                className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start space-x-4">
                  <img
                    src={professional.avatar}
                    alt={professional.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">{professional.name}</h3>
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-gray-900">{professional.rating}</span>
                        <span className="text-sm text-gray-500">({professional.reviews} avaliações)</span>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {professional.distance}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {professional.responseTime}
                      </span>
                      <span>{professional.experience}</span>
                    </div>
                    
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Último serviço:</span>
                        <span className="text-sm font-medium text-indigo-600">{professional.lastService}</span>
                        <span className="text-sm text-gray-500">({professional.lastDate})</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">Taxa de conclusão: {professional.completionRate}</span>
                        <span className="text-sm font-medium text-green-600">
                          R$ {professional.pricing.hourly.min} - R$ {professional.pricing.hourly.max}/hora
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex flex-wrap gap-2">
                      {professional.services.map((service, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Não encontrou o profissional que procura?</h3>
          <p className="text-gray-600 mb-4">Busque por novos profissionais ou explore outras opções</p>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/busca')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Buscar Profissionais
            </button>
            <button
              onClick={() => navigate('/dashboard/servicos')}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Ver Todos os Serviços
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Auth Context is now imported from ./contexts/AuthContext

// AuthProvider is now imported from ./contexts/AuthContext

// Protected Route Component
const ProtectedRoute = ({ children, allowedTypes = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(user.tipo)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Profile Content Wrapper
const ProfileContentWrapper = () => {
  const { user, logout } = useAuth();
  
  console.log('🔍 ProfileContentWrapper: user:', user);
  console.log('🔍 ProfileContentWrapper: logout function:', logout);
  
  const handleUpdate = () => {
    // Handle profile update
  };

  return <ProfileContent user={user} onUpdate={handleUpdate} onLogout={logout} />;
};

// Payment Methods Wrapper
const PaymentMethodsWrapper = () => {
  const { user } = useAuth();
  
  const handleUpdate = () => {
    // Handle payment methods update
  };

  return <PaymentMethods user={user} onUpdate={handleUpdate} />;
};

// Payment History Wrapper
const PaymentHistoryWrapper = () => {
  const { user } = useAuth();

  return <PaymentHistory user={user} />;
};

// Payment Process Wrapper
const PaymentProcessWrapper = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular busca do agendamento
    const fetchBooking = async () => {
      try {
        setLoading(true);
        // Aqui você faria uma chamada real para a API
        // const response = await axios.get(`${API_URL}/api/bookings/${bookingId}`);
        // setBooking(response.data);
        
        // Mock data para demonstração
        setBooking({
          id: bookingId,
          preco_total: 150.00,
          servico: "Reparo Elétrico",
          prestador: "João Silva",
          data: "2024-01-15",
          horario: "14:00"
        });
      } catch (error) {
        console.error('Erro ao buscar agendamento:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const handlePaymentSuccess = (paymentData) => {
    console.log('Pagamento aprovado:', paymentData);
    navigate('/dashboard/agendamentos');
  };

  const handlePaymentCancel = () => {
    navigate('/dashboard/agendamentos');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Agendamento não encontrado</h2>
        <p className="text-gray-600 mb-4">O agendamento solicitado não foi encontrado.</p>
        <Button onClick={() => navigate('/dashboard/agendamentos')}>
          Voltar aos Agendamentos
        </Button>
      </div>
    );
  }

  return (
    <PaymentSystem 
      booking={booking}
      onPaymentSuccess={handlePaymentSuccess}
      onPaymentCancel={handlePaymentCancel}
    />
  );
};


// Professional Agenda Wrapper
const ProfessionalAgendaWrapper = () => {
  const { professionalId } = useParams();
  const navigate = useNavigate();
  const [professional, setProfessional] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Buscar profissional nos dados mock
    const fetchProfessional = async () => {
      try {
        // Simular delay da API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Buscar profissional nos dados mock
        const foundProfessional = PROFESSIONALS_DATA.find(p => p.id === professionalId);
        
        if (foundProfessional) {
          setProfessional(foundProfessional);
        } else {
          console.error('Profissional não encontrado:', professionalId);
        }
      } catch (error) {
        console.error('Erro ao buscar profissional:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessional();
  }, [professionalId]);
  
  const handleSelectSlot = (slot) => {
    // Handle slot selection
    console.log('Slot selecionado:', slot);
  };

  const handleClose = () => {
    // Navigate back to dashboard
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando agenda...</p>
        </div>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Profissional não encontrado</h2>
          <p className="text-gray-600">O profissional solicitado não foi encontrado.</p>
        </div>
      </div>
    );
  }

  return <ProfessionalAgenda professional={professional} onSelectSlot={handleSelectSlot} onClose={handleClose} />;
};

// Components
const Login = () => {
  return <LoginForm />;
};

// Placeholder pages to satisfy new routes if not already present
const EarningsPlaceholder = () => (
  <div className="p-6">Página de Pagamento (em breve)</div>
);

const SecurityPlaceholder = () => (
  <div className="p-6">Configurações de Segurança (em breve)</div>
);

const MapPlaceholder = () => (
  <div className="p-6">Mapa (em breve)</div>
);

const ReviewPlaceholder = () => (
  <div className="p-6">Avaliar (em breve)</div>
);

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    cpf: "",
    nome: "",
    telefone: "",
    endereco: "",
    tipos: ["morador"], // Array de tipos selecionados
    aceitou_termos: false
  });
  const [loading, setLoading] = useState(false);
  const [openTerms, setOpenTerms] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.tipos.length === 0) {
      toast({
        variant: "destructive",
        title: "Erro no cadastro",
        description: "Selecione pelo menos um tipo de usuário",
      });
      return;
    }
    if (!formData.aceitou_termos) {
      toast({
        variant: "destructive",
        title: "Termos obrigatórios",
        description: "Você precisa aceitar os Termos de Uso para criar a conta.",
      });
      return;
    }
    // AHSW-19: Validação de senha forte (mín. 8 chars, número e símbolo)
    const strongPwd = /^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!strongPwd.test(formData.password)) {
      toast({
        variant: "destructive",
        title: "Senha fraca",
        description: "A senha deve ter no mínimo 8 caracteres, incluir ao menos 1 número e 1 símbolo.",
      });
      return;
    }
    
    setLoading(true);

    const result = await register(formData);
    
    if (result.success) {
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Agora faça login para continuar",
      });
      navigate('/login');
    } else {
      toast({
        variant: "destructive",
        title: "Erro no cadastro",
        description: result.error,
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-indigo-900">Cadastro - Alça Hub</CardTitle>
          <CardDescription>Crie sua conta para começar</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome completo</Label>
              <Input
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                placeholder="000.000.000-00"
                required
              />
            </div>
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="(11) 99999-9999"
                required
              />
            </div>
            <div>
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                name="endereco"
                value={formData.endereco}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="tipos">Tipo de usuário</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="morador"
                    checked={formData.tipos.includes("morador")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, tipos: [...formData.tipos, "morador"] });
                      } else {
                        setFormData({ ...formData, tipos: formData.tipos.filter(t => t !== "morador") });
                      }
                    }}
                    className="rounded"
                  />
                  <Label htmlFor="morador" className="text-sm font-normal">
                    Morador - Buscar e contratar serviços
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="prestador"
                    checked={formData.tipos.includes("prestador")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, tipos: [...formData.tipos, "prestador"] });
                      } else {
                        setFormData({ ...formData, tipos: formData.tipos.filter(t => t !== "prestador") });
                      }
                    }}
                    className="rounded"
                  />
                  <Label htmlFor="prestador" className="text-sm font-normal">
                    Prestador - Oferecer serviços e gerenciar agenda
                  </Label>
                </div>
                {formData.tipos.length === 0 && (
                  <p className="text-sm text-red-600">Selecione pelo menos um tipo de usuário</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="border-t pt-2">
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="aceitou_termos"
                  checked={formData.aceitou_termos}
                  onChange={(e) => setFormData({ ...formData, aceitou_termos: e.target.checked })}
                  className="mt-1 rounded"
                />
                <Label htmlFor="aceitou_termos" className="text-sm font-normal">
                  Eu li e aceito os <button type="button" className="text-indigo-600 hover:underline" onClick={() => setOpenTerms(true)}>Termos de Uso</button>.
                </Label>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Cadastrando..." : "Cadastrar"}
            </Button>
            <p className="text-sm text-center">
              Já tem conta?{" "}
              <Link to="/login" className="text-indigo-600 hover:underline">
                Faça login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/forgot-password`, {
        email: email
      });

      toast({
        title: "Se o email existir, enviaremos instruções",
        description: "Verifique sua caixa de entrada",
      });
      navigate('/login');
    } catch (error) {
      console.error('Erro ao solicitar recuperação de senha:', error);
      toast({
        title: "Se o email existir, enviaremos instruções",
        description: "Verifique sua caixa de entrada",
      });
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-indigo-900">Recuperar senha</CardTitle>
          <CardDescription>Informe seu email para receber o link de redefinição</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="forgot-email">Email</Label>
              <Input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Enviando..." : "Enviar"}
            </Button>
            <Link to="/login" className="text-sm text-[#6366F1] hover:underline text-center">Voltar ao login</Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "As senhas não coincidem",
      });
      return;
    }

    // AHSW-19: Validação de senha forte (mín. 8 chars, número e símbolo)
    const strongPwd = /^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!strongPwd.test(newPassword)) {
      toast({
        variant: "destructive",
        title: "Senha fraca",
        description: "A senha deve ter no mínimo 8 caracteres, incluir ao menos 1 número e 1 símbolo.",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/reset-password`, {
        token: token,
        new_password: newPassword
      });

      toast({
        title: "Senha redefinida com sucesso!",
        description: "Agora você pode fazer login com sua nova senha",
      });
      navigate('/login');
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      toast({
        variant: "destructive",
        title: "Erro ao redefinir senha",
        description: error.response?.data?.detail || "Token inválido ou expirado",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-indigo-900">Token inválido</CardTitle>
            <CardDescription>O link de recuperação é inválido ou expirado</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link to="/login" className="w-full text-center text-[#6366F1] hover:underline">
              Voltar ao login
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-indigo-900">Redefinir senha</CardTitle>
          <CardDescription>Digite sua nova senha</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="new-password">Nova senha</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirmar senha</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Redefinindo..." : "Redefinir senha"}
            </Button>
            <Link to="/login" className="text-sm text-[#6366F1] hover:underline text-center">Voltar ao login</Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

const Dashboard = () => {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const { tab } = useParams();
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [myServices, setMyServices] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('inicio');
  const [showChat, setShowChat] = useState(false);
  const [showLocationManager, setShowLocationManager] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user?.id]); // Só executa quando o ID do usuário muda, não quando o objeto inteiro muda

  const loadData = async () => {
    try {
      // Usar dados mock em vez de chamadas de API
      if (user.tipo === 'morador') {
        setServices([]); // Dados mock vazios por enquanto
      } else if (user.tipo === 'prestador') {
        setMyServices([]); // Dados mock vazios por enquanto
      }
      
      setBookings([]); // Dados mock vazios por enquanto

      // Stats mock para admin
      if (user.tipo === 'admin') {
        setStats({
          totalUsers: 0,
          totalServices: 0,
          totalBookings: 0
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      // Não mostrar toast de erro para dados mock
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPendingPayments = () => {
    const stats = getOrderStats();
    return stats.pending;
  };

  const getCompletedServices = () => {
    const stats = getOrderStats();
    return stats.completed;
  };

  const getTotalEarnings = () => {
    return bookings
      .filter(booking => 
        booking.status === 'concluido' && 
        booking.payment_status === 'paid' && 
        user.id === booking.prestador_id
      )
      .reduce((total, booking) => total + booking.preco_total, 0);
  };

  // Bottom navigation menu items
  const getMenuItems = () => {
    const currentType = user.tipo_ativo || user.tipo;
    
    if (currentType === 'morador') {
      return [
        { id: 'inicio', label: 'Início', icon: Home },
        { id: 'servicos', label: 'Serviços', icon: Users },
        { id: 'agendamentos', label: 'Meus Pedidos', icon: Calendar },
        { id: 'chat', label: 'Chat', icon: MessageCircle },
        { id: 'localizacao', label: 'Localização', icon: MapPin },
        { id: 'pagamento', label: 'Pagamentos', icon: CreditCard },
        { id: 'conta', label: 'Conta', icon: User }
      ];
    } else if (currentType === 'prestador') {
      return [
        { id: 'inicio', label: 'Início', icon: Home },
        { id: 'meus-servicos', label: 'Serviços', icon: Settings },
        { id: 'agendamentos', label: 'Agendamentos', icon: Calendar },
        { id: 'chat', label: 'Chat', icon: MessageCircle },
        { id: 'localizacao', label: 'Localização', icon: MapPin },
        { id: 'faturamento', label: 'Faturamento', icon: CreditCard },
        { id: 'conta', label: 'Conta', icon: User }
      ];
    }
    return [];
  };

  // Sync active tab with URL param
  useEffect(() => {
    const items = getMenuItems();
    const allowed = new Set(items.map((i) => i.id));
    const next = tab && allowed.has(tab) ? tab : 'inicio';
    setActiveTab(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, user.tipo_ativo, user.tipo]);

  const renderContent = () => {
    const currentType = user.tipo_ativo || user.tipo;
    
    if (currentType === 'admin') {
      return <AdminDashboard />;
    }
    switch (activeTab) {
      case 'inicio':
        return <HomeContent user={user} stats={{ getPendingPayments: getPendingPayments(), getCompletedServices: getCompletedServices(), getTotalEarnings: getTotalEarnings() }} />;
      case 'servicos':
        return <ServicesContent services={services} onBook={loadData} />;
      case 'meus-servicos':
        return <MyServicesContent services={myServices} onUpdate={loadData} />;
      case 'agendamentos':
        return <BookingManagement user={user} />;
      case 'chat':
        return <ChatSystem user={user} onClose={() => setActiveTab('inicio')} />;
      case 'localizacao':
        return <UserLocationManager user={user} onLocationUpdate={(location) => {
          // Update user location in context
          const updatedUser = { ...user, ...location };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }} />;
      case 'pagamento':
        return <PaymentMethods user={user} onUpdate={loadData} />;
      case 'faturamento':
        return <EarningsContent user={user} />;
      case 'conta':
        return <ProfileContent user={user} onUpdate={loadData} onLogout={handleLogout} />;
      default:
        return <HomeContent user={user} stats={{ getPendingPayments: getPendingPayments(), getCompletedServices: getCompletedServices(), getTotalEarnings: getTotalEarnings() }} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
      {/* Global Header */}
      <GlobalHeader 
        onMenuToggle={() => {}} 
        showMenuButton={true}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {renderContent()}
        </div>
      </main>

      {/* Bottom Navigation - Only on mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20 md:hidden">
        <div className="grid grid-cols-4 max-w-md mx-auto">
          {getMenuItems().map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(`/dashboard/${item.id}`)}
                className={`flex flex-col items-center py-3 px-2 text-xs transition-colors cursor-pointer active:scale-95 ${
                  isActive 
                    ? 'text-indigo-600 bg-indigo-50' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className={`h-6 w-6 mb-1 ${isActive ? 'text-indigo-600' : ''}`} />
                <span className={`${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

const ServiceCard = ({ service, onBook, isOwner = false }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{service.nome}</CardTitle>
            <CardDescription>{service.categoria}</CardDescription>
          </div>
          <Badge variant="outline">
            R$ {service.preco_por_hora.toFixed(2)}/h
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">{service.descricao}</p>
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-2" />
            {service.horario_inicio} - {service.horario_fim}
          </div>
          <div className="flex items-center text-sm">
            <Star className="h-4 w-4 mr-2" />
            {service.media_avaliacoes > 0 ? (
              <span>{service.media_avaliacoes} ({service.total_avaliacoes} avaliações)</span>
            ) : (
              <span>Sem avaliações</span>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {!isOwner && user.tipo === 'morador' && (
          <BookServiceDialog service={service} onSuccess={onBook} />
        )}
      </CardFooter>
    </Card>
  );
};

const BookServiceDialog = ({ service, onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    data_agendamento: '',
    horario_inicio: '',
    horario_fim: '',
    observacoes: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const bookingData = {
        service_id: service.id,
        data_agendamento: new Date(formData.data_agendamento).toISOString(),
        horario_inicio: formData.horario_inicio,
        horario_fim: formData.horario_fim,
        observacoes: formData.observacoes
      };

      // Mock booking creation
      console.log('Agendamento criado:', bookingData);
      
      toast({
        title: "Agendamento realizado!",
        description: "Seu agendamento foi criado com sucesso.",
      });
      
      setOpen(false);
      setFormData({
        data_agendamento: '',
        horario_inicio: '',
        horario_fim: '',
        observacoes: ''
      });
      onSuccess();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro no agendamento",
        description: error.response?.data?.detail || "Erro ao criar agendamento",
      });
    }
    
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Agendar Serviço</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agendar: {service.nome}</DialogTitle>
          <DialogDescription>
            Preencha os dados para fazer seu agendamento
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="data_agendamento">Data</Label>
              <Input
                id="data_agendamento"
                type="date"
                value={formData.data_agendamento}
                onChange={(e) => setFormData({ ...formData, data_agendamento: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="horario_inicio">Horário Início</Label>
                <Input
                  id="horario_inicio"
                  type="time"
                  value={formData.horario_inicio}
                  onChange={(e) => setFormData({ ...formData, horario_inicio: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="horario_fim">Horário Fim</Label>
                <Input
                  id="horario_fim"
                  type="time"
                  value={formData.horario_fim}
                  onChange={(e) => setFormData({ ...formData, horario_fim: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Descreva detalhes do serviço..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Agendando...' : 'Confirmar Agendamento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const CreateServiceDialog = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    categoria: '',
    preco_por_hora: '',
    disponibilidade: [],
    horario_inicio: '',
    horario_fim: ''
  });
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [servicoSelecionado, setServicoSelecionado] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const diasSemana = [
    'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const serviceData = {
        ...formData,
        categoria: categoriaSelecionada || formData.categoria,
        nome: servicoSelecionado || formData.nome,
        preco_por_hora: parseFloat(formData.preco_por_hora)
      };

      // Mock service creation
      console.log('Serviço criado:', serviceData);
      
      toast({
        title: "Serviço criado!",
        description: "Seu serviço foi criado com sucesso.",
      });
      
      setOpen(false);
      setFormData({
        nome: '',
        descricao: '',
        categoria: '',
        preco_por_hora: '',
        disponibilidade: [],
        horario_inicio: '',
        horario_fim: ''
      });
      setCategoriaSelecionada('');
      setServicoSelecionado('');
      onSuccess();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar serviço",
        description: error.response?.data?.detail || "Erro ao criar serviço",
      });
    }
    
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Serviço
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Criar Novo Serviço</DialogTitle>
          <DialogDescription>
            Preencha os dados do seu serviço
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="categoria">Categoria</Label>
              <Select value={categoriaSelecionada} onValueChange={(value) => { setCategoriaSelecionada(value); setServicoSelecionado(''); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_CATEGORIES_DATA.map((c) => (
                    <SelectItem key={c.categoria} value={c.categoria}>{c.categoria}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {categoriaSelecionada && (
              <div>
                <Label htmlFor="servico">Nome do Serviço</Label>
                <Select value={servicoSelecionado} onValueChange={setServicoSelecionado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {(SERVICE_CATEGORIES_DATA.find((i) => i.categoria === categoriaSelecionada)?.serviços || []).map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="preco_por_hora">Preço por hora (R$)</Label>
              <Input
                id="preco_por_hora"
                type="number"
                step="0.01"
                value={formData.preco_por_hora}
                onChange={(e) => setFormData({ ...formData, preco_por_hora: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="horario_inicio">Horário Início</Label>
                <Input
                  id="horario_inicio"
                  type="time"
                  value={formData.horario_inicio}
                  onChange={(e) => setFormData({ ...formData, horario_inicio: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="horario_fim">Horário Fim</Label>
                <Input
                  id="horario_fim"
                  type="time"
                  value={formData.horario_fim}
                  onChange={(e) => setFormData({ ...formData, horario_fim: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Serviço'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const BookingCard = ({ booking, onUpdate }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showPayment, setShowPayment] = useState(false);

  const getStatusColor = (status) => {
    const colors = {
      pendente: 'bg-yellow-100 text-yellow-800',
      confirmado: 'bg-blue-100 text-blue-800',
      em_andamento: 'bg-purple-100 text-purple-800',
      concluido: 'bg-green-100 text-green-800',
      cancelado: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'bg-orange-100 text-orange-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      pendente: 'Pendente',
      confirmado: 'Confirmado',
      em_andamento: 'Em Andamento',
      concluido: 'Concluído',
      cancelado: 'Cancelado'
    };
    return texts[status] || status;
  };

  const getPaymentStatusText = (status) => {
    const texts = {
      pending: 'Pagamento Pendente',
      paid: 'Pagamento Aprovado',
      failed: 'Pagamento Falhou'
    };
    return texts[status] || status;
  };

  const updateBookingStatus = async (newStatus) => {
    try {
      // Mock booking status update
      console.log('Status do agendamento atualizado:', { bookingId: booking.id, status: newStatus });
      toast({
        title: "Status atualizado!",
        description: `Agendamento ${getStatusText(newStatus).toLowerCase()}`,
      });
      onUpdate();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar status",
        description: error.response?.data?.detail || "Erro ao atualizar",
      });
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold">Agendamento #{booking.id.slice(0, 8)}</h3>
            <p className="text-sm text-gray-600">
              {new Date(booking.data_agendamento).toLocaleDateString('pt-BR')} • {booking.horario_inicio} - {booking.horario_fim}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Badge className={getStatusColor(booking.status)}>
              {getStatusText(booking.status)}
            </Badge>
            <Badge className={getPaymentStatusColor(booking.payment_status)}>
              {getPaymentStatusText(booking.payment_status)}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm"><strong>Preço Total:</strong> R$ {booking.preco_total.toFixed(2)}</p>
          {booking.observacoes && (
            <p className="text-sm"><strong>Observações:</strong> {booking.observacoes}</p>
          )}
        </div>

        {/* Payment button for moradores */}
        {user.tipo === 'morador' && booking.payment_status === 'pending' && (
          <div className="mt-4">
            <Button 
              onClick={() => setShowPayment(true)}
              className="w-full"
              variant="default"
            >
              💳 Pagar Agendamento
            </Button>
          </div>
        )}

        {user.tipo === 'prestador' && booking.status === 'pendente' && (
          <div className="flex gap-2 mt-4">
            <Button 
              size="sm" 
              onClick={() => updateBookingStatus('confirmado')}
              className="flex-1"
            >
              Confirmar
            </Button>
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={() => updateBookingStatus('cancelado')}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        )}

        {user.tipo === 'prestador' && booking.status === 'confirmado' && (
          <div className="flex gap-2 mt-4">
            <Button 
              size="sm" 
              onClick={() => updateBookingStatus('em_andamento')}
              className="flex-1"
            >
              Iniciar Serviço
            </Button>
          </div>
        )}

        {user.tipo === 'prestador' && booking.status === 'em_andamento' && (
          <div className="flex gap-2 mt-4">
            <Button 
              size="sm" 
              onClick={() => updateBookingStatus('concluido')}
              className="flex-1"
            >
              Finalizar Serviço
            </Button>
          </div>
        )}

        {/* Payment Modal */}
        {showPayment && (
          <PaymentModal 
            booking={booking} 
            onClose={() => setShowPayment(false)}
            onSuccess={onUpdate}
          />
        )}
      </CardContent>
    </Card>
  );
};

const PaymentModal = ({ booking, onClose, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [qrCodeVisible, setQrCodeVisible] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const { user } = useAuth();
  const { toast } = useToast();

  const handlePIXPayment = async () => {
    setLoading(true);
    try {
      const pixData = {
        booking_id: booking.id,
        payer_email: user.email,
        payer_name: user.nome || 'Usuário',
        payer_identification: user.cpf,
        payer_identification_type: "CPF"
      };

      // Mock PIX payment
      const mockResponse = {
        qr_code: 'mock_qr_code_data',
        qr_code_url: 'https://example.com/qr',
        payment_id: 'mock_payment_id'
      };
      setPaymentData(mockResponse);
      setQrCodeVisible(true);
      
      toast({
        title: "PIX gerado com sucesso! 🎉",
        description: "Escaneie o QR Code ou copie o código PIX para pagar",
      });

      // Start polling payment status
      startPaymentPolling(response.data.payment_id);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao gerar PIX",
        description: error.response?.data?.detail || "Erro ao processar pagamento",
      });
    }
    setLoading(false);
  };

  const startPaymentPolling = (paymentId) => {
    const pollInterval = setInterval(async () => {
      try {
        // Mock payment status
        const status = 'completed';
        setPaymentStatus(status);
        
        if (status === 'approved') {
          clearInterval(pollInterval);
          toast({
            title: "Pagamento aprovado! 🎉✅",
            description: "Seu pagamento foi processado com sucesso!",
          });
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 2000);
        } else if (status === 'rejected' || status === 'cancelled') {
          clearInterval(pollInterval);
          toast({
            variant: "destructive",
            title: "Pagamento não autorizado",
            description: "Houve um problema com seu pagamento. Tente novamente.",
          });
        }
      } catch (error) {
        console.error('Erro ao verificar status do pagamento:', error);
      }
    }, 2000); // Poll every 2 seconds

    // Stop polling after 10 minutes
    setTimeout(() => clearInterval(pollInterval), 600000);
  };

  const copyPIXCode = () => {
    if (paymentData?.qr_code) {
      navigator.clipboard.writeText(paymentData.qr_code);
      toast({
        title: "Código PIX copiado! 📋",
        description: "Cole no app do seu banco para pagar",
      });
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved':
        return '✅';
      case 'pending':
        return '⏳';
      case 'rejected':
      case 'cancelled':
        return '❌';
      default:
        return '⏳';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'approved':
        return 'Pagamento Aprovado!';
      case 'pending':
        return 'Aguardando Pagamento...';
      case 'rejected':
        return 'Pagamento Rejeitado';
      case 'cancelled':
        return 'Pagamento Cancelado';
      default:
        return 'Processando...';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-blue-600 bg-blue-50';
      case 'rejected':
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Pagamento do Agendamento
          </DialogTitle>
          <DialogDescription>
            Valor: <span className="font-semibold text-green-600">R$ {booking.preco_total.toFixed(2)}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!qrCodeVisible ? (
            <>
              <div>
                <Label>Método de Pagamento</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pix">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-blue-600" />
                        PIX (Instantâneo)
                      </div>
                    </SelectItem>
                    <SelectItem value="credit_card">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-gray-600" />
                        Cartão de Crédito
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentMethod === 'pix' && (
                <div className="text-center space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border">
                    <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-blue-900">Pagamento PIX</h3>
                    <p className="text-sm text-blue-700">
                      Transferência instantâneo e segura via PIX
                    </p>
                    <div className="mt-2 text-xs text-blue-600">
                      ⚡ Aprovação em segundos • 🔒 100% Seguro
                    </div>
                  </div>
                  <Button 
                    onClick={handlePIXPayment} 
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? (
                      <>⏳ Gerando PIX...</>
                    ) : (
                      <>🏦 Gerar PIX</>
                    )}
                  </Button>
                </div>
              )}

              {paymentMethod === 'credit_card' && (
                <div className="text-center space-y-4">
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg border">
                    <CreditCard className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-orange-900">Cartão de Crédito</h3>
                    <p className="text-sm text-orange-700">
                      Em breve: Pagamento parcelado em até 12x
                    </p>
                    <div className="mt-2 text-xs text-orange-600">
                      🚧 Funcionalidade em desenvolvimento
                    </div>
                  </div>
                  <Button disabled className="w-full bg-gray-400">
                    💳 Em breve
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(paymentStatus)}`}>
                  <span className="text-lg">{getStatusIcon(paymentStatus)}</span>
                  {getStatusText(paymentStatus)}
                </div>
                {paymentStatus === 'pending' && (
                  <p className="text-sm text-gray-600 mt-2">
                    Escaneie o QR Code ou copie o código para pagar
                  </p>
                )}
              </div>

              {paymentData?.qr_code && paymentStatus === 'pending' && (
                <div className="flex justify-center mb-4">
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-200 shadow-sm">
                    <QRCodeCanvas 
                      value={paymentData.qr_code}
                      size={200}
                      level="M"
                      includeMargin={true}
                    />
                  </div>
                </div>
              )}

              {paymentStatus === 'approved' && (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-lg font-semibold text-green-600 mb-2">
                    Pagamento Aprovado!
                  </h3>
                  <p className="text-sm text-gray-600">
                    Seu pagamento foi processado com sucesso.
                  </p>
                </div>
              )}

              {paymentStatus === 'pending' && (
                <div className="space-y-2">
                  <Button onClick={copyPIXCode} variant="outline" className="w-full">
                    📋 Copiar Código PIX
                  </Button>
                  <div className="text-xs text-gray-500 text-center space-y-1">
                    <p>⏰ Expira em: {new Date(paymentData?.expiration_date).toLocaleString('pt-BR')}</p>
                    <div className="flex items-center justify-center gap-1">
                      <div className="animate-pulse h-2 w-2 bg-blue-600 rounded-full"></div>
                      <span>Aguardando confirmação do pagamento...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {paymentStatus === 'approved' ? "Concluir" : qrCodeVisible ? "Fechar" : "Cancelar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Content Components for new navigation
const HomeContent = ({ user, stats }) => {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Olá, {user.nome ? user.nome.split(' ')[0] : 'Usuário'}! 👋
        </h1>
        <p className="text-gray-600">
          {user.tipo === 'morador' 
            ? 'Encontre os melhores serviços para sua casa' 
            : 'Gerencie seus serviços e agendamentos'
          }
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {user.tipo === 'morador' && (
          <>
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate('/meus-pedidos')}
            >
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-blue-100">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Meus Pedidos</p>
                    <p className="text-xl font-bold text-gray-900">{getOrderStats().total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate('/meus-pedidos?filter=pendente')}
            >
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-orange-100">
                    <CreditCard className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Pendentes</p>
                    <p className="text-xl font-bold text-gray-900">{stats.getPendingPayments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate('/meus-pedidos?filter=concluido')}
            >
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-green-100">
                    <Star className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Concluídos</p>
                    <p className="text-xl font-bold text-gray-900">{stats.getCompletedServices}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {user.tipo === 'prestador' && (
          <>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-green-100">
                    <CreditCard className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Faturamento</p>
                    <p className="text-xl font-bold text-gray-900">R$ {stats.getTotalEarnings.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate('/meus-pedidos')}
            >
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-blue-100">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Meus Pedidos</p>
                    <p className="text-xl font-bold text-gray-900">{getOrderStats().total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-purple-100">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Serviços Ativos</p>
                    <p className="text-xl font-bold text-gray-900">3</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {user.tipo === 'morador' && (
              <>
                <Button variant="outline" className="h-20 flex-col hover:bg-gray-100 active:scale-95 transition cursor-pointer" onClick={() => navigate('/busca')}>
                  <Users className="h-6 w-6 mb-2" />
                  <span className="text-xs">Buscar Serviços</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col hover:bg-gray-100 active:scale-95 transition cursor-pointer" onClick={() => navigate('/mapa')}>
                  <Map className="h-6 w-6 mb-2" />
                  <span className="text-xs">Ver Mapa</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col hover:bg-gray-100 active:scale-95 transition cursor-pointer" onClick={() => navigate('/agendamento')}>
                  <Clock className="h-6 w-6 mb-2" />
                  <span className="text-xs">Agendar</span>
                </Button>
              </>
            )}
            
            {/* Agendamentos Recentes */}
            {user.tipo === 'morador' && (
              <>
                <div className="col-span-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recentes</h3>
                </div>
                <Button variant="outline" className="h-20 flex-col hover:bg-gray-100 active:scale-95 transition cursor-pointer" onClick={() => navigate('/agenda/1')}>
                  <Calendar className="h-6 w-6 mb-2" />
                  <span className="text-xs">Agenda João</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col hover:bg-gray-100 active:scale-95 transition cursor-pointer" onClick={() => navigate('/agenda/2')}>
                  <Calendar className="h-6 w-6 mb-2" />
                  <span className="text-xs">Agenda Maria</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col hover:bg-gray-100 active:scale-95 transition cursor-pointer" onClick={() => navigate('/agenda/3')}>
                  <Calendar className="h-6 w-6 mb-2" />
                  <span className="text-xs">Agenda Carlos</span>
                </Button>
              </>
            )}
            
            {user.tipo === 'prestador' && (
              <>
                <Button variant="outline" className="h-20 flex-col hover:bg-gray-100 active:scale-95 transition cursor-pointer" onClick={() => navigate('/servicos')}>
                  <Plus className="h-6 w-6 mb-2" />
                  <span className="text-xs">Novo Serviço</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col hover:bg-gray-100 active:scale-95 transition cursor-pointer" onClick={() => navigate('/agenda/1')}>
                  <Calendar className="h-6 w-6 mb-2" />
                  <span className="text-xs">Minha Agenda</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col hover:bg-gray-100 active:scale-95 transition cursor-pointer" onClick={() => navigate('/pagamento')}>
                  <CreditCard className="h-6 w-6 mb-2" />
                  <span className="text-xs">Faturamento</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col hover:bg-gray-100 active:scale-95 transition cursor-pointer" onClick={() => navigate('/conta')}>
                  <Settings className="h-6 w-6 mb-2" />
                  <span className="text-xs">Configurações</span>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ServicesContent = ({ services, onBook }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Serviços Disponíveis</h2>
        <Badge variant="outline">
          {services.length} encontrados
        </Badge>
      </div>
      
      {/* Map View Option */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Map className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h3 className="font-semibold text-blue-900">Ver no Mapa</h3>
                <p className="text-sm text-blue-700">Encontre prestadores próximos a você</p>
              </div>
            </div>
            <Button variant="outline" className="border-blue-300 text-blue-700">
              Abrir Mapa
            </Button>
          </div>
        </CardContent>
      </Card>

      {services.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum serviço disponível</h3>
            <p className="text-gray-500">Aguarde novos prestadores se cadastrarem.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} onBook={onBook} />
          ))}
        </div>
      )}
    </div>
  );
};

const MyServicesContent = ({ services, onUpdate }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Meus Serviços</h2>
        <CreateServiceDialog onSuccess={onUpdate} />
      </div>
      
      {services.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum serviço cadastrado</h3>
            <p className="text-gray-500 mb-4">Comece criando seu primeiro serviço.</p>
            <CreateServiceDialog onSuccess={onUpdate} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} isOwner={true} />
          ))}
        </div>
      )}
    </div>
  );
};

const BookingsContent = ({ bookings, onUpdate }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Agendamentos</h2>
      
      {bookings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pedido</h3>
            <p className="text-gray-500">Seus pedidos aparecerão aqui.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} onUpdate={onUpdate} />
          ))}
        </div>
      )}
    </div>
  );
};

const EarningsContent = ({ user }) => {
  const [earnings, setEarnings] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    loadEarnings();
  }, []);

  const loadEarnings = async () => {
    try {
      // Mock earnings data
      setEarnings({
        total: 0,
        thisMonth: 0,
        lastMonth: 0
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar faturamento",
        description: "Não foi possível carregar os dados de faturamento",
      });
    }
  };

  if (!earnings) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p>Carregando faturamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Faturamento</h2>
      
      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Faturado</p>
                <p className="text-2xl font-bold text-green-600">R$ {earnings.total_earnings.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Este Mês</p>
                <p className="text-2xl font-bold text-blue-600">R$ {earnings.this_month_earnings.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Serviços</p>
                <p className="text-2xl font-bold text-purple-600">{earnings.total_services}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pendente</p>
                <p className="text-2xl font-bold text-orange-600">R$ {earnings.pending_payments.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {earnings.recent_transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhuma transação encontrada</p>
          ) : (
            <div className="space-y-4">
              {earnings.recent_transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-green-100">
                      <CreditCard className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">Pagamento recebido</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString('pt-BR')} • {transaction.method}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-green-600">+ R$ {transaction.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const ProfileContent = ({ user, onUpdate, onLogout }) => {
  console.log('🔍 ProfileContent: Props recebidas:', { user, onUpdate, onLogout });
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dados');
  const [profile, setProfile] = useState({
    nome: user.nome || '',
    telefone: user.telefone || '',
    endereco: user.endereco || '',
    foto_url: user.foto_url || '',
    email: user.email || ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Função para upload de foto
  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Por favor, selecione uma imagem válida (JPEG, PNG, GIF ou WebP)');
      return;
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('A imagem deve ter no máximo 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Converter arquivo para base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const photoUrl = e.target.result;
        
        try {
          // Salvar no servidor
          const response = await axios.put(
            `${API_URL}/api/profile`,
            { foto_url: photoUrl },
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (response.data) {
            // Atualizar estado local
            setProfile(prev => ({ ...prev, foto_url: photoUrl }));
            
            // Atualizar usuário no contexto
            const updatedUser = { ...user, foto_url: photoUrl };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            toast({
              title: "Foto atualizada!",
              description: "Sua foto de perfil foi salva com sucesso.",
            });
            
            console.log('📸 Foto salva no servidor:', photoUrl);
          }
        } catch (error) {
          console.error('❌ Erro ao salvar foto no servidor:', error);
          toast({
            variant: "destructive",
            title: "Erro ao salvar foto",
            description: "Não foi possível salvar a foto. Tente novamente.",
          });
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('❌ Erro ao carregar foto:', error);
      setIsUploading(false);
      toast({
        variant: "destructive",
        title: "Erro ao carregar foto",
        description: "Erro ao processar a imagem. Tente novamente.",
      });
    }
  };

  // Função para alternar modo de usuário
  const handleModeSwitch = async (newMode) => {
    if (!user.tipos || user.tipos.length <= 1) return;
    
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/switch-mode`,
        { tipo_ativo: newMode },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        // Atualizar dados do usuário no localStorage
        localStorage.setItem('user', JSON.stringify(response.data));
        
        toast({
          title: "Modo alterado!",
          description: `Agora você está no modo ${newMode === 'morador' ? 'Morador' : newMode === 'prestador' ? 'Prestador' : 'Administrador'}`,
        });
        
        // Recarregar a página para aplicar as mudanças
        window.location.reload();
      }
    } catch (error) {
      console.error('Erro ao alterar modo:', error);
      toast({
        variant: "destructive",
        title: "Erro ao alterar modo",
        description: error.response?.data?.detail || "Tente novamente",
      });
    }
  };

  // Função para remover foto
  const handleRemovePhoto = async () => {
    try {
      // Salvar no servidor (remover foto)
      const response = await axios.put(
        `${API_URL}/api/profile`,
        { foto_url: null },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        // Atualizar estado local
        setProfile(prev => ({ ...prev, foto_url: '' }));
        
        // Atualizar usuário no contexto
        const updatedUser = { ...user, foto_url: null };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        toast({
          title: "Foto removida!",
          description: "Sua foto de perfil foi removida com sucesso.",
        });
        
        console.log('📸 Foto removida do servidor');
      }
    } catch (error) {
      console.error('❌ Erro ao remover foto do servidor:', error);
      toast({
        variant: "destructive",
        title: "Erro ao remover foto",
        description: "Não foi possível remover a foto. Tente novamente.",
      });
    }
  };

  const [settings, setSettings] = useState({
    geolocalizacao_ativa: user.geolocalizacao_ativa || false,
    notificacoes_ativadas: user.notificacoes_ativadas !== false,
    privacidade_perfil: user.privacidade_perfil || 'publico'
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    bankName: ''
  });
  const { toast } = useToast();

  const handleProfileUpdate = async () => {
    try {
      await axios.put(`${API}/profile`, {
        nome: profile.nome,
        telefone: profile.telefone,
        endereco: profile.endereco,
        foto_url: profile.foto_url,
      });
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
      onUpdate();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar perfil",
        description: error.response?.data?.detail || "Tente novamente",
      });
    }
  };

  const handleAddPaymentMethod = () => {
    setShowPaymentModal(true);
  };

  const handleSavePaymentMethod = async () => {
    try {
      // Validação básica
      if (!newPaymentMethod.cardNumber || !newPaymentMethod.expiryDate || !newPaymentMethod.cvv || !newPaymentMethod.cardholderName) {
        toast({
          variant: "destructive",
          title: "Campos obrigatórios",
          description: "Preencha todos os campos obrigatórios.",
        });
        return;
      }

      const payload = {
        tipo: 'cartao',
        nome: newPaymentMethod.cardholderName,
        dados: {
          card_last_four: newPaymentMethod.cardNumber.slice(-4),
          expiry: newPaymentMethod.expiryDate,
          bank: newPaymentMethod.bankName
        }
      };
      const res = await axios.post(`${API}/profile/payment-methods`, payload);
      const pm = res.data.payment_method;
      const mapped = {
        id: pm.id,
        type: 'card',
        cardNumber: `**** **** **** ${pm.dados.card_last_four}`,
        lastFour: pm.dados.card_last_four,
        expiryDate: pm.dados.expiry,
        cardholderName: payload.nome,
        bankName: pm.dados.bank,
        isDefault: paymentMethods.length === 0
      };
      setPaymentMethods(prev => [...prev, mapped]);
      setNewPaymentMethod({
        type: 'card',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: '',
        bankName: ''
      });
      setShowPaymentModal(false);

      toast({
        title: "Forma de pagamento adicionada!",
        description: "Sua forma de pagamento foi salva com sucesso.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar a forma de pagamento.",
      });
    }
  };

  const handleRemovePaymentMethod = async (id) => {
    try {
      await axios.delete(`${API}/profile/payment-methods/${id}`);
      setPaymentMethods(prev => prev.filter(method => method.id !== id));
      toast({
        title: "Forma de pagamento removida",
        description: "A forma de pagamento foi removida com sucesso.",
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao remover',
        description: error.response?.data?.detail || 'Tente novamente',
      });
    }
  };

  const handleSettingsUpdate = async () => {
    try {
      await axios.put(`${API}/settings`, {
        geolocalizacao_ativa: settings.geolocalizacao_ativa,
        notificacoes_ativadas: settings.notificacoes_ativadas,
        privacidade_perfil: settings.privacidade_perfil,
      });
      toast({
        title: "Configurações salvas!",
        description: "Suas preferências foram atualizadas.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar configurações",
        description: error.response?.data?.detail || "Tente novamente",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Minha Conta</h2>
        <Button variant="destructive" size="sm" onClick={() => {
          console.log('🔍 ProfileContent: Botão Sair clicado');
          console.log('🔍 ProfileContent: onLogout function:', onLogout);
          if (onLogout) {
            onLogout();
          } else {
            console.error('❌ ProfileContent: onLogout não está definido');
          }
        }}>
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="h-20 w-20 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                  {profile.foto_url ? (
                    <img 
                      src={profile.foto_url} 
                      alt="Foto do perfil" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      {user.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
                    </span>
                  )}
                </div>
                
                {/* Overlay de upload */}
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                     onClick={() => fileInputRef.current?.click()}>
                  <div className="text-center text-white">
                    <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-xs">Alterar</span>
                  </div>
                </div>
                
                {/* Input de arquivo oculto */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                
                {/* Loading indicator */}
                {isUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                  </div>
                )}
              </div>
              
              {/* Botão para remover foto */}
              {profile.foto_url && (
                <button
                  onClick={handleRemovePhoto}
                  className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                  title="Remover foto"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
              <div>
                <h3 className="text-xl font-bold">{user.nome ? user.nome.split(' ')[0] : 'Usuário'}</h3>
                <p className="text-gray-600">{user.email}</p>
                <div className="flex items-center gap-2">
                  {user.tipos && user.tipos.length > 1 ? (
                    <div className="flex flex-wrap gap-1">
                      {user.tipos.map((tipo, index) => (
                        <Button
                          key={tipo}
                          variant={user.tipo_ativo === tipo ? 'default' : 'outline'}
                          size="sm"
                          className="text-xs h-6 px-2"
                          onClick={() => handleModeSwitch(tipo)}
                        >
                          {tipo === 'morador' ? '🏠' : tipo === 'prestador' ? '🔧' : '👑'} {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <Badge variant={user.tipo === 'morador' ? 'default' : 'secondary'}>
                      {user.tipo === 'morador' ? '🏠 Morador' : user.tipo === 'prestador' ? '🔧 Prestador' : '👑 Admin'}
                    </Badge>
                  )}
                  <span className="text-xs text-gray-500">
                    {user.tipos && user.tipos.length > 1 ? 'Clique para alternar' : 'Clique na foto para alterar'}
                  </span>
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2"
            >
              <Home className="h-4 w-4" />
              <span>Voltar ao Dashboard</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Profile Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-2">
          <Button
            variant={activeSection === 'dados' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveSection('dados')}
          >
            <User className="h-4 w-4 mr-2" />
            Dados Pessoais
          </Button>
          <Button
            variant={activeSection === 'pagamento' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveSection('pagamento')}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Pagamento
          </Button>
          <Button
            variant={activeSection === 'seguranca' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveSection('seguranca')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Segurança
          </Button>
        </div>

        <div className="md:col-span-3">
          {activeSection === 'dados' && (
            <Card>
              <CardHeader>
                <CardTitle>Dados Pessoais</CardTitle>
                <CardDescription>Atualize suas informações pessoais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome completo</Label>
                  <Input
                    id="nome"
                    value={profile.nome}
                    onChange={(e) => setProfile({ ...profile, nome: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={profile.email} disabled />
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={profile.telefone}
                    onChange={(e) => setProfile({ ...profile, telefone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={profile.endereco}
                    onChange={(e) => setProfile({ ...profile, endereco: e.target.value })}
                  />
                </div>
                <Button onClick={handleProfileUpdate}>Salvar Alterações</Button>
              </CardContent>
            </Card>
          )}

          {activeSection === 'pagamento' && (
            <Card>
              <CardHeader>
                <CardTitle>Formas de Pagamento</CardTitle>
                <CardDescription>Gerencie suas formas de pagamento</CardDescription>
              </CardHeader>
              <CardContent>
                {paymentMethods.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma forma de pagamento</h3>
                    <p className="text-gray-500 mb-4">Adicione cartões ou contas para facilitar os pagamentos</p>
                    <Button onClick={handleAddPaymentMethod}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Forma de Pagamento
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="h-8 w-8 text-gray-400" />
                          <div>
                            <p className="font-medium">**** **** **** {method.lastFour}</p>
                            <p className="text-sm text-gray-500">{method.cardholderName}</p>
                            <p className="text-sm text-gray-500">{method.expiryDate}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {method.isDefault && (
                            <Badge variant="default">Padrão</Badge>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemovePaymentMethod(method.id)}
                          >
                            Remover
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button onClick={handleAddPaymentMethod} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Outra Forma de Pagamento
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeSection === 'seguranca' && (
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Segurança</CardTitle>
                <CardDescription>Gerencie suas preferências de privacidade e segurança</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {user.tipo === 'prestador' && (
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Geolocalização</h4>
                      <p className="text-sm text-gray-500">Permitir que moradores vejam sua localização no mapa</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="geo"
                        checked={settings.geolocalizacao_ativa}
                        onChange={(e) => setSettings({ ...settings, geolocalizacao_ativa: e.target.checked })}
                        className="rounded"
                      />
                      <Label htmlFor="geo">Ativado</Label>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Notificações</h4>
                    <p className="text-sm text-gray-500">Receber notificações sobre agendamentos e mensagens</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="notif"
                      checked={settings.notificacoes_ativadas}
                      onChange={(e) => setSettings({ ...settings, notificacoes_ativadas: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="notif">Ativado</Label>
                  </div>
                </div>

                <div>
                  <Label>Privacidade do Perfil</Label>
                  <Select 
                    value={settings.privacidade_perfil} 
                    onValueChange={(value) => setSettings({ ...settings, privacidade_perfil: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="publico">Público</SelectItem>
                      <SelectItem value="privado">Privado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleSettingsUpdate}>Salvar Configurações</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modal para Adicionar Forma de Pagamento */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Forma de Pagamento</DialogTitle>
            <DialogDescription>
              Adicione um cartão de crédito ou débito para facilitar seus pagamentos.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardNumber">Número do Cartão</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={newPaymentMethod.cardNumber}
                onChange={(e) => {
                  let value = e.target.value.replace(/\s/g, '');
                  if (value.length > 16) value = value.slice(0, 16);
                  value = value.replace(/(.{4})/g, '$1 ').trim();
                  setNewPaymentMethod({ ...newPaymentMethod, cardNumber: value });
                }}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryDate">Validade</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/AA"
                  value={newPaymentMethod.expiryDate}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length >= 2) {
                      value = value.slice(0, 2) + '/' + value.slice(2, 4);
                    }
                    setNewPaymentMethod({ ...newPaymentMethod, expiryDate: value });
                  }}
                />
              </div>
              
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={newPaymentMethod.cvv}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                    setNewPaymentMethod({ ...newPaymentMethod, cvv: value });
                  }}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="cardholderName">Nome no Cartão</Label>
              <Input
                id="cardholderName"
                placeholder="Nome como está no cartão"
                value={newPaymentMethod.cardholderName}
                onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, cardholderName: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="bankName">Banco (opcional)</Label>
              <Input
                id="bankName"
                placeholder="Nome do banco"
                value={newPaymentMethod.bankName}
                onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, bankName: e.target.value })}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSavePaymentMethod}>
              Adicionar Cartão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete account */}
      <Card>
        <CardHeader>
          <CardTitle>Excluir conta</CardTitle>
          <CardDescription>Excluir permanentemente sua conta (delete lógico)</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">Apagar minha conta</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tem certeza que deseja excluir de forma permanente a conta?</DialogTitle>
                <DialogDescription>Essa ação desativará sua conta. Você poderá entrar em contato para reativação.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline">Cancelar</Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    try {
                      await axios.delete(`${API}/account`);
                      toast({ title: 'Conta excluída', description: 'Sua conta foi desativada.' });
                      onLogout();
                      navigate('/login');
                    } catch (error) {
                      toast({ variant: 'destructive', title: 'Erro ao excluir', description: error.response?.data?.detail || 'Tente novamente' });
                    }
                  }}
                >
                  Confirmar exclusão
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

function AppContent() {
  const { user, needsProfileSelection, finishProfileSelection } = useAuth();

  // Se o usuário precisa selecionar perfil, mostrar ProfileSelector
  if (needsProfileSelection && user) {
    return <ProfileSelector user={user} onProfileSelected={finishProfileSelection} />;
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/conta" element={<ProtectedRoute><ProfileContentWrapper /></ProtectedRoute>} />
            <Route path="/pagamento" element={<ProtectedRoute><EarningsPlaceholder /></ProtectedRoute>} />
            <Route path="/seguranca" element={<ProtectedRoute><SecurityPlaceholder /></ProtectedRoute>} />
            <Route path="/mapa" element={<ProtectedRoute><Mapa /></ProtectedRoute>} />
            <Route path="/servicos" element={<ProtectedRoute><ServicesContent services={[]} onBook={() => {}} /></ProtectedRoute>} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/:tab"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<ProtectedRoute><EnhancedDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/inicio" element={<ProtectedRoute><EnhancedDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/servicos" element={<ProtectedRoute><PageWrapper><SearchWithNavigation /></PageWrapper></ProtectedRoute>} />
            <Route path="/dashboard/agendamentos" element={<ProtectedRoute><PageWrapper><MyOrders /></PageWrapper></ProtectedRoute>} />
            <Route path="/dashboard/meus-servicos" element={<ProtectedRoute><PageWrapper><ServiceManagement /></PageWrapper></ProtectedRoute>} />
            <Route path="/dashboard/faturamento" element={<ProtectedRoute><PageWrapper><div className="text-center py-8"><h2 className="text-2xl font-bold mb-4">Faturamento</h2><p className="text-gray-600">Funcionalidade em desenvolvimento</p></div></PageWrapper></ProtectedRoute>} />
            <Route path="/dashboard/conta" element={<ProtectedRoute><PageWrapper><ProfileContentWrapper /></PageWrapper></ProtectedRoute>} />
            <Route path="/busca" element={<ProtectedRoute><PageWrapper><SearchWithNavigation /></PageWrapper></ProtectedRoute>} />
            <Route path="/mobile-booking" element={<ProtectedRoute><MobileBookingFlow /></ProtectedRoute>} />
            <Route path="/agenda/:professionalId" element={<ProtectedRoute><PageWrapper><ProfessionalAgendaWrapper /></PageWrapper></ProtectedRoute>} />
            <Route path="/agendamento" element={<ProtectedRoute><PageWrapper><NewBookingFlow /></PageWrapper></ProtectedRoute>} />
            <Route path="/servicos" element={<ProtectedRoute><PageWrapper><ServiceManagement /></PageWrapper></ProtectedRoute>} />
            <Route path="/mapa" element={<ProtectedRoute><PageWrapper><UberStyleMap /></PageWrapper></ProtectedRoute>} />
            <Route path="/meus-pedidos" element={<ProtectedRoute><PageWrapper><MyOrders /></PageWrapper></ProtectedRoute>} />
            <Route path="/avaliar" element={<ProtectedRoute><PageWrapper><ReviewScreen /></PageWrapper></ProtectedRoute>} />
            <Route path="/conta" element={<ProtectedRoute><PageWrapper><ProfileContentWrapper /></PageWrapper></ProtectedRoute>} />
            <Route path="/pagamento" element={<ProtectedRoute><PageWrapper><PaymentMethodsWrapper /></PageWrapper></ProtectedRoute>} />
            <Route path="/pagamento/historico" element={<ProtectedRoute><PageWrapper><PaymentHistoryWrapper /></PageWrapper></ProtectedRoute>} />
            <Route path="/pagamento/processar/:bookingId" element={<ProtectedRoute><PageWrapper><PaymentProcessWrapper /></PageWrapper></ProtectedRoute>} />
            <Route path="/seguranca" element={<ProtectedRoute><PageWrapper><div className="text-center py-8"><h2 className="text-2xl font-bold mb-4">Segurança</h2><p className="text-gray-600">Funcionalidade em desenvolvimento</p></div></PageWrapper></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;