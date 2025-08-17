import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";

const colors = ["#6366F1", "#06B6D4", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6"];

const ChartCard = ({ title, children }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent style={{ height: 300 }}>{children}</CardContent>
    </Card>
  </motion.div>
);

const DashboardCharts = ({ stats, loading }) => {
  const userTypesData = stats
    ? [
        { name: "Moradores", value: stats.user_types?.morador || 0 },
        { name: "Prestadores", value: stats.user_types?.prestador || 0 },
        { name: "Admins", value: stats.user_types?.admin || 0 },
      ]
    : [];

  const bookingsByStatus = stats
    ? Object.entries(stats.bookings_by_status || {}).map(([k, v]) => ({ status: k, total: v }))
    : [];

  const servicesPopularity = stats?.services_popularity || [];
  const bookingsPerDay = stats?.bookings_per_day || [];
  const revenuePerDay = stats?.revenue_per_day || [];

  if (loading) {
    return <div className="p-6">Carregando gráficos...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartCard title="Distribuição de Tipos de Usuário">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={userTypesData} dataKey="value" nameKey="name" outerRadius={100} label>
              {userTypesData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <ReTooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Agendamentos por Status">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={bookingsByStatus}>
            <XAxis dataKey="status" />
            <YAxis />
            <Bar dataKey="total" fill="#6366F1" radius={[4, 4, 0, 0]} />
            <ReTooltip />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Serviços Mais Populares">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={servicesPopularity} layout="vertical">
            <XAxis type="number" />
            <YAxis type="category" dataKey="nome" width={120} />
            <Bar dataKey="total" fill="#22C55E" radius={[0, 4, 4, 0]} />
            <ReTooltip />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Agendamentos por Dia (7 dias)">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={bookingsPerDay}>
            <XAxis dataKey="date" />
            <YAxis />
            <Line type="monotone" dataKey="total" stroke="#06B6D4" strokeWidth={2} dot={false} />
            <ReTooltip />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Receita por Dia (30 dias)">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={revenuePerDay}>
            <XAxis dataKey="date" />
            <YAxis />
            <Area type="monotone" dataKey="amount" stroke="#8B5CF6" fill="#EDE9FE" strokeWidth={2} />
            <ReTooltip />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
};

export default DashboardCharts;


