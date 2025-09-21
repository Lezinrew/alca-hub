// Dados dos Profissionais - Alça Hub
export const PROFESSIONALS_DATA = [
  {
    id: "1",
    name: "João Silva",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    rating: 4.8,
    reviews: 127,
    distance: "2.5 km",
    isOnline: true,
    specialties: ['Limpeza Residencial', 'Limpeza Comercial', 'Organização'],
    experience: '5 anos',
    languages: ['Português', 'Inglês'],
    responseTime: '2 horas',
    completionRate: 98,
    pricing: {
      hourly: { min: 80, max: 120 },
      daily: { min: 300, max: 500 },
      weekly: { min: 1500, max: 2500 }
    },
    services: [
      {
        name: 'Limpeza Básica',
        duration: 2,
        price: 160,
        description: 'Limpeza geral da casa'
      },
      {
        name: 'Limpeza Completa',
        duration: 4,
        price: 300,
        description: 'Limpeza profunda com organização'
      },
      {
        name: 'Limpeza Premium',
        duration: 6,
        price: 420,
        description: 'Limpeza completa + produtos premium'
      }
    ],
    location: {
      address: "Rua das Flores, 123 - Vila Madalena",
      city: "São Paulo",
      state: "SP",
      coordinates: [-23.5505, -46.6333]
    },
    availability: {
      monday: { start: "08:00", end: "18:00" },
      tuesday: { start: "08:00", end: "18:00" },
      wednesday: { start: "08:00", end: "18:00" },
      thursday: { start: "08:00", end: "18:00" },
      friday: { start: "08:00", end: "18:00" },
      saturday: { start: "09:00", end: "15:00" },
      sunday: { start: "10:00", end: "14:00" }
    }
  },
  {
    id: "2",
    name: "Maria Santos",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    rating: 4.9,
    reviews: 89,
    distance: "1.8 km",
    isOnline: true,
    specialties: ['Limpeza Residencial', 'Organização', 'Limpeza Pós-Obra'],
    experience: '7 anos',
    languages: ['Português'],
    responseTime: '1 hora',
    completionRate: 99,
    pricing: {
      hourly: { min: 90, max: 130 },
      daily: { min: 350, max: 550 },
      weekly: { min: 1800, max: 2800 }
    },
    services: [
      {
        name: 'Limpeza Pós-Obra',
        duration: 8,
        price: 720,
        description: 'Limpeza completa após reforma'
      },
      {
        name: 'Organização Residencial',
        duration: 4,
        price: 360,
        description: 'Organização de ambientes e armários'
      },
      {
        name: 'Limpeza Semanal',
        duration: 3,
        price: 270,
        description: 'Limpeza de manutenção semanal'
      }
    ],
    location: {
      address: "Av. Paulista, 1000 - Bela Vista",
      city: "São Paulo",
      state: "SP",
      coordinates: [-23.5613, -46.6565]
    },
    availability: {
      monday: { start: "07:00", end: "17:00" },
      tuesday: { start: "07:00", end: "17:00" },
      wednesday: { start: "07:00", end: "17:00" },
      thursday: { start: "07:00", end: "17:00" },
      friday: { start: "07:00", end: "17:00" },
      saturday: { start: "08:00", end: "16:00" },
      sunday: { start: "09:00", end: "13:00" }
    }
  },
  {
    id: "3",
    name: "Carlos Oliveira",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 4.7,
    reviews: 156,
    distance: "3.2 km",
    isOnline: false,
    specialties: ['Limpeza Comercial', 'Limpeza Industrial', 'Manutenção'],
    experience: '10 anos',
    languages: ['Português', 'Espanhol'],
    responseTime: '3 horas',
    completionRate: 97,
    pricing: {
      hourly: { min: 70, max: 110 },
      daily: { min: 280, max: 480 },
      weekly: { min: 1400, max: 2400 }
    },
    services: [
      {
        name: 'Limpeza Comercial',
        duration: 6,
        price: 420,
        description: 'Limpeza de escritórios e comércios'
      },
      {
        name: 'Limpeza Industrial',
        duration: 8,
        price: 560,
        description: 'Limpeza de galpões e indústrias'
      },
      {
        name: 'Manutenção Preventiva',
        duration: 4,
        price: 280,
        description: 'Manutenção e limpeza preventiva'
      }
    ],
    location: {
      address: "Rua Industrial, 456 - Zona Norte",
      city: "São Paulo",
      state: "SP",
      coordinates: [-23.4733, -46.6228]
    },
    availability: {
      monday: { start: "06:00", end: "16:00" },
      tuesday: { start: "06:00", end: "16:00" },
      wednesday: { start: "06:00", end: "16:00" },
      thursday: { start: "06:00", end: "16:00" },
      friday: { start: "06:00", end: "16:00" },
      saturday: { start: "07:00", end: "15:00" },
      sunday: { start: "08:00", end: "12:00" }
    }
  }
];

// Categorias de serviços
export const SERVICE_CATEGORIES = [
  {
    id: "limpeza-residencial",
    name: "Limpeza Residencial",
    icon: "🏠",
    description: "Limpeza de casas e apartamentos"
  },
  {
    id: "limpeza-comercial",
    name: "Limpeza Comercial", 
    icon: "🏢",
    description: "Limpeza de escritórios e comércios"
  },
  {
    id: "limpeza-industrial",
    name: "Limpeza Industrial",
    icon: "🏭",
    description: "Limpeza de galpões e indústrias"
  },
  {
    id: "organizacao",
    name: "Organização",
    icon: "📦",
    description: "Organização de ambientes e armários"
  },
  {
    id: "limpeza-pos-obra",
    name: "Limpeza Pós-Obra",
    icon: "🔨",
    description: "Limpeza após reformas e construções"
  },
  {
    id: "manutencao",
    name: "Manutenção",
    icon: "🔧",
    description: "Manutenção e limpeza preventiva"
  }
];

// Sugestões de busca
export const SEARCH_SUGGESTIONS = [
  "Limpeza Residencial",
  "Limpeza Comercial", 
  "Limpeza Industrial",
  "Organização",
  "Limpeza Pós-Obra",
  "Manutenção",
  "Limpeza Semanal",
  "Limpeza Premium",
  "Limpeza Básica",
  "Limpeza Completa",
  "João Silva",
  "Maria Santos", 
  "Carlos Oliveira",
  "Limpeza de Escritório",
  "Limpeza de Casa",
  "Organização de Armários",
  "Limpeza de Galpão",
  "Manutenção Preventiva"
];

// Função para buscar profissionais
export const searchProfessionals = (query) => {
  if (!query || query.length < 2) return [];
  
  const lowerQuery = query.toLowerCase();
  
  return PROFESSIONALS_DATA.filter(professional => {
    // Buscar por nome
    if (professional.name.toLowerCase().includes(lowerQuery)) return true;
    
    // Buscar por especialidades
    if (professional.specialties.some(specialty => 
      specialty.toLowerCase().includes(lowerQuery)
    )) return true;
    
    // Buscar por serviços
    if (professional.services.some(service => 
      service.name.toLowerCase().includes(lowerQuery) ||
      service.description.toLowerCase().includes(lowerQuery)
    )) return true;
    
    return false;
  });
};

// Função para obter sugestões baseadas na query
export const getSearchSuggestions = (query) => {
  if (!query || query.length < 1) return SEARCH_SUGGESTIONS.slice(0, 8);
  
  const lowerQuery = query.toLowerCase();
  
  return SEARCH_SUGGESTIONS.filter(suggestion => 
    suggestion.toLowerCase().includes(lowerQuery)
  ).slice(0, 8);
};
