import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  DollarSign,
  Bell,
  Shield,
  CreditCard,
  Save,
  Camera,
  Edit,
  Check,
  X
} from 'lucide-react';

const ProviderSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-9999',
    avatar: '/images/avatar.jpg',
    bio: 'Prestador de serviços com mais de 5 anos de experiência em limpeza e manutenção residencial.',
    address: {
      street: 'Rua das Flores, 123',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567'
    },
    workingHours: {
      monday: { start: '08:00', end: '18:00', enabled: true },
      tuesday: { start: '08:00', end: '18:00', enabled: true },
      wednesday: { start: '08:00', end: '18:00', enabled: true },
      thursday: { start: '08:00', end: '18:00', enabled: true },
      friday: { start: '08:00', end: '18:00', enabled: true },
      saturday: { start: '09:00', end: '16:00', enabled: true },
      sunday: { start: '10:00', end: '15:00', enabled: false }
    },
    pricing: {
      baseRate: 50.00,
      hourlyRate: 25.00,
      minimumHours: 2,
      cancellationPolicy: '24h'
    },
    notifications: {
      newBookings: true,
      messages: true,
      reminders: true,
      marketing: false,
      email: true,
      sms: false,
      push: true
    },
    security: {
      twoFactor: false,
      loginAlerts: true,
      sessionTimeout: 30
    }
  });

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'availability', label: 'Disponibilidade', icon: Calendar },
    { id: 'pricing', label: 'Preços', icon: DollarSign },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'payment', label: 'Pagamentos', icon: CreditCard }
  ];

  const days = [
    { key: 'monday', label: 'Segunda-feira' },
    { key: 'tuesday', label: 'Terça-feira' },
    { key: 'wednesday', label: 'Quarta-feira' },
    { key: 'thursday', label: 'Quinta-feira' },
    { key: 'friday', label: 'Sexta-feira' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' }
  ];

  const handleSave = async () => {
    setIsSaving(true);
    // Simular salvamento
    setTimeout(() => {
      setIsSaving(false);
      // Mostrar notificação de sucesso
    }, 1000);
  };

  const ProfileTab = () => (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-gray-500" />
          </div>
          <button className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
            <Camera className="w-3 h-3 text-white" />
          </button>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">Foto do Perfil</h3>
          <p className="text-sm text-gray-600">Clique para alterar sua foto</p>
        </div>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome Completo
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={profile.name}
            onChange={(e) => setProfile({...profile, name: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={profile.email}
            onChange={(e) => setProfile({...profile, email: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telefone
          </label>
          <input
            type="tel"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={profile.phone}
            onChange={(e) => setProfile({...profile, phone: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CEP
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={profile.address.zipCode}
            onChange={(e) => setProfile({...profile, address: {...profile.address, zipCode: e.target.value}})}
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Endereço
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={profile.address.street}
          onChange={(e) => setProfile({...profile, address: {...profile.address, street: e.target.value}})}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bairro
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={profile.address.neighborhood}
            onChange={(e) => setProfile({...profile, address: {...profile.address, neighborhood: e.target.value}})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cidade
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={profile.address.city}
            onChange={(e) => setProfile({...profile, address: {...profile.address, city: e.target.value}})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={profile.address.state}
            onChange={(e) => setProfile({...profile, address: {...profile.address, state: e.target.value}})}
          />
        </div>
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Biografia
        </label>
        <textarea
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={profile.bio}
          onChange={(e) => setProfile({...profile, bio: e.target.value})}
          placeholder="Conte um pouco sobre você e seus serviços..."
        />
      </div>
    </div>
  );

  const AvailabilityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Horários de Trabalho
        </h3>
        <div className="space-y-4">
          {days.map((day) => (
            <div key={day.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={profile.workingHours[day.key].enabled}
                  onChange={(e) => setProfile({
                    ...profile,
                    workingHours: {
                      ...profile.workingHours,
                      [day.key]: {
                        ...profile.workingHours[day.key],
                        enabled: e.target.checked
                      }
                    }
                  })}
                />
                <label className="ml-3 text-sm font-medium text-gray-900">
                  {day.label}
                </label>
              </div>
              {profile.workingHours[day.key].enabled && (
                <div className="flex items-center space-x-2">
                  <input
                    type="time"
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                    value={profile.workingHours[day.key].start}
                    onChange={(e) => setProfile({
                      ...profile,
                      workingHours: {
                        ...profile.workingHours,
                        [day.key]: {
                          ...profile.workingHours[day.key],
                          start: e.target.value
                        }
                      }
                    })}
                  />
                  <span className="text-gray-500">até</span>
                  <input
                    type="time"
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                    value={profile.workingHours[day.key].end}
                    onChange={(e) => setProfile({
                      ...profile,
                      workingHours: {
                        ...profile.workingHours,
                        [day.key]: {
                          ...profile.workingHours[day.key],
                          end: e.target.value
                        }
                      }
                    })}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const PricingTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Taxa Base (R$)
          </label>
          <input
            type="number"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={profile.pricing.baseRate}
            onChange={(e) => setProfile({...profile, pricing: {...profile.pricing, baseRate: parseFloat(e.target.value)}})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Taxa por Hora (R$)
          </label>
          <input
            type="number"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={profile.pricing.hourlyRate}
            onChange={(e) => setProfile({...profile, pricing: {...profile.pricing, hourlyRate: parseFloat(e.target.value)}})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Horas Mínimas
          </label>
          <input
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={profile.pricing.minimumHours}
            onChange={(e) => setProfile({...profile, pricing: {...profile.pricing, minimumHours: parseInt(e.target.value)}})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Política de Cancelamento
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={profile.pricing.cancellationPolicy}
            onChange={(e) => setProfile({...profile, pricing: {...profile.pricing, cancellationPolicy: e.target.value}})}
          >
            <option value="24h">24 horas</option>
            <option value="48h">48 horas</option>
            <option value="72h">72 horas</option>
            <option value="1w">1 semana</option>
          </select>
        </div>
      </div>
    </div>
  );

  const NotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Preferências de Notificação
        </h3>
        <div className="space-y-4">
          {Object.entries(profile.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">
                  {key === 'newBookings' && 'Novos Agendamentos'}
                  {key === 'messages' && 'Mensagens'}
                  {key === 'reminders' && 'Lembretes'}
                  {key === 'marketing' && 'Marketing'}
                </h4>
                <p className="text-sm text-gray-600">
                  {key === 'newBookings' && 'Receber notificações sobre novos agendamentos'}
                  {key === 'messages' && 'Receber notificações sobre mensagens'}
                  {key === 'reminders' && 'Receber lembretes de agendamentos'}
                  {key === 'marketing' && 'Receber ofertas e novidades'}
                </p>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={value}
                onChange={(e) => setProfile({
                  ...profile,
                  notifications: {
                    ...profile.notifications,
                    [key]: e.target.checked
                  }
                })}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Canais de Notificação
        </h3>
        <div className="space-y-4">
          {Object.entries(profile.notifications).filter(([key]) => ['email', 'sms', 'push'].includes(key)).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">
                  {key === 'email' && 'Email'}
                  {key === 'sms' && 'SMS'}
                  {key === 'push' && 'Push Notifications'}
                </h4>
                <p className="text-sm text-gray-600">
                  {key === 'email' && 'Receber notificações por email'}
                  {key === 'sms' && 'Receber notificações por SMS'}
                  {key === 'push' && 'Receber notificações push no navegador'}
                </p>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={value}
                onChange={(e) => setProfile({
                  ...profile,
                  notifications: {
                    ...profile.notifications,
                    [key]: e.target.checked
                  }
                })}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const SecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Configurações de Segurança
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Autenticação de Dois Fatores</h4>
              <p className="text-sm text-gray-600">Adicionar uma camada extra de segurança</p>
            </div>
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={profile.security.twoFactor}
              onChange={(e) => setProfile({
                ...profile,
                security: {
                  ...profile.security,
                  twoFactor: e.target.checked
                }
              })}
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Alertas de Login</h4>
              <p className="text-sm text-gray-600">Receber notificações sobre logins suspeitos</p>
            </div>
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={profile.security.loginAlerts}
              onChange={(e) => setProfile({
                ...profile,
                security: {
                  ...profile.security,
                  loginAlerts: e.target.checked
                }
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timeout de Sessão (minutos)
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={profile.security.sessionTimeout}
              onChange={(e) => setProfile({
                ...profile,
                security: {
                  ...profile.security,
                  sessionTimeout: parseInt(e.target.value)
                }
              })}
            >
              <option value={15}>15 minutos</option>
              <option value={30}>30 minutos</option>
              <option value={60}>1 hora</option>
              <option value={120}>2 horas</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const PaymentTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Configurações de Pagamento
        </h3>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <Shield className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Informações Seguras
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Suas informações de pagamento são criptografadas e protegidas. 
                  Nunca compartilhamos seus dados financeiros com terceiros.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Conta Bancária</h4>
            <p className="text-sm text-gray-600 mb-4">
              Configure sua conta bancária para receber pagamentos
            </p>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <CreditCard className="w-4 h-4 mr-2" />
              Configurar Conta
            </button>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">PIX</h4>
            <p className="text-sm text-gray-600 mb-4">
              Configure sua chave PIX para receber pagamentos instantâneos
            </p>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <CreditCard className="w-4 h-4 mr-2" />
              Configurar PIX
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab />;
      case 'availability':
        return <AvailabilityTab />;
      case 'pricing':
        return <PricingTab />;
      case 'notifications':
        return <NotificationsTab />;
      case 'security':
        return <SecurityTab />;
      case 'payment':
        return <PaymentTab />;
      default:
        return <ProfileTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Configurações
              </h1>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderSettings;
