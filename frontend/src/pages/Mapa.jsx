import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../lib/config";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { MapPin, Users } from "lucide-react";

const API = `${API_URL}/api`;

export default function Mapa() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [coords, setCoords] = useState(null);

  const fetchProviders = async (latitude, longitude) => {
    try {
      setLoading(true);
      setError(false);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token ausente");
      }
      const { data } = await axios.get(`${API}/map/providers-nearby`, {
        params: { latitude, longitude, radius_km: 10 },
        headers: { Authorization: `Bearer ${token}` },
      });
      setProviders(Array.isArray(data?.providers) ? data.providers : []);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const requestGeolocation = () => {
    setError(false);
    if (!navigator.geolocation) {
      setError(true);
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ latitude, longitude });
        fetchProviders(latitude, longitude);
      },
      () => {
        setError(true);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    requestGeolocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <p>🔄 Carregando mapa...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-3">
        <p>❌ Erro ao carregar mapa.</p>
        <Button onClick={requestGeolocation} className="cursor-pointer">Tentar novamente</Button>
      </div>
    );
  }

  if (!providers || providers.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 text-gray-700">
          <MapPin className="h-5 w-5 text-indigo-600" />
          <p>📍 Nenhum prestador encontrado próximo a você.</p>
        </div>
        <div className="mt-3">
          <Button variant="outline" onClick={requestGeolocation} className="cursor-pointer hover:bg-gray-100">Recarregar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Mapa dos Prestadores</h1>
      {coords && (
        <p className="text-sm text-gray-500">Sua localização: {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}</p>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {providers.map((p) => (
          <Card key={p.provider_id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600" />
                {p.nome || "Prestador"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-700 space-y-1">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{p.distance_km} km • ~{p.estimated_time_min} min</span>
                </div>
                <div className="mt-2">
                  <p className="font-medium mb-1">Serviços:</p>
                  <ul className="list-disc list-inside text-gray-700">
                    {(p.services || []).map((s) => (
                      <li key={s.id}>{s.nome} — R$ {Number(s.preco_por_hora).toFixed(2)}/h</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


