// Histórico de Serviços Finalizados - Alça Hub
export const COMPLETED_SERVICES = [
  {
    id: "SVC-001",
    service: {
      name: "Limpeza Residencial Completa",
      category: "Limpeza Residencial",
      description: "Limpeza geral da casa incluindo sala, cozinha, banheiros e quartos"
    },
    professional: {
      id: "1",
      name: "João Silva",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      rating: 4.8,
      phone: "(11) 99999-1111"
    },
    date: "2024-01-15",
    time: "14:00 - 16:00",
    duration: 2,
    price: 160,
    status: "concluido",
    address: "Rua das Flores, 123 - Vila Madalena, São Paulo",
    notes: "Limpeza completa da sala e cozinha. Cliente muito satisfeito.",
    rating: 5,
    review: "Excelente serviço! Muito profissional e organizado. Recomendo!",
    completed_at: "2024-01-15T16:00:00Z",
    payment_status: "paid"
  },
  {
    id: "SVC-002",
    service: {
      name: "Organização de Armários",
      category: "Organização",
      description: "Organização completa de armários e closets"
    },
    professional: {
      id: "2",
      name: "Maria Santos",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      rating: 4.9,
      phone: "(11) 99999-2222"
    },
    date: "2024-01-10",
    time: "09:00 - 13:00",
    duration: 4,
    price: 360,
    status: "concluido",
    address: "Rua das Flores, 123 - Vila Madalena, São Paulo",
    notes: "Organização do quarto principal e closet. Resultado excelente.",
    rating: 5,
    review: "Maria é muito organizada e eficiente. Transformou completamente o espaço!",
    completed_at: "2024-01-10T13:00:00Z",
    payment_status: "paid"
  },
  {
    id: "SVC-003",
    service: {
      name: "Limpeza Pós-Obra",
      category: "Limpeza Pós-Obra",
      description: "Limpeza completa após reforma da cozinha"
    },
    professional: {
      id: "3",
      name: "Carlos Oliveira",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      rating: 4.7,
      phone: "(11) 99999-3333"
    },
    date: "2024-01-08",
    time: "08:00 - 14:00",
    duration: 6,
    price: 420,
    status: "concluido",
    address: "Rua das Flores, 123 - Vila Madalena, São Paulo",
    notes: "Limpeza pesada após reforma. Remoção de resíduos e limpeza profunda.",
    rating: 4,
    review: "Bom serviço, pontual e eficiente. Recomendo para limpezas pesadas.",
    completed_at: "2024-01-08T14:00:00Z",
    payment_status: "paid"
  }
];

// Estatísticas dos serviços
export const getServiceStats = () => {
  const total = COMPLETED_SERVICES.length;
  const totalValue = COMPLETED_SERVICES.reduce((sum, service) => sum + service.price, 0);
  const averageRating = COMPLETED_SERVICES.reduce((sum, service) => sum + service.rating, 0) / total;
  
  return {
    total,
    totalValue,
    averageRating: Math.round(averageRating * 10) / 10
  };
};

// Função para buscar serviços por categoria
export const getServicesByCategory = (category) => {
  if (category === 'all') return COMPLETED_SERVICES;
  return COMPLETED_SERVICES.filter(service => service.service.category === category);
};

// Função para buscar serviço por ID
export const getServiceById = (id) => {
  return COMPLETED_SERVICES.find(service => service.id === id);
};
