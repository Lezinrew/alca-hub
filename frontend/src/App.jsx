import React, { useState, useEffect, createContext, useContext } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { Sheet, SheetContent, SheetHeader as UISheetHeader, SheetTitle as UISheetTitle, SheetTrigger, SheetClose } from "./components/ui/sheet";
import SideMenu from "./components/SideMenu";
import { Label } from "./components/ui/label";
import { Textarea } from "./components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { SERVICE_CATEGORIES_DATA } from "./components/ServiceCategories";
import { Calendar, Clock, User, Star, MapPin, Phone, Mail, Plus, Home, Settings, LogOut, Users, CreditCard, Zap, Map } from "lucide-react";
import { useToast } from "./hooks/use-toast";
import { Toaster } from "./components/ui/toaster";
import { QRCodeCanvas } from "qrcode.react";
import UberStyleMap from "./components/UberStyleMap.jsx";
import { API_URL } from "./lib/config";
import AdminDashboard from "./pages/AdminDashboard";
import Mapa from "./pages/Mapa";

const API = `${API_URL}/api`;

// Auth Context
const AuthContext = createContext();

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API}/auth/login`, { email, password });
      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Erro ao fazer login' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API}/auth/register`, userData);
      const { access_token, user: newUser } = response.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(newUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      setUser(newUser);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Erro ao fazer cadastro' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

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

// Components
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao Alça Hub",
      });
      navigate('/dashboard');
    } else {
      toast({
        variant: "destructive",
        title: "Erro no login",
        description: result.error,
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-indigo-900">Alça Hub</CardTitle>
          <CardDescription>Entre na sua conta para continuar</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
            <Link to="/forgot-password" className="text-sm text-[#6366F1] hover:underline text-center">
              Esqueceu a senha?
            </Link>
            <p className="text-sm text-center">
              Não tem conta?{" "}
              <Link to="/register" className="text-indigo-600 hover:underline">
                Cadastre-se
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
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
    tipo: ""
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await register(formData);
    
    if (result.success) {
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Bem-vindo ao Alça Hub",
      });
      navigate('/dashboard');
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
              <Label htmlFor="tipo">Tipo de usuário</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morador">Morador</SelectItem>
                  <SelectItem value="prestador">Prestador de Serviços</SelectItem>
                </SelectContent>
              </Select>
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
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({
      title: "Se o email existir, enviaremos instruções",
      description: "Verifique sua caixa de entrada",
    });
    navigate('/login');
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
            <Button type="submit" className="w-full">Enviar</Button>
            <Link to="/login" className="text-sm text-[#6366F1] hover:underline text-center">Voltar ao login</Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { tab } = useParams();
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [myServices, setMyServices] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('inicio');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      // Load different data based on user type
      if (user.tipo === 'morador') {
        const servicesResponse = await axios.get(`${API}/services`);
        setServices(servicesResponse.data);
      } else if (user.tipo === 'prestador') {
        const myServicesResponse = await axios.get(`${API}/my-services`);
        setMyServices(myServicesResponse.data);
      }
      
      const bookingsResponse = await axios.get(`${API}/bookings`);
      setBookings(bookingsResponse.data);

      // Get stats for admin or general info
      if (user.tipo === 'admin') {
        try {
          const statsResponse = await axios.get(`${API}/stats/overview`);
          setStats(statsResponse.data);
        } catch (error) {
          console.log('Stats not available for this user');
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: "Alguns dados podem não estar disponíveis",
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPendingPayments = () => {
    return bookings.filter(booking => 
      booking.payment_status === 'pending' && user.id === booking.morador_id
    ).length;
  };

  const getCompletedServices = () => {
    return bookings.filter(booking => 
      booking.status === 'concluido' && 
      (user.tipo === 'morador' ? user.id === booking.morador_id : user.id === booking.prestador_id)
    ).length;
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
    if (user.tipo === 'morador') {
      return [
        { id: 'inicio', label: 'Início', icon: Home },
        { id: 'servicos', label: 'Serviços', icon: Users },
        { id: 'agendamentos', label: 'Meus Pedidos', icon: Calendar },
        { id: 'conta', label: 'Conta', icon: User }
      ];
    } else if (user.tipo === 'prestador') {
      return [
        { id: 'inicio', label: 'Início', icon: Home },
        { id: 'meus-servicos', label: 'Serviços', icon: Settings },
        { id: 'agendamentos', label: 'Agendamentos', icon: Calendar },
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
  }, [tab, user.tipo]);

  const renderContent = () => {
    if (user.tipo === 'admin') {
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
        return <BookingsContent bookings={bookings} onUpdate={loadData} />;
      case 'faturamento':
        return <EarningsContent user={user} />;
      case 'conta':
        return <ProfileContent user={user} onUpdate={loadData} onLogout={handleLogout} />;
      default:
        return <HomeContent user={user} stats={{ getPendingPayments: getPendingPayments(), getCompletedServices: getCompletedServices(), getTotalEarnings: getTotalEarnings() }} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/logo-alca-hub.png" alt="Logo Alça Hub" className="h-8" />
              <Sheet>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label="Abrir menu"
                    className="ml-3 p-2 rounded hover:bg-gray-100 active:scale-95 transition cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-700">
                      <path fillRule="evenodd" d="M3.75 6.75A.75.75 0 0 1 4.5 6h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Zm0 5.25a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Zm.75 4.5a.75.75 0 0 0 0 1.5h15a.75.75 0 0 0 0-1.5h-15Z" clipRule="evenodd" />
                    </svg>
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <UISheetHeader>
                    <UISheetTitle>Menu</UISheetTitle>
                  </UISheetHeader>
                  <SheetClose asChild>
                    <div>
                      <SideMenu onNavigate={(p) => navigate(p)} onClose={() => {}} />
                    </div>
                  </SheetClose>
                </SheetContent>
              </Sheet>
              <span className="ml-2 text-xl font-bold text-gray-900">Alça Hub</span>
              <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                v2.0
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                <span className="font-semibold">{user.nome}</span>
              </span>
              {user.tipo === 'morador' ? (
                <Button size="sm" onClick={() => setActiveTab('agendamentos')}>
                  Meus Pedidos
                </Button>
              ) : (
                <Badge variant={user.tipo === 'prestador' ? 'secondary' : 'destructive'}>
                  {user.tipo === 'prestador' ? '🔧 Prestador' : '👑 Admin'}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {renderContent()}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
        <div className="grid grid-cols-4 md:grid-cols-5 max-w-md mx-auto">
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

      await axios.post(`${API}/bookings`, bookingData);
      
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

      await axios.post(`${API}/services`, serviceData);
      
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
      await axios.patch(`${API}/bookings/${booking.id}`, { status: newStatus });
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
        payer_name: user.nome,
        payer_identification: user.cpf,
        payer_identification_type: "CPF"
      };

      const response = await axios.post(`${API}/payments/pix`, pixData);
      setPaymentData(response.data);
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
        const response = await axios.get(`${API}/payments/${paymentId}/status`);
        const status = response.data.status;
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
          Olá, {user.nome.split(' ')[0]}! 👋
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
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-blue-100">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Meus Pedidos</p>
                    <p className="text-xl font-bold text-gray-900">12</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
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
            <Card>
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
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-blue-100">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Meus Pedidos</p>
                    <p className="text-xl font-bold text-gray-900">8</p>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {user.tipo === 'morador' && (
              <>
                <Button variant="outline" className="h-20 flex-col hover:bg-gray-100 active:scale-95 transition cursor-pointer" onClick={() => navigate('/mapa')}>
                  <Map className="h-6 w-6 mb-2" />
                  <span className="text-xs">Ver Mapa</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col hover:bg-gray-100 active:scale-95 transition cursor-pointer" onClick={() => navigate('/servicos')}>
                  <Users className="h-6 w-6 mb-2" />
                  <span className="text-xs">Buscar Serviços</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col hover:bg-gray-100 active:scale-95 transition cursor-pointer" onClick={() => navigate('/meus-pedidos')}>
                  <Calendar className="h-6 w-6 mb-2" />
                  <span className="text-xs">Meus Pedidos</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col hover:bg-gray-100 active:scale-95 transition cursor-pointer" onClick={() => navigate('/avaliar')}>
                  <Star className="h-6 w-6 mb-2" />
                  <span className="text-xs">Avaliar</span>
                </Button>
              </>
            )}
            {user.tipo === 'prestador' && (
              <>
                <Button variant="outline" className="h-20 flex-col">
                  <Plus className="h-6 w-6 mb-2" />
                  <span className="text-xs">Novo Serviço</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Calendar className="h-6 w-6 mb-2" />
                  <span className="text-xs">Agenda</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <CreditCard className="h-6 w-6 mb-2" />
                  <span className="text-xs">Faturamento</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
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
      const response = await axios.get(`${API}/profile/earnings`);
      setEarnings(response.data);
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
  const [activeSection, setActiveSection] = useState('dados');
  const [profile, setProfile] = useState({
    nome: user.nome,
    telefone: user.telefone,
    endereco: user.endereco,
    bio: user.bio || '',
    foto_url: user.foto_url || ''
  });
  const [settings, setSettings] = useState({
    geolocalizacao_ativa: user.geolocalizacao_ativa || false,
    notificacoes_ativadas: user.notificacoes_ativadas !== false,
    privacidade_perfil: user.privacidade_perfil || 'publico'
  });
  const { toast } = useToast();

  const handleProfileUpdate = async () => {
    try {
      await axios.put(`${API}/profile`, profile);
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

  const handleSettingsUpdate = async () => {
    try {
      await axios.put(`${API}/settings`, settings);
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
        <Button variant="outline" onClick={onLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="h-20 w-20 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {user.nome.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-bold">{user.nome}</h3>
              <p className="text-gray-600">{user.email}</p>
              <Badge variant={user.tipo === 'morador' ? 'default' : 'secondary'}>
                {user.tipo === 'morador' ? '🏠 Morador' : '🔧 Prestador'}
              </Badge>
            </div>
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
                <div>
                  <Label htmlFor="bio">Biografia</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Conte um pouco sobre você..."
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
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma forma de pagamento</h3>
                  <p className="text-gray-500 mb-4">Adicione cartões ou contas para facilitar os pagamentos</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Forma de Pagamento
                  </Button>
                </div>
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
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/conta" element={<ProtectedRoute><ProfileContent user={{}} onUpdate={() => {}} onLogout={() => {}} /></ProtectedRoute>} />
            <Route path="/pagamento" element={<ProtectedRoute><EarningsPlaceholder /></ProtectedRoute>} />
            <Route path="/seguranca" element={<ProtectedRoute><SecurityPlaceholder /></ProtectedRoute>} />
            <Route path="/meus-pedidos" element={<ProtectedRoute><BookingsContent bookings={[]} onUpdate={() => {}} /></ProtectedRoute>} />
            <Route path="/mapa" element={<ProtectedRoute><Mapa /></ProtectedRoute>} />
            <Route path="/servicos" element={<ProtectedRoute><ServicesContent services={[]} onBook={() => {}} /></ProtectedRoute>} />
            <Route path="/avaliar" element={<ProtectedRoute><ReviewPlaceholder /></ProtectedRoute>} />
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
          </Routes>
        </BrowserRouter>
        <Toaster />
      </div>
    </AuthProvider>
  );
}

export default App;