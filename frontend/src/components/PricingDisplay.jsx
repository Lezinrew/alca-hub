// Exibição de Valores Médios - Alça Hub
import React, { useState, useEffect, useMemo } from 'react'
import { DollarSign, TrendingUp, TrendingDown, Star, Clock, Users, Shield, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const PricingDisplay = ({ professional, service, onPriceSelect }) => {
  const [selectedPricing, setSelectedPricing] = useState(null)
  const [pricingHistory, setPricingHistory] = useState([])
  const [marketComparison, setMarketComparison] = useState(null)

  // Dados de preços do profissional
  const pricingData = {
    hourly: {
      min: 80,
      max: 120,
      average: 100,
      currency: 'BRL'
    },
    packages: [
      {
        id: 'basic',
        name: 'Pacote Básico',
        duration: 2,
        price: 160,
        originalPrice: 200,
        discount: 20,
        description: 'Limpeza geral da casa',
        features: ['Limpeza de todos os cômodos', 'Produtos básicos', 'Garantia de 7 dias'],
        popular: false
      },
      {
        id: 'standard',
        name: 'Pacote Padrão',
        duration: 4,
        price: 300,
        originalPrice: 400,
        discount: 25,
        description: 'Limpeza completa com organização',
        features: ['Limpeza profunda', 'Organização', 'Produtos premium', 'Garantia de 14 dias'],
        popular: true
      },
      {
        id: 'premium',
        name: 'Pacote Premium',
        duration: 6,
        price: 420,
        originalPrice: 600,
        discount: 30,
        description: 'Limpeza completa + serviços extras',
        features: ['Limpeza profunda', 'Organização completa', 'Produtos premium', 'Serviços extras', 'Garantia de 30 dias'],
        popular: false
      }
    ],
    addOns: [
      {
        id: 'deep_cleaning',
        name: 'Limpeza Profunda',
        price: 50,
        description: 'Limpeza mais detalhada'
      },
      {
        id: 'organization',
        name: 'Organização',
        price: 80,
        description: 'Organização de ambientes'
      },
      {
        id: 'eco_products',
        name: 'Produtos Ecológicos',
        price: 30,
        description: 'Produtos eco-friendly'
      }
    ]
  }

  // Histórico de preços (simulado)
  const generatePricingHistory = () => {
    const history = []
    const today = new Date()
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(today)
      date.setMonth(today.getMonth() - i)
      
      history.push({
        date: date.toISOString().split('T')[0],
        price: 100 + Math.random() * 20 - 10, // Variação de ±10
        bookings: Math.floor(Math.random() * 20) + 5
      })
    }
    
    return history.reverse()
  }

  // Comparação com o mercado
  const generateMarketComparison = () => {
    return {
      professional: pricingData.hourly.average,
      market: {
        average: 95,
        min: 70,
        max: 150,
        competitors: [
          { name: 'Profissional A', price: 90, rating: 4.5 },
          { name: 'Profissional B', price: 110, rating: 4.8 },
          { name: 'Profissional C', price: 85, rating: 4.3 }
        ]
      },
      savings: 15,
      value: 'excellent'
    }
  }

  useEffect(() => {
    setPricingHistory(generatePricingHistory())
    setMarketComparison(generateMarketComparison())
  }, [])

  // Calcular economia
  const calculateSavings = (packagePrice, originalPrice) => {
    return ((originalPrice - packagePrice) / originalPrice) * 100
  }

  // Selecionar preço
  const handlePriceSelect = (pricing) => {
    setSelectedPricing(pricing)
    onPriceSelect?.(pricing)
  }

  // Renderizar pacotes
  const renderPackages = () => {
    return pricingData.packages.map((pkg) => (
      <motion.div
        key={pkg.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative bg-white border-2 rounded-xl p-6 cursor-pointer transition-all ${
          selectedPricing?.id === pkg.id
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-200 hover:border-gray-300'
        } ${pkg.popular ? 'ring-2 ring-primary-500' : ''}`}
        onClick={() => handlePriceSelect(pkg)}
      >
        {pkg.popular && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
              Mais Popular
            </span>
          </div>
        )}
        
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
          <p className="text-gray-600 text-sm">{pkg.description}</p>
        </div>
        
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-3xl font-bold text-primary-500">
              R$ {pkg.price}
            </span>
            {pkg.originalPrice > pkg.price && (
              <span className="text-lg text-gray-400 line-through">
                R$ {pkg.originalPrice}
              </span>
            )}
          </div>
          {pkg.originalPrice > pkg.price && (
            <div className="flex items-center justify-center gap-1 text-green-600 text-sm">
              <TrendingDown className="w-4 h-4" />
              <span>Economia de {calculateSavings(pkg.price, pkg.originalPrice).toFixed(0)}%</span>
            </div>
          )}
          <div className="text-sm text-gray-500 mt-1">
            {pkg.duration} horas • R$ {(pkg.price / pkg.duration).toFixed(0)}/hora
          </div>
        </div>
        
        <div className="space-y-2 mb-6">
          {pkg.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
        
        <button
          className={`w-full py-3 rounded-lg font-medium transition-colors ${
            selectedPricing?.id === pkg.id
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {selectedPricing?.id === pkg.id ? 'Selecionado' : 'Selecionar'}
        </button>
      </motion.div>
    ))
  }

  // Renderizar add-ons
  const renderAddOns = () => {
    return pricingData.addOns.map((addOn) => (
      <div key={addOn.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h4 className="font-medium text-gray-900">{addOn.name}</h4>
          <p className="text-sm text-gray-600">{addOn.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-primary-500">
            +R$ {addOn.price}
          </span>
          <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
            Adicionar
          </button>
        </div>
      </div>
    ))
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Preços e Pacotes
        </h2>
        <p className="text-gray-600">
          Escolha o pacote que melhor se adequa às suas necessidades
        </p>
      </div>

      {/* Comparação com o Mercado */}
      {marketComparison && (
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Comparação com o Mercado
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-500">
                R$ {marketComparison.professional}
              </div>
              <div className="text-sm text-gray-600">Este Profissional</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700">
                R$ {marketComparison.market.average}
              </div>
              <div className="text-sm text-gray-600">Média do Mercado</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {marketComparison.savings}%
              </div>
              <div className="text-sm text-gray-600">Economia</div>
            </div>
          </div>
        </div>
      )}

      {/* Pacotes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {renderPackages()}
      </div>

      {/* Preço por Hora */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Preço por Hora
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-500">
              R$ {pricingData.hourly.min}
            </div>
            <div className="text-sm text-gray-600">Mínimo</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-500">
              R$ {pricingData.hourly.average}
            </div>
            <div className="text-sm text-gray-600">Médio</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-500">
              R$ {pricingData.hourly.max}
            </div>
            <div className="text-sm text-gray-600">Máximo</div>
          </div>
        </div>
      </div>

      {/* Add-ons */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Serviços Adicionais
        </h3>
        <div className="space-y-3">
          {renderAddOns()}
        </div>
      </div>

      {/* Histórico de Preços */}
      {pricingHistory.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Histórico de Preços
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pricingHistory.slice(0, 6).map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">
                    {new Date(entry.date).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="text-sm text-gray-600">
                    {entry.bookings} agendamentos
                  </div>
                </div>
                <div className="text-lg font-semibold text-primary-500">
                  R$ {entry.price.toFixed(0)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Garantias */}
      <div className="bg-green-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Garantias e Benefícios
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-green-500" />
            <div>
              <div className="font-medium text-gray-900">Garantia de Qualidade</div>
              <div className="text-sm text-gray-600">100% satisfação garantida</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-green-500" />
            <div>
              <div className="font-medium text-gray-900">Pontualidade</div>
              <div className="text-sm text-gray-600">Sempre no horário</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-green-500" />
            <div>
              <div className="font-medium text-gray-900">Profissional Certificado</div>
              <div className="text-sm text-gray-600">Experiência comprovada</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PricingDisplay
