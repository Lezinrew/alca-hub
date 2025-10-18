import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Send, 
  Phone, 
  Video, 
  MoreVertical,
  Paperclip,
  Smile,
  User,
  Clock,
  Check,
  CheckCheck
} from 'lucide-react';

const ProviderMessages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de dados
    const loadConversations = async () => {
      setIsLoading(true);
      
      setTimeout(() => {
        setConversations([
          {
            id: 1,
            client: {
              name: 'Maria Silva',
              avatar: '/images/avatar1.jpg',
              status: 'online'
            },
            lastMessage: 'Obrigada pelo excelente trabalho!',
            timestamp: '10:30',
            unread: 0,
            service: 'Limpeza Residencial'
          },
          {
            id: 2,
            client: {
              name: 'João Santos',
              avatar: '/images/avatar2.jpg',
              status: 'offline'
            },
            lastMessage: 'Gostaria de agendar um serviço...',
            timestamp: '09:15',
            unread: 2,
            service: 'Manutenção Elétrica'
          },
          {
            id: 3,
            client: {
              name: 'Ana Costa',
              avatar: '/images/avatar3.jpg',
              status: 'online'
            },
            lastMessage: 'Quando você pode vir?',
            timestamp: '08:45',
            unread: 1,
            service: 'Pintura'
          },
          {
            id: 4,
            client: {
              name: 'Carlos Oliveira',
              avatar: '/images/avatar4.jpg',
              status: 'offline'
            },
            lastMessage: 'Perfeito, combinado!',
            timestamp: 'Ontem',
            unread: 0,
            service: 'Jardinagem'
          }
        ]);

        // Selecionar primeira conversa
        if (conversations.length > 0) {
          setSelectedConversation(conversations[0]);
        }

        setIsLoading(false);
      }, 1000);
    };

    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      // Simular carregamento de mensagens
      setMessages([
        {
          id: 1,
          sender: 'client',
          content: 'Olá! Gostaria de agendar um serviço de limpeza.',
          timestamp: '10:00',
          status: 'read'
        },
        {
          id: 2,
          sender: 'provider',
          content: 'Olá Maria! Claro, quando você gostaria de agendar?',
          timestamp: '10:02',
          status: 'read'
        },
        {
          id: 3,
          sender: 'client',
          content: 'Que tal na próxima segunda-feira às 14h?',
          timestamp: '10:05',
          status: 'read'
        },
        {
          id: 4,
          sender: 'provider',
          content: 'Perfeito! Vou confirmar o agendamento. O endereço é o mesmo?',
          timestamp: '10:07',
          status: 'read'
        },
        {
          id: 5,
          sender: 'client',
          content: 'Sim, mesmo endereço. Obrigada!',
          timestamp: '10:10',
          status: 'read'
        },
        {
          id: 6,
          sender: 'provider',
          content: 'De nada! Até segunda-feira então.',
          timestamp: '10:12',
          status: 'read'
        }
      ]);
    }
  }, [selectedConversation]);

  const filteredConversations = conversations.filter(conversation =>
    conversation.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        sender: 'provider',
        content: newMessage,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        status: 'sent'
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const ConversationItem = ({ conversation, isSelected, onClick }) => (
    <div
      onClick={onClick}
      className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
        isSelected ? 'bg-blue-50 border-blue-200' : ''
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-500" />
          </div>
          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
            conversation.client.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
          }`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {conversation.client.name}
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">{conversation.timestamp}</span>
              {conversation.unread > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                  {conversation.unread}
                </span>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
          <p className="text-xs text-gray-500">{conversation.service}</p>
        </div>
      </div>
    </div>
  );

  const MessageBubble = ({ message }) => (
    <div className={`flex ${message.sender === 'provider' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        message.sender === 'provider'
          ? 'bg-blue-600 text-white'
          : 'bg-gray-200 text-gray-900'
      }`}>
        <p className="text-sm">{message.content}</p>
        <div className={`flex items-center justify-end mt-1 space-x-1 ${
          message.sender === 'provider' ? 'text-blue-100' : 'text-gray-500'
        }`}>
          <span className="text-xs">{message.timestamp}</span>
          {message.sender === 'provider' && (
            <div className="flex items-center">
              {message.status === 'read' ? (
                <CheckCheck className="w-3 h-3" />
              ) : message.status === 'sent' ? (
                <Check className="w-3 h-3" />
              ) : (
                <Clock className="w-3 h-3" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando mensagens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Mensagens
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex h-96">
            {/* Conversations List */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              {/* Search */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar conversas..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    isSelected={selectedConversation?.id === conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                  />
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-500" />
                          </div>
                          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                            selectedConversation.client.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {selectedConversation.client.name}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {selectedConversation.service}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                          <Phone className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                          <Video className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                    {messages.map((message) => (
                      <MessageBubble key={message.id} message={message} />
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Paperclip className="w-4 h-4" />
                      </button>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Digite sua mensagem..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                      </div>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Smile className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleSendMessage}
                        className="p-2 text-blue-600 hover:text-blue-700"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Selecione uma conversa
                    </h3>
                    <p className="text-gray-600">
                      Escolha uma conversa para começar a conversar
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderMessages;
