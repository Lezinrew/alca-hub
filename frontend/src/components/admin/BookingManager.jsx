import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useToast } from "../../hooks/use-toast";
import { API_URL } from "../../lib/config";

const API = `${API_URL}/api`;

const BookingManager = () => {
  const [bookings, setBookings] = useState([]);
  const { toast } = useToast();

  const load = async () => {
    try {
      const { data } = await axios.get(`${API}/admin/bookings`);
      setBookings(data.bookings || []);
    } catch (e) {
      toast({ variant: "destructive", title: "Erro ao carregar agendamentos" });
    }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API}/admin/bookings/${id}`, { status });
      toast({ title: "Status atualizado" });
      load();
    } catch (e) {
      toast({ variant: "destructive", title: e.response?.data?.detail || "Erro ao atualizar" });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-gray-500">
                <tr>
                  <th className="p-2">ID</th>
                  <th className="p-2">Morador</th>
                  <th className="p-2">Prestador</th>
                  <th className="p-2">Serviço</th>
                  <th className="p-2">Preço</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Pagamento</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-t">
                    <td className="p-2">{b.id.slice(0, 8)}</td>
                    <td className="p-2">{b.morador_id}</td>
                    <td className="p-2">{b.prestador_id}</td>
                    <td className="p-2">{b.service_id}</td>
                    <td className="p-2">R$ {Number(b.preco_total).toFixed(2)}</td>
                    <td className="p-2">
                      <Select value={b.status} onValueChange={(v) => updateStatus(b.id, v)}>
                        <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendente">Pendente</SelectItem>
                          <SelectItem value="confirmado">Confirmado</SelectItem>
                          <SelectItem value="em_andamento">Em Andamento</SelectItem>
                          <SelectItem value="concluido">Concluído</SelectItem>
                          <SelectItem value="cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-2">{b.payment_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingManager;


