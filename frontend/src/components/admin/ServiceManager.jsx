import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useToast } from "../../hooks/use-toast";
import { API_URL } from "../../lib/config";

const API = `${API_URL}/api`;

const emptyService = {
  prestador_id: "",
  nome: "",
  descricao: "",
  categoria: "",
  preco_por_hora: "",
  disponibilidade: ["segunda", "terca", "quarta", "quinta", "sexta"],
  horario_inicio: "08:00",
  horario_fim: "17:00",
};

const ServiceManager = () => {
  const [services, setServices] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyService);
  const { toast } = useToast();

  const load = async () => {
    try {
      const { data } = await axios.get(`${API}/admin/services`);
      setServices(data.services || []);
    } catch (e) {
      toast({ variant: "destructive", title: "Erro ao carregar serviços" });
    }
  };

  useEffect(() => { load(); }, []);

  const createService = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, preco_por_hora: Number(form.preco_por_hora) };
      await axios.post(`${API}/admin/services`, payload);
      toast({ title: "Serviço criado" });
      setOpen(false);
      setForm(emptyService);
      load();
    } catch (e) {
      toast({ variant: "destructive", title: e.response?.data?.detail || "Erro ao criar" });
    }
  };

  const updateService = async (id, payload) => {
    try {
      await axios.put(`${API}/admin/services/${id}`, payload);
      toast({ title: "Serviço atualizado" });
      load();
    } catch (e) {
      toast({ variant: "destructive", title: e.response?.data?.detail || "Erro ao atualizar" });
    }
  };

  const removeService = async (id) => {
    if (!window.confirm("Tem certeza que deseja remover este serviço?")) return;
    try {
      await axios.delete(`${API}/admin/services/${id}`);
      toast({ title: "Serviço removido" });
      load();
    } catch (e) {
      toast({ variant: "destructive", title: e.response?.data?.detail || "Erro ao remover" });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Serviços</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Novo Serviço</Button>
            </DialogTrigger>
            <DialogContent aria-describedby="new-service-description">
              <DialogHeader>
                <DialogTitle>Novo Serviço</DialogTitle>
                <p id="new-service-description" className="text-sm text-gray-600">
                  Preencha os dados para criar um novo serviço
                </p>
              </DialogHeader>
              <form onSubmit={createService} className="space-y-3">
                <div>
                  <Label>Prestador ID</Label>
                  <Input value={form.prestador_id} onChange={(e) => setForm({ ...form, prestador_id: e.target.value })} required />
                </div>
                <div>
                  <Label>Nome</Label>
                  <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} required />
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Input value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Preço por hora</Label>
                    <Input type="number" step="0.01" value={form.preco_por_hora} onChange={(e) => setForm({ ...form, preco_por_hora: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Disponibilidade (lista)</Label>
                    <Input value={form.disponibilidade.join(",")} onChange={(e) => setForm({ ...form, disponibilidade: e.target.value.split(",") })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Horário Início</Label>
                    <Input value={form.horario_inicio} onChange={(e) => setForm({ ...form, horario_inicio: e.target.value })} />
                  </div>
                  <div>
                    <Label>Horário Fim</Label>
                    <Input value={form.horario_fim} onChange={(e) => setForm({ ...form, horario_fim: e.target.value })} />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Salvar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-gray-500">
                <tr>
                  <th className="p-2">Nome</th>
                  <th className="p-2">Categoria</th>
                  <th className="p-2">Preço/h</th>
                  <th className="p-2">Uso</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="p-2">{s.nome}</td>
                    <td className="p-2">{s.categoria}</td>
                    <td className="p-2">R$ {Number(s.preco_por_hora).toFixed(2)}</td>
                    <td className="p-2">{s.usage_total || 0}</td>
                    <td className="p-2">
                      <Select value={s.status} onValueChange={(v) => updateService(s.id, { status: v })}>
                        <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="disponivel">Disponível</SelectItem>
                          <SelectItem value="indisponivel">Indisponível</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => updateService(s.id, { categoria: s.categoria })}>Editar</Button>
                        <Button variant="destructive" onClick={() => removeService(s.id)}>Excluir</Button>
                      </div>
                    </td>
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

export default ServiceManager;


