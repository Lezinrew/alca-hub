import React, { useState, useEffect, createContext, useContext } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { Label } from "./components/ui/label";
import { Textarea } from "./components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Calendar, Clock, User, Star, MapPin, Phone, Mail, Plus, Home, Settings, LogOut, Users, CreditCard, Zap } from "lucide-react";
import { useToast } from "./hooks/use-toast";
import { Toaster } from "./components/ui/toaster";
import QRCode from "qrcode.react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [myServices, setMyServices] = useState([]);
  const [stats, setStats] = useState(null);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Home className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Alça Hub</span>
              <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                v1.0 • Demo
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Olá, <span className="font-semibold">{user.nome}</span>
              </span>
              <Badge variant={user.tipo === 'morador' ? 'default' : user.tipo === 'prestador' ? 'secondary' : 'destructive'}>
                {user.tipo === 'morador' ? '🏠 Morador' : user.tipo === 'prestador' ? '🔧 Prestador' : '👑 Admin'}
              </Badge>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {user.tipo === 'morador' && (
              <>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-blue-100">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Agendamentos</p>
                        <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-orange-100">
                        <CreditCard className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Pagamentos Pendentes</p>
                        <p className="text-2xl font-bold text-gray-900">{getPendingPayments()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-green-100">
                        <Star className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Serviços Concluídos</p>
                        <p className="text-2xl font-bold text-gray-900">{getCompletedServices()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {user.tipo === 'prestador' && (
              <>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-blue-100">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Meus Serviços</p>
                        <p className="text-2xl font-bold text-gray-900">{myServices.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-green-100">
                        <Star className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Faturamento</p>
                        <p className="text-2xl font-bold text-gray-900">R$ {getTotalEarnings().toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-purple-100">
                        <Calendar className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Agendamentos</p>
                        <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue={user.tipo === 'morador' ? 'services' : 'my-services'} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              {user.tipo === 'morador' && (
                <TabsTrigger value="services">🔍 Buscar Serviços</TabsTrigger>
              )}
              {user.tipo === 'prestador' && (
                <TabsTrigger value="my-services">🛠️ Meus Serviços</TabsTrigger>
              )}
              <TabsTrigger value="bookings">
                📅 {user.tipo === 'morador' ? 'Meus Agendamentos' : 'Agendamentos Recebidos'}
              </TabsTrigger>
            </TabsList>

            {user.tipo === 'morador' && (
              <TabsContent value="services" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Serviços Disponíveis</h2>
                  <Badge variant="outline">
                    {services.length} serviços encontrados
                  </Badge>
                </div>
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
                      <ServiceCard key={service.id} service={service} onBook={loadData} />
                    ))}
                  </div>
                )}
              </TabsContent>
            )}

            {user.tipo === 'prestador' && (
              <TabsContent value="my-services" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Meus Serviços</h2>
                  <CreateServiceDialog onSuccess={loadData} />
                </div>
                {myServices.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum serviço cadastrado</h3>
                      <p className="text-gray-500 mb-4">Comece criando seu primeiro serviço.</p>
                      <CreateServiceDialog onSuccess={loadData} />
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {myServices.map((service) => (
                      <ServiceCard key={service.id} service={service} isOwner={true} />
                    ))}
                  </div>
                )}
              </TabsContent>
            )}

            <TabsContent value="bookings" className="space-y-4">
              <h2 className="text-2xl font-bold">
                {user.tipo === 'morador' ? 'Meus Agendamentos' : 'Agendamentos Recebidos'}
              </h2>
              {bookings.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum agendamento</h3>
                    <p className="text-gray-500">
                      {user.tipo === 'morador' 
                        ? 'Faça seu primeiro agendamento na aba "Buscar Serviços"' 
                        : 'Aguarde agendamentos dos moradores'
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} onUpdate={loadData} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
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
              <Label htmlFor="nome">Nome do Serviço</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="categoria">Categoria</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="limpeza">Limpeza</SelectItem>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                  <SelectItem value="jardinagem">Jardinagem</SelectItem>
                  <SelectItem value="pintura">Pintura</SelectItem>
                  <SelectItem value="eletrica">Elétrica</SelectItem>
                  <SelectItem value="encanamento">Encanamento</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                    <QRCode 
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

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
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