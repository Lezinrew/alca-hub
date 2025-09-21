import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Home, MessageCircle, User, Settings, HelpCircle, Check, Plus, Minus, Star, Shield, Percent, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MobileBookingFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState('limpeza-padrao');
  const [homeType, setHomeType] = useState('apartamento');
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(2);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [frequency, setFrequency] = useState('semanal');
  const [totalPrice, setTotalPrice] = useState(98);

  const services = [
    {
      id: 'limpeza-padrao',
      name: 'Limpeza padrão',
      icon: '🧹',
      price: 98,
      hours: 4
    },
    {
      id: 'limpeza-pesada',
      name: 'Limpeza pesada',
      icon: '🪣',
      price: 150,
      hours: 6
    },
    {
      id: 'passar-roupa',
      name: 'Passar roupa',
      icon: '👔',
      price: 80,
      hours: 3
    }
  ];

  const homeTypes = [
    { id: 'studio', name: 'Studio' },
    { id: 'apartamento', name: 'Apartamento' },
    { id: 'casa', name: 'Casa' }
  ];

  const optionalItems = [
    { id: 'geladeira', name: 'Interior da geladeira', price: 15 },
    { id: 'janelas', name: 'Interior de janelas', price: 20 },
    { id: 'armario', name: 'Int. de armário de cozinha', price: 25 },
    { id: 'aspirador', name: 'Aspirar Tapete ou Estofado', price: 30 },
    { id: 'area-externa', name: 'Área externa (até 20m²)', price: 40 },
    { id: 'passadoria', name: 'Passadoria de roupas - 2h adicionais', price: 50 },
    { id: 'lavar-roupas', name: 'Lavar Roupas', price: 35 }
  ];

  const frequencies = [
    { id: 'unica', name: 'Diária única', discount: 0 },
    { id: 'semanal', name: 'Toda semana', discount: 20, recommended: true },
    { id: 'quinzenal', name: 'Toda quinzena', discount: 15 }
  ];

  const benefits = [
    'Convide um Profissional Preferencial',
    'Profissionais com seguro contra acidentes pessoais',
    'Economize até 20% por serviço',
    'Assistência Residencial Completa'
  ];

  const handleServiceSelect = (serviceId) => {
    setSelectedService(serviceId);
    const service = services.find(s => s.id === serviceId);
    setTotalPrice(service.price);
  };

  const handleOptionToggle = (optionId) => {
    setSelectedOptions(prev => {
      if (prev.includes(optionId)) {
        return prev.filter(id => id !== optionId);
      } else {
        return [...prev, optionId];
      }
    });
  };

  const handleFrequencySelect = (freqId) => {
    setFrequency(freqId);
    const freq = frequencies.find(f => f.id === freqId);
    const basePrice = services.find(s => s.id === selectedService)?.price || 98;
    const discount = (basePrice * freq.discount) / 100;
    setTotalPrice(basePrice - discount);
  };

  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Escolha um serviço</h2>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {services.map((service) => (
          <motion.button
            key={service.id}
            onClick={() => handleServiceSelect(service.id)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedService === service.id
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-4">
              <div className="text-2xl">{service.icon}</div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-gray-900">{service.name}</h3>
                <p className="text-sm text-gray-600">{service.hours} horas de serviço</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">R$ {service.price}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="text-center">
        <button className="text-blue-600 text-sm underline">O que está incluso?</button>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Como é seu lar?</h3>
        <p className="text-sm text-gray-600">
          O tipo de residência e número de cômodos são informados aos profissionais.
        </p>
        
        <div className="grid grid-cols-3 gap-2">
          {homeTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setHomeType(type.id)}
              className={`p-3 rounded-lg border-2 transition-all ${
                homeType === type.id
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {type.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <h4 className="font-medium text-gray-900 mb-2">Quartos</h4>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setBedrooms(Math.max(0, bedrooms - 1))}
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-xl font-bold">{bedrooms}</span>
              <button
                onClick={() => setBedrooms(bedrooms + 1)}
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="text-center">
            <h4 className="font-medium text-gray-900 mb-2">Banheiros</h4>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setBathrooms(Math.max(0, bathrooms - 1))}
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-xl font-bold">{bathrooms}</span>
              <button
                onClick={() => setBathrooms(bathrooms + 1)}
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Cozinha e sala já estão inclusos.</strong> Adicione banheiros para lavabos e mais quartos para outros ambientes.
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Itens opcionais</h2>
        <p className="text-sm text-gray-600">Personalize o serviço diário com itens opcionais</p>
      </div>

      <div className="space-y-3">
        {optionalItems.map((item) => (
          <motion.label
            key={item.id}
            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedOptions.includes(item.id)}
                onChange={() => handleOptionToggle(item.id)}
                className="w-5 h-5 text-green-600 rounded"
              />
              <span className="font-medium text-gray-900">{item.name}</span>
            </div>
            <span className="text-green-600 font-semibold">+R$ {item.price}</span>
          </motion.label>
        ))}
      </div>

      <div className="text-center">
        <button className="text-blue-600 text-sm underline">O que está incluso?</button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Qual a frequência das diárias</h2>
      </div>

      <div className="bg-green-100 p-4 rounded-lg">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-green-700" />
          </div>
          <div>
            <h3 className="font-semibold text-green-800">Agende limpeza semanal ou quinzenal</h3>
            <p className="text-sm text-green-700">Profissionais especializados</p>
          </div>
        </div>
        <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium">
          Conheça o Benefício
        </button>
      </div>

      <div className="space-y-3">
        {frequencies.map((freq) => (
          <motion.button
            key={freq.id}
            onClick={() => handleFrequencySelect(freq.id)}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              frequency === freq.id
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{freq.name}</h3>
                {freq.recommended && (
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-1">
                    RECOMENDADO
                  </span>
                )}
              </div>
              {freq.discount > 0 && (
                <div className="text-right">
                  <p className="text-green-600 font-semibold">-{freq.discount}%</p>
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-3">Benefícios:</h4>
        <ul className="space-y-2">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              {benefit}
            </li>
          ))}
        </ul>
        <button className="text-blue-600 text-sm underline mt-3">Saiba mais</button>
      </div>

      <div className="border-t pt-4">
        <button className="text-blue-600 text-sm underline">Política de Cancelamento</button>
        <button className="text-blue-600 text-sm underline ml-4">Detalhes</button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Confirme seus dados</h2>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Serviço:</span>
          <span className="font-semibold">{services.find(s => s.id === selectedService)?.name}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Tipo de residência:</span>
          <span className="font-semibold">{homeTypes.find(h => h.id === homeType)?.name}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Quartos:</span>
          <span className="font-semibold">{bedrooms}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Banheiros:</span>
          <span className="font-semibold">{bathrooms}</span>
        </div>
        
        {selectedOptions.length > 0 && (
          <div>
            <span className="text-gray-600">Itens opcionais:</span>
            <ul className="mt-2 space-y-1">
              {selectedOptions.map(optionId => {
                const option = optionalItems.find(o => o.id === optionId);
                return (
                  <li key={optionId} className="text-sm text-gray-700">
                    • {option?.name} (+R$ {option?.price})
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Frequência:</span>
          <span className="font-semibold">{frequencies.find(f => f.id === frequency)?.name}</span>
        </div>
      </div>

      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900">Total:</span>
          <span className="text-2xl font-bold text-green-600">R$ {totalPrice}</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">Por {services.find(s => s.id === selectedService)?.hours} horas de serviço</p>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Escolha um profissional</h2>
        <p className="text-sm text-gray-600">Selecione um profissional disponível</p>
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((index) => (
          <motion.div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-4"
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Profissional {index}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">4.8 (120 avaliações)</span>
                </div>
                <p className="text-sm text-gray-600">Disponível hoje</p>
              </div>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium">
                Selecionar
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Agendamento confirmado!</h2>
        <p className="text-sm text-gray-600">Seu serviço foi agendado com sucesso</p>
      </div>

      <div className="bg-green-50 p-6 rounded-lg text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-green-800 mb-2">Agendamento Confirmado</h3>
        <p className="text-sm text-green-700">
          Você receberá uma confirmação por email e SMS
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Data:</span>
          <span className="font-semibold">Hoje, 14:00</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Profissional:</span>
          <span className="font-semibold">Maria Silva</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Total:</span>
          <span className="font-semibold text-green-600">R$ {totalPrice}</span>
        </div>
      </div>

      <div className="space-y-3">
        <button className="w-full bg-green-600 text-white py-3 rounded-lg font-medium">
          Ver Detalhes do Agendamento
        </button>
        <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium">
          Agendar Outro Serviço
        </button>
      </div>
    </div>
  );

  const getStepTitle = () => {
    const titles = {
      1: 'Contrate em poucos cliques',
      2: 'Personalize o serviço conforme suas necessidades',
      3: 'Escolha a frequência que melhor lhe atende!',
      4: 'Confirme seus dados',
      5: 'Escolha um profissional',
      6: 'Agendamento confirmado!'
    };
    return titles[currentStep];
  };

  const getStepColor = () => {
    const colors = {
      1: 'bg-purple-600',
      2: 'bg-blue-600',
      3: 'bg-green-600',
      4: 'bg-orange-600',
      5: 'bg-indigo-600',
      6: 'bg-green-600'
    };
    return colors[currentStep];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className={`${getStepColor()} text-white p-4`}>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-semibold">{getStepTitle()}</h1>
          {currentStep > 1 && (
            <button
              onClick={prevStep}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="bg-white/20 rounded-lg px-3 py-1">
            <span className="text-sm font-medium">R$ {totalPrice} por {services.find(s => s.id === selectedService)?.hours} horas de serviço</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span className="text-sm">{currentStep}/6</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
            {currentStep === 6 && renderStep6()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      {currentStep < 6 && (
        <div className="p-4">
          <button
            onClick={nextStep}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium"
          >
            Continuar
          </button>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex items-center justify-around py-2">
          <button className="flex flex-col items-center gap-1 p-2">
            <Home className="w-5 h-5 text-gray-600" />
            <span className="text-xs text-gray-600">Início</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2">
            <MessageCircle className="w-5 h-5 text-gray-600" />
            <span className="text-xs text-gray-600">Chat</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 relative">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs text-green-600 font-medium">Contratar</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2">
            <Settings className="w-5 h-5 text-gray-600" />
            <span className="text-xs text-gray-600">Serviços</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2">
            <HelpCircle className="w-5 h-5 text-gray-600" />
            <span className="text-xs text-gray-600">Suporte</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileBookingFlow;
