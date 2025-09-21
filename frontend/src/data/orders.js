// Dados dos Pedidos - Alça Hub
export const ORDERS_DATA = [
  {
    id: "ORD-001",
    status: "concluido",
    professional: {
      id: "1",
      name: "João Silva",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      rating: 4.8
    },
    service: {
      name: "Limpeza Residencial Completa",
      category: "Limpeza Residencial",
      description: "Limpeza profunda de toda a residência incluindo todos os cômodos"
    },
    date: "2024-01-15",
    time: "14:00 - 16:00",
    duration: 2,
    price: 160,
    payment_status: "paid",
    address: "Rua das Flores, 123 - Vila Madalena, São Paulo",
    notes: "Limpeza completa da sala, cozinha e banheiros. Produtos eco-friendly utilizados.",
    rating: 5,
    review: "Excelente serviço! Muito profissional e organizado. Limpeza impecável e pontual.",
    created_at: "2024-01-10T10:00:00Z",
    completed_at: "2024-01-15T16:00:00Z"
  },
  {
    id: "ORD-002",
    status: "pendente",
    professional: {
      id: "2",
      name: "Maria Santos",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      rating: 4.9
    },
    service: {
      name: "Organização Residencial Premium",
      category: "Organização",
      description: "Organização completa de ambientes, armários e espaços de trabalho"
    },
    date: "2024-01-20",
    time: "09:00 - 13:00",
    duration: 4,
    price: 360,
    payment_status: "pending",
    address: "Rua das Flores, 123 - Vila Madalena, São Paulo",
    notes: "Organização completa do quarto, closet e área de trabalho. Inclui separação de roupas por estação.",
    created_at: "2024-01-12T14:30:00Z"
  },
  {
    id: "ORD-003",
    status: "confirmado",
    professional: {
      id: "1",
      name: "João Silva",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      rating: 4.8
    },
    service: {
      name: "Limpeza Pós-Reforma",
      category: "Limpeza Pós-Obra",
      description: "Limpeza especializada após reforma com remoção de resíduos de construção"
    },
    date: "2024-01-25",
    time: "10:00 - 14:00",
    duration: 4,
    price: 300,
    payment_status: "paid",
    address: "Rua das Flores, 123 - Vila Madalena, São Paulo",
    notes: "Limpeza completa após reforma da cozinha. Remoção de poeira e resíduos de construção.",
    created_at: "2024-01-18T16:45:00Z"
  },
  {
    id: "ORD-004",
    status: "concluido",
    professional: {
      id: "3",
      name: "Carlos Oliveira",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      rating: 4.7
    },
    service: {
      name: "Limpeza Comercial Executiva",
      category: "Limpeza Comercial",
      description: "Limpeza especializada de escritórios executivos com produtos premium"
    },
    date: "2024-01-08",
    time: "08:00 - 14:00",
    duration: 6,
    price: 420,
    payment_status: "paid",
    address: "Av. Paulista, 1000 - Bela Vista, São Paulo",
    notes: "Limpeza completa do escritório executivo. Inclui sanitização e organização de documentos.",
    rating: 4,
    review: "Bom serviço, pontual e eficiente. Escritório ficou impecável.",
    created_at: "2024-01-05T11:20:00Z",
    completed_at: "2024-01-08T14:00:00Z"
  },
  {
    id: "ORD-005",
    status: "cancelado",
    professional: {
      id: "2",
      name: "Maria Santos",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      rating: 4.9
    },
    service: {
      name: "Limpeza Pós-Obra Premium",
      category: "Limpeza Pós-Obra",
      description: "Limpeza especializada após reforma com remoção de resíduos tóxicos"
    },
    date: "2024-01-12",
    time: "15:00 - 19:00",
    duration: 4,
    price: 720,
    payment_status: "refunded",
    address: "Rua das Flores, 123 - Vila Madalena, São Paulo",
    notes: "Cancelado por mudança de data da reforma. Cliente solicitou reagendamento.",
    created_at: "2024-01-08T09:15:00Z",
    cancelled_at: "2024-01-10T14:30:00Z"
  }
];

// Estatísticas dos pedidos
export const getOrderStats = (ordersData = ORDERS_DATA) => {
  const total = ordersData.length;
  const pending = ordersData.filter(order => order.status === 'pendente').length;
  const completed = ordersData.filter(order => order.status === 'concluido').length;
  const confirmed = ordersData.filter(order => order.status === 'confirmado').length;
  const cancelled = ordersData.filter(order => order.status === 'cancelado').length;
  
  return {
    total,
    pending,
    completed,
    confirmed,
    cancelled
  };
};

// Função para buscar pedidos por status
export const getOrdersByStatus = (ordersData, status) => {
  if (status === 'all') return ordersData;
  return ordersData.filter(order => order.status === status);
};

// Função para buscar pedido por ID
export const getOrderById = (id) => {
  return ORDERS_DATA.find(order => order.id === id);
};

// Função para adicionar novo agendamento
export const addNewOrder = (orderData) => {
  const savedOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
  const newOrder = {
    id: `ORD-${Date.now()}`,
    status: 'pendente',
    created_at: new Date().toISOString(),
    ...orderData
  };
  
  const updatedOrders = [...savedOrders, newOrder];
  localStorage.setItem('userOrders', JSON.stringify(updatedOrders));
  
  return newOrder;
};
