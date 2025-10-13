import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { useToast } from "../../hooks/use-toast";
import { API_URL } from "../../lib/config";
import { useNavigate } from "react-router-dom";

const API = `${API_URL}/api`;

const emptyUser = {
  email: "",
  password: "",
  cpf: "",
  nome: "",
  telefone: "",
  endereco: "",
  tipo: "morador",
};

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [tipo, setTipo] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyUser);
  const { toast } = useToast();
  const navigate = useNavigate();

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      throw new Error("No token");
    }
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${API}/admin/users`,
        {
          ...getAuthConfig(),
          params: { q: query || undefined, tipo: tipo || undefined },
        }
      );
      setUsers(data.users || []);
    } catch (e) {
      toast({ variant: "destructive", title: "Erro ao carregar usuários" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Redirect if no token
    const t = localStorage.getItem("token");
    if (!t) {
      navigate("/login", { replace: true });
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => users, [users]);

  const createUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/admin/users`, form, getAuthConfig());
      toast({ title: "Usuário criado" });
      setOpen(false);
      setForm(emptyUser);
      load();
    } catch (e) {
      toast({ variant: "destructive", title: e.response?.data?.detail || "Erro ao criar" });
    }
  };

  const updateUser = async (id, payload) => {
    try {
      await axios.put(`${API}/admin/users/${id}`, payload, getAuthConfig());
      toast({ title: "Usuário atualizado" });
      load();
    } catch (e) {
      toast({ variant: "destructive", title: e.response?.data?.detail || "Erro ao atualizar" });
    }
  };

  const removeUser = async (id) => {
    if (!window.confirm("Tem certeza que deseja remover este usuário?")) return;
    try {
      await axios.delete(`${API}/admin/users/${id}`, getAuthConfig());
      toast({ title: "Usuário removido" });
      load();
    } catch (e) {
      toast({ variant: "destructive", title: e.response?.data?.detail || "Erro ao remover" });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-start md:items-end">
          <div className="flex-1 w-full">
            <Label>Buscar</Label>
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="nome, email, CPF" />
          </div>
          <div>
            <Label>Tipo</Label>
            <Select value={tipo || "morador"} onValueChange={setTipo}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Todos" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="morador">Morador</SelectItem>
                <SelectItem value="prestador">Prestador</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={load}>Filtrar</Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Adicionar Usuário</Button>
            </DialogTrigger>
            <DialogContent aria-describedby="new-user-description">
              <DialogHeader>
                <DialogTitle>Novo Usuário</DialogTitle>
                <p id="new-user-description" className="text-sm text-gray-600">
                  Preencha os dados para criar um novo usuário
                </p>
              </DialogHeader>
              <form onSubmit={createUser} className="space-y-3">
                <div>
                  <Label>Nome</Label>
                  <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div>
                  <Label>Senha</Label>
                  <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                </div>
                <div>
                  <Label>CPF</Label>
                  <Input value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Telefone</Label>
                    <Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Endereço</Label>
                    <Input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} required />
                  </div>
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morador">Morador</SelectItem>
                      <SelectItem value="prestador">Prestador</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="submit">Salvar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Carregando...</div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-500">
                  <tr>
                    <th className="p-2">Nome</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">CPF</th>
                    <th className="p-2">Tipo</th>
                    <th className="p-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.id} className="border-t">
                      <td className="p-2">{u.nome}</td>
                      <td className="p-2">{u.email}</td>
                      <td className="p-2">{u.cpf}</td>
                      <td className="p-2">
                        <Select value={u.tipo} onValueChange={(v) => updateUser(u.id, { tipo: v })}>
                          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="morador">Morador</SelectItem>
                            <SelectItem value="prestador">Prestador</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => updateUser(u.id, { ativo: !u.ativo })}>
                            {u.ativo ? "Desativar" : "Ativar"}
                          </Button>
                          <Button variant="destructive" onClick={() => removeUser(u.id)}>Excluir</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManager;


