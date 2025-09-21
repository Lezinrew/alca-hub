import React from "react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

const SideMenu = ({ onClose }) => {
  const navigate = useNavigate();
  const go = (path) => {
    navigate(path);
    if (onClose) onClose();
  };
  return (
    <div className="mt-4 space-y-2">
      {/* Navegação Principal */}
      <Button variant="ghost" className="w-full justify-start hover:bg-gray-100 cursor-pointer" onClick={() => go('/dashboard')}>
        🏠 Dashboard
      </Button>
      <Button variant="ghost" className="w-full justify-start hover:bg-gray-100 cursor-pointer" onClick={() => go('/busca')}>
        🔍 Buscar Serviços
      </Button>
      <Button variant="ghost" className="w-full justify-start hover:bg-gray-100 cursor-pointer" onClick={() => go('/agendamento')}>
        📋 Novo Agendamento
      </Button>
      
      <hr className="my-2" />
      
      {/* Serviços e Mapa */}
      <Button variant="ghost" className="w-full justify-start hover:bg-gray-100 cursor-pointer" onClick={() => go('/mapa')}>
        🗺️ Mapa
      </Button>
      <Button variant="ghost" className="w-full justify-start hover:bg-gray-100 cursor-pointer" onClick={() => go('/meus-pedidos')}>
        📦 Meus Pedidos
      </Button>
      <Button variant="ghost" className="w-full justify-start hover:bg-gray-100 cursor-pointer" onClick={() => go('/avaliar')}>
        ⭐ Avaliar
      </Button>
      
      <hr className="my-2" />
      
      {/* Configurações da Conta */}
      <Button variant="ghost" className="w-full justify-start hover:bg-gray-100 cursor-pointer" onClick={() => go('/conta')}>
        👤 Conta
      </Button>
    </div>
  );
};

export default SideMenu;


