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
  },
  // ELETRICISTA
  {
    id: "3",
    name: "Carlos Eletricista",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 4.7,
    reviews: 156,
    distance: "3.2 km",
    isOnline: true,
    specialties: ['Elétrica', 'Automação Residencial'],
    experience: '8 anos',
    languages: ['Português'],
    responseTime: '30 minutos',
    completionRate: 97,
    pricing: {
      hourly: { min: 120, max: 180 },
      daily: { min: 500, max: 800 },
      weekly: { min: 2500, max: 4000 }
    },
    services: [
      {
        name: 'Instalação Elétrica',
        duration: 4,
        price: 480,
        description: 'Instalação completa de sistema elétrico'
      },
      {
        name: 'Reparo de Tomadas',
        duration: 1,
        price: 120,
        description: 'Reparo e substituição de tomadas'
      },
      {
        name: 'Automação Residencial',
        duration: 6,
        price: 720,
        description: 'Sistema de automação para casa'
      }
    ],
    location: {
      address: "Rua Augusta, 500 - Consolação",
      city: "São Paulo",
      state: "SP",
      coordinates: [-23.5558, -46.6396]
    },
    availability: {
      monday: { start: "08:00", end: "18:00" },
      tuesday: { start: "08:00", end: "18:00" },
      wednesday: { start: "08:00", end: "18:00" },
      thursday: { start: "08:00", end: "18:00" },
      friday: { start: "08:00", end: "18:00" },
      saturday: { start: "08:00", end: "16:00" },
      sunday: { start: "09:00", end: "15:00" }
    }
  },
  // ENCANADOR
  {
    id: "4",
    name: "Pedro Encanador",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    rating: 4.6,
    reviews: 98,
    distance: "2.1 km",
    isOnline: true,
    specialties: ['Hidráulica', 'Reparos'],
    experience: '6 anos',
    languages: ['Português'],
    responseTime: '1 hora',
    completionRate: 95,
    pricing: {
      hourly: { min: 100, max: 150 },
      daily: { min: 400, max: 600 },
      weekly: { min: 2000, max: 3000 }
    },
    services: [
      {
        name: 'Desentupimento',
        duration: 2,
        price: 200,
        description: 'Desentupimento de pias e ralos'
      },
      {
        name: 'Reparo de Torneiras',
        duration: 1,
        price: 100,
        description: 'Reparo e substituição de torneiras'
      },
      {
        name: 'Instalação Hidráulica',
        duration: 4,
        price: 400,
        description: 'Instalação completa de sistema hidráulico'
      }
    ],
    location: {
      address: "Rua Oscar Freire, 800 - Jardins",
      city: "São Paulo",
      state: "SP",
      coordinates: [-23.5676, -46.6734]
    },
    availability: {
      monday: { start: "07:00", end: "17:00" },
      tuesday: { start: "07:00", end: "17:00" },
      wednesday: { start: "07:00", end: "17:00" },
      thursday: { start: "07:00", end: "17:00" },
      friday: { start: "07:00", end: "17:00" },
      saturday: { start: "08:00", end: "15:00" },
      sunday: { start: "09:00", end: "14:00" }
    }
  },
  // JARDINAGEM
  {
    id: "5",
    name: "Ana Jardineira",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    rating: 4.8,
    reviews: 134,
    distance: "4.5 km",
    isOnline: true,
    specialties: ['Jardinagem', 'Paisagismo'],
    experience: '7 anos',
    languages: ['Português', 'Espanhol'],
    responseTime: '2 horas',
    completionRate: 99,
    pricing: {
      hourly: { min: 80, max: 120 },
      daily: { min: 350, max: 500 },
      weekly: { min: 1800, max: 2500 }
    },
    services: [
      {
        name: 'Manutenção de Jardim',
        duration: 3,
        price: 240,
        description: 'Cuidados gerais com plantas e jardim'
      },
      {
        name: 'Paisagismo',
        duration: 6,
        price: 480,
        description: 'Projeto e execução de paisagismo'
      },
      {
        name: 'Poda de Árvores',
        duration: 2,
        price: 160,
        description: 'Poda e manutenção de árvores'
      }
    ],
    location: {
      address: "Rua dos Jardins, 200 - Jardim Europa",
      city: "São Paulo",
      state: "SP",
      coordinates: [-23.5687, -46.6693]
    },
    availability: {
      monday: { start: "08:00", end: "17:00" },
      tuesday: { start: "08:00", end: "17:00" },
      wednesday: { start: "08:00", end: "17:00" },
      thursday: { start: "08:00", end: "17:00" },
      friday: { start: "08:00", end: "17:00" },
      saturday: { start: "08:00", end: "16:00" },
      sunday: { start: "09:00", end: "15:00" }
    }
  },
  // PINTURA
  {
    id: "6",
    name: "Roberto Pintor",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    rating: 4.5,
    reviews: 87,
    distance: "3.8 km",
    isOnline: true,
    specialties: ['Pintura', 'Reformas'],
    experience: '10 anos',
    languages: ['Português'],
    responseTime: '1 hora',
    completionRate: 96,
    pricing: {
      hourly: { min: 90, max: 130 },
      daily: { min: 400, max: 600 },
      weekly: { min: 2000, max: 3500 }
    },
    services: [
      {
        name: 'Pintura de Paredes',
        duration: 4,
        price: 360,
        description: 'Pintura completa de ambientes'
      },
      {
        name: 'Pintura Externa',
        duration: 6,
        price: 540,
        description: 'Pintura de fachadas e áreas externas'
      },
      {
        name: 'Textura e Efeitos',
        duration: 5,
        price: 450,
        description: 'Aplicação de texturas especiais'
      }
    ],
    location: {
      address: "Av. Faria Lima, 1500 - Itaim Bibi",
      city: "São Paulo",
      state: "SP",
      coordinates: [-23.5676, -46.6934]
    },
    availability: {
      monday: { start: "08:00", end: "18:00" },
      tuesday: { start: "08:00", end: "18:00" },
      wednesday: { start: "08:00", end: "18:00" },
      thursday: { start: "08:00", end: "18:00" },
      friday: { start: "08:00", end: "18:00" },
      saturday: { start: "08:00", end: "16:00" },
      sunday: { start: "09:00", end: "15:00" }
    }
  },
  // PISCINAS
  {
    id: "7",
    name: "Lucas Piscineiro",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 4.9,
    reviews: 76,
    distance: "5.2 km",
    isOnline: true,
    specialties: ['Piscinas', 'Manutenção'],
    experience: '4 anos',
    languages: ['Português'],
    responseTime: '2 horas',
    completionRate: 98,
    pricing: {
      hourly: { min: 100, max: 140 },
      daily: { min: 450, max: 650 },
      weekly: { min: 2200, max: 3200 }
    },
    services: [
      {
        name: 'Limpeza de Piscina',
        duration: 2,
        price: 200,
        description: 'Limpeza e tratamento da piscina'
      },
      {
        name: 'Manutenção Completa',
        duration: 4,
        price: 400,
        description: 'Manutenção completa do sistema'
      },
      {
        name: 'Reparo de Filtros',
        duration: 3,
        price: 300,
        description: 'Reparo e manutenção de filtros'
      }
    ],
    location: {
      address: "Rua das Piscinas, 300 - Morumbi",
      city: "São Paulo",
      state: "SP",
      coordinates: [-23.6234, -46.6987]
    },
    availability: {
      monday: { start: "08:00", end: "17:00" },
      tuesday: { start: "08:00", end: "17:00" },
      wednesday: { start: "08:00", end: "17:00" },
      thursday: { start: "08:00", end: "17:00" },
      friday: { start: "08:00", end: "17:00" },
      saturday: { start: "08:00", end: "16:00" },
      sunday: { start: "09:00", end: "15:00" }
    }
  },
  // MANUTENÇÃO
  {
    id: "8",
    name: "Fernando Manutenção",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    rating: 4.7,
    reviews: 112,
    distance: "2.9 km",
    isOnline: true,
    specialties: ['Manutenção', 'Reparos Gerais'],
    experience: '12 anos',
    languages: ['Português'],
    responseTime: '1 hora',
    completionRate: 97,
    pricing: {
      hourly: { min: 110, max: 160 },
      daily: { min: 500, max: 750 },
      weekly: { min: 2500, max: 4000 }
    },
    services: [
      {
        name: 'Manutenção Preventiva',
        duration: 3,
        price: 330,
        description: 'Manutenção preventiva geral'
      },
      {
        name: 'Reparos Emergenciais',
        duration: 2,
        price: 220,
        description: 'Reparos urgentes e emergenciais'
      },
      {
        name: 'Manutenção Completa',
        duration: 6,
        price: 660,
        description: 'Manutenção completa da residência'
      }
    ],
    location: {
      address: "Rua da Manutenção, 450 - Pinheiros",
      city: "São Paulo",
      state: "SP",
      coordinates: [-23.5676, -46.6934]
    },
    availability: {
      monday: { start: "07:00", end: "18:00" },
      tuesday: { start: "07:00", end: "18:00" },
      wednesday: { start: "07:00", end: "18:00" },
      thursday: { start: "07:00", end: "18:00" },
      friday: { start: "07:00", end: "18:00" },
      saturday: { start: "08:00", end: "16:00" },
      sunday: { start: "09:00", end: "15:00" }
    }
  },
  // AR CONDICIONADO
  {
    id: "9",
    name: "Marcos Refrigeração",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    rating: 4.8,
    reviews: 95,
    distance: "3.5 km",
    isOnline: true,
    specialties: ['Climatização', 'Ar Condicionado'],
    experience: '6 anos',
    languages: ['Português'],
    responseTime: '1 hora',
    completionRate: 98,
    pricing: {
      hourly: { min: 120, max: 170 },
      daily: { min: 550, max: 800 },
      weekly: { min: 2800, max: 4200 }
    },
    services: [
      {
        name: 'Instalação de Ar Condicionado',
        duration: 4,
        price: 480,
        description: 'Instalação completa de ar condicionado'
      },
      {
        name: 'Manutenção Preventiva',
        duration: 2,
        price: 240,
        description: 'Manutenção e limpeza de aparelhos'
      },
      {
        name: 'Reparo de Ar Condicionado',
        duration: 3,
        price: 360,
        description: 'Reparo e manutenção de aparelhos'
      }
    ],
    location: {
      address: "Rua da Refrigeração, 600 - Vila Olímpia",
      city: "São Paulo",
      state: "SP",
      coordinates: [-23.5925, -46.6875]
    },
    availability: {
      monday: { start: "08:00", end: "18:00" },
      tuesday: { start: "08:00", end: "18:00" },
      wednesday: { start: "08:00", end: "18:00" },
      thursday: { start: "08:00", end: "18:00" },
      friday: { start: "08:00", end: "18:00" },
      saturday: { start: "08:00", end: "16:00" },
      sunday: { start: "09:00", end: "15:00" }
    }
  },
  // SEGURANÇA
  {
    id: "10",
    name: "Paulo Segurança",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 4.6,
    reviews: 68,
    distance: "4.1 km",
    isOnline: true,
    specialties: ['Segurança', 'Monitoramento'],
    experience: '9 anos',
    languages: ['Português'],
    responseTime: '2 horas',
    completionRate: 95,
    pricing: {
      hourly: { min: 130, max: 180 },
      daily: { min: 600, max: 900 },
      weekly: { min: 3000, max: 4500 }
    },
    services: [
      {
        name: 'Instalação de Câmeras',
        duration: 5,
        price: 650,
        description: 'Instalação de sistema de câmeras'
      },
      {
        name: 'Alarme Residencial',
        duration: 4,
        price: 520,
        description: 'Instalação de sistema de alarme'
      },
      {
        name: 'Monitoramento 24h',
        duration: 8,
        price: 1040,
        description: 'Sistema de monitoramento completo'
      }
    ],
    location: {
      address: "Rua da Segurança, 800 - Brooklin",
      city: "São Paulo",
      state: "SP",
      coordinates: [-23.5925, -46.6875]
    },
    availability: {
      monday: { start: "08:00", end: "18:00" },
      tuesday: { start: "08:00", end: "18:00" },
      wednesday: { start: "08:00", end: "18:00" },
      thursday: { start: "08:00", end: "18:00" },
      friday: { start: "08:00", end: "18:00" },
      saturday: { start: "08:00", end: "16:00" },
      sunday: { start: "09:00", end: "15:00" }
    }
  },
  // INFORMÁTICA
  {
    id: "11",
    name: "Rafael TI",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    rating: 4.9,
    reviews: 143,
    distance: "2.3 km",
    isOnline: true,
    specialties: ['Informática', 'Suporte Técnico'],
    experience: '8 anos',
    languages: ['Português', 'Inglês'],
    responseTime: '30 minutos',
    completionRate: 99,
    pricing: {
      hourly: { min: 100, max: 150 },
      daily: { min: 450, max: 700 },
      weekly: { min: 2300, max: 3500 }
    },
    services: [
      {
        name: 'Suporte Técnico',
        duration: 2,
        price: 200,
        description: 'Suporte técnico completo'
      },
      {
        name: 'Instalação de Software',
        duration: 1,
        price: 100,
        description: 'Instalação e configuração de software'
      },
      {
        name: 'Configuração de Rede',
        duration: 3,
        price: 300,
        description: 'Configuração de rede doméstica'
      }
    ],
    location: {
      address: "Rua da Tecnologia, 700 - Vila Madalena",
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
      saturday: { start: "08:00", end: "16:00" },
      sunday: { start: "09:00", end: "15:00" }
    }
  },
  // MECÂNICO
  {
    id: "12",
    name: "José Mecânico",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    rating: 4.7,
    reviews: 89,
    distance: "3.7 km",
    isOnline: true,
    specialties: ['Mecânico', 'Automotivo'],
    experience: '15 anos',
    languages: ['Português'],
    responseTime: '1 hora',
    completionRate: 96,
    pricing: {
      hourly: { min: 140, max: 200 },
      daily: { min: 650, max: 1000 },
      weekly: { min: 3200, max: 5000 }
    },
    services: [
      {
        name: 'Revisão Completa',
        duration: 4,
        price: 560,
        description: 'Revisão completa do veículo'
      },
      {
        name: 'Troca de Óleo',
        duration: 1,
        price: 140,
        description: 'Troca de óleo e filtros'
      },
      {
        name: 'Reparo de Motor',
        duration: 6,
        price: 840,
        description: 'Reparo e manutenção do motor'
      }
    ],
    location: {
      address: "Rua da Mecânica, 900 - Santo André",
      city: "Santo André",
      state: "SP",
      coordinates: [-23.6637, -46.5382]
    },
    availability: {
      monday: { start: "08:00", end: "18:00" },
      tuesday: { start: "08:00", end: "18:00" },
      wednesday: { start: "08:00", end: "18:00" },
      thursday: { start: "08:00", end: "18:00" },
      friday: { start: "08:00", end: "18:00" },
      saturday: { start: "08:00", end: "16:00" },
      sunday: { start: "09:00", end: "15:00" }
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
    id: "eletricista",
    name: "Eletricista",
    icon: "⚡",
    description: "Instalações e reparos elétricos"
  },
  {
    id: "encanador",
    name: "Encanador",
    icon: "🚰",
    description: "Reparos e instalações hidráulicas"
  },
  {
    id: "jardinagem",
    name: "Jardinagem",
    icon: "🌱",
    description: "Cuidados com jardim e paisagismo"
  },
  {
    id: "pintura",
    name: "Pintura",
    icon: "🎨",
    description: "Pintura residencial e comercial"
  },
  {
    id: "piscinas",
    name: "Piscinas",
    icon: "🏊",
    description: "Manutenção e limpeza de piscinas"
  },
  {
    id: "manutencao",
    name: "Manutenção",
    icon: "🔧",
    description: "Manutenção geral e preventiva"
  },
  {
    id: "ar-condicionado",
    name: "Ar Condicionado",
    icon: "❄️",
    description: "Instalação e manutenção de ar condicionado"
  },
  {
    id: "seguranca",
    name: "Segurança",
    icon: "🔒",
    description: "Sistemas de segurança e monitoramento"
  },
  {
    id: "informatica",
    name: "Informática",
    icon: "💻",
    description: "Suporte técnico e serviços de TI"
  },
  {
    id: "mecanico",
    name: "Mecânico",
    icon: "🚗",
    description: "Mecânica automotiva"
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
