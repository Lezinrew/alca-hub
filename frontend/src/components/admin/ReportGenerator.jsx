import React, { useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useToast } from "../../hooks/use-toast";
import { API_URL } from "../../lib/config";

const API = `${API_URL}/api`;

const ReportGenerator = () => {
  const [kind, setKind] = useState("users");
  const { toast } = useToast();

  const exportCSV = async () => {
    try {
      const { data } = await axios.get(`${API}/admin/export`, { params: { kind } });
      const blob = new Blob([data.content], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename || `export_${kind}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast({ title: "Exportação concluída" });
    } catch (e) {
      toast({ variant: "destructive", title: e.response?.data?.detail || "Erro ao exportar" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatórios</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row gap-3 items-start md:items-end">
        <div>
          <div className="text-sm text-gray-500 mb-1">Tipo</div>
          <Select value={kind} onValueChange={setKind}>
            <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="users">Usuários</SelectItem>
              <SelectItem value="bookings">Agendamentos</SelectItem>
              <SelectItem value="services">Serviços</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={exportCSV}>Exportar CSV</Button>
      </CardContent>
    </Card>
  );
};

export default ReportGenerator;


