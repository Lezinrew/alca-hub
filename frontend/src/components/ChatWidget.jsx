// Widget de Chat - Alça Hub
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Phone, Video, MoreVertical, Smile, Paperclip } from 'lucide-react';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const messagesEndRef = useRef(null);

  // Simular dados de chat
  const mockRooms = [
    {
      id: '1',
      name: 'Maria Silva',
      type: 'direct',
      lastMessage: 'Obrigada pelo serviço!',
      lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
      unreadCount: 2,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: '2',
      name: 'João Santos',
      type: 'direct',
      lastMessage: 'Quando posso agendar?',
      lastMessageTime: new Date(Date.now() - 7200000).toISOString(),
      unreadCount: 0,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
    }
  ];

  const mockMessages = [
    {
      id: '1',
      sender_id: 'user1',
      content: 'Olá! Como posso ajudar?',
      type: 'text',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      sender_name: 'Você'
    },
    {
      id: '2',
      sender_id: 'user2',
      content: 'Gostaria de agendar um serviço de limpeza',
      type: 'text',
      created_at: new Date(Date.now() - 3500000).toISOString(),
      sender_name: 'Maria Silva'
    },
    {
      id: '3',
      sender_id: 'user1',
      content: 'Perfeito! Qual dia seria melhor para você?',
      type: 'text',
      created_at: new Date(Date.now() - 3400000).toISOString(),
      sender_name: 'Você'
    }
  ];

  useEffect(() => {
    if (currentRoom) {
      setMessages(mockMessages);
    }
  }, [currentRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now().toString(),
      sender_id: 'user1',
      content: newMessage,
      type: 'text',
      created_at: new Date().toISOString(),
      sender_name: 'Você'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simular resposta
    setTimeout(() => {
      const response = {
        id: (Date.now() + 1).toString(),
        sender_id: 'user2',
        content: 'Obrigada pela resposta!',
        type: 'text',
        created_at: new Date().toISOString(),
        sender_name: currentRoom?.name || 'Usuário'
      };
      setMessages(prev => [...prev, response]);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Botão de chat */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Widget de chat */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-80 h-96 flex flex-col">
          {/* Cabeçalho */}
          <div className="p-4 border-b border-gray-200 bg-blue-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Chat</h3>
                  <p className="text-xs text-blue-100">
                    {currentRoom ? currentRoom.name : 'Selecione uma conversa'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="text-blue-100 hover:text-white">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="text-blue-100 hover:text-white">
                  <Video className="w-4 h-4" />
                </button>
                <button className="text-blue-100 hover:text-white">
                  <MoreVertical className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-blue-100 hover:text-white"
                >
                  ×
                </button>
              </div>
            </div>
          </div>

          {/* Lista de conversas ou mensagens */}
          <div className="flex-1 overflow-hidden">
            {!currentRoom ? (
              // Lista de conversas
              <div className="h-full overflow-y-auto">
                <div className="p-2">
                  <h4 className="text-sm font-medium text-gray-700 px-2 py-1">
                    Conversas Recentes
                  </h4>
                </div>
                {mockRooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => setCurrentRoom(room)}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <img
                          src={room.avatar}
                          alt={room.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-medium text-gray-900 truncate">
                            {room.name}
                          </h5>
                          <span className="text-xs text-gray-500">
                            {formatTime(room.lastMessageTime)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {room.lastMessage}
                        </p>
                      </div>
                      {room.unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {room.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Mensagens
              <div className="h-full flex flex-col">
                {/* Área de mensagens */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_id === 'user1' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg ${
                          message.sender_id === 'user1'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-900 px-3 py-2 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Área de input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <button className="text-gray-400 hover:text-gray-600">
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Digite sua mensagem..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button className="absolute right-2 top-2 text-gray-400 hover:text-gray-600">
                        <Smile className="w-5 h-5" />
                      </button>
                    </div>
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
