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
      <Button variant="ghost" className="w-full justify-start hover:bg-gray-100 cursor-pointer" onClick={() => go('/conta')}>Conta</Button>
      <Button variant="ghost" className="w-full justify-start hover:bg-gray-100 cursor-pointer" onClick={() => go('/pagamento')}>Pagamento</Button>
      <Button variant="ghost" className="w-full justify-start hover:bg-gray-100 cursor-pointer" onClick={() => go('/seguranca')}>Segurança</Button>
      <Button variant="ghost" className="w-full justify-start hover:bg-gray-100 cursor-pointer" onClick={() => go('/pedidos')}>Meus Pedidos</Button>
    </div>
  );
};

export default SideMenu;


