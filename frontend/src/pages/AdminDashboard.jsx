import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useToast } from "../hooks/use-toast";
import { API_URL } from "../lib/config";
import { motion } from "framer-motion";
import DashboardCharts from "../components/admin/DashboardCharts";
import UserManager from "../components/admin/UserManager";
import ServiceManager from "../components/admin/ServiceManager";
import BookingManager from "../components/admin/BookingManager";
import ReportGenerator from "../components/admin/ReportGenerator";

const API = `${API_URL}/api`;

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const { toast } = useToast();

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/admin/stats`);
      setStats(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar estatísticas",
        description: error.response?.data?.detail || "Tente novamente",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const counters = useMemo(() => stats?.counters || {}, [stats]);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100">
        <CardHeader>
          <CardTitle className="text-2xl">Olá, Admin! 👋</CardTitle>
          <CardDescription>Bem-vindo ao painel de controle do Alça Hub</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Usuários", value: counters.total_users, color: "text-indigo-600" },
              { label: "Serviços", value: counters.total_services, color: "text-blue-600" },
              { label: "Agendamentos", value: counters.total_bookings, color: "text-emerald-600" },
              { label: "Avaliações", value: counters.total_reviews, color: "text-orange-600" },
            ].map((item) => (
              <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-500">{item.label}</div>
                    <div className={`text-2xl font-bold ${item.color}`}>{item.value ?? "-"}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <div className="mt-4">
            <Button variant="outline" onClick={load}>Atualizar</Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="visao">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="visao">Visão Geral</TabsTrigger>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="servicos">Serviços</TabsTrigger>
          <TabsTrigger value="agendamentos">Agendamentos</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="visao">
          <DashboardCharts stats={stats} loading={loading} />
        </TabsContent>

        <TabsContent value="usuarios">
          <UserManager />
        </TabsContent>

        <TabsContent value="servicos">
          <ServiceManager />
        </TabsContent>

        <TabsContent value="agendamentos">
          <BookingManager />
        </TabsContent>

        <TabsContent value="relatorios">
          <ReportGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;


