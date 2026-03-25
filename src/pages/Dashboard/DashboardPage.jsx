import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Sprout,
  AlertCircle,
  Droplets,
  CloudSun,
  CloudRain,
  Sun,
  Thermometer,
  TrendingUp,
  Calendar,
  MapPin,
  Leaf,
  BarChart3,
  Activity,
  Check,
  Wind,
  Gauge,
  ArrowUp,
  ArrowDown,
  Clock,
  X
} from "lucide-react";

import AddCultivoModal from "../../components/cultivo/AddCultivoModal";

const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  if (!res.ok) throw new Error("Error en la petición");
  return res.json();
};

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [showAddModal, setShowAddModal] = useState(false);
  const [kpis, setKpis] = useState([]);
  const [zonasCultivo, setZonasCultivo] = useState([]);
  const [actividad, setActividad] = useState([]);
  const [cultivosRecientes, setCultivosRecientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredZone, setHoveredZone] = useState(null);

  const pronostico = [
    { day: "Lun", icon: <Sun size={20} className="text-amber-500" />, temp: "24°", max: 26, min: 18 },
    { day: "Mar", icon: <CloudSun size={20} className="text-stone-500" />, temp: "22°", max: 24, min: 16 },
    { day: "Mié", icon: <CloudRain size={20} className="text-stone-500" />, temp: "20°", max: 22, min: 15 },
    { day: "Jue", icon: <Sun size={20} className="text-amber-500" />, temp: "23°", max: 25, min: 17 },
    { day: "Vie", icon: <Sun size={20} className="text-amber-500" />, temp: "25°", max: 27, min: 19 }
  ];

  useEffect(() => {
    const fetchCultivos = async () => {
      setLoading(true);
      setError(null);
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const data = await fetchWithAuth(`${API_URL}/api/cultivos`);

        setKpis([
          {
            title: "Total de cultivos",
            value: data.length,
            sub: isAdmin ? "Resumen global del huerto" : "Tus cultivos actuales",
            icon: <Sprout size={22} />,
            bgColor: "bg-gradient-to-br from-amber-50 to-amber-100/30",
            iconBg: "bg-gradient-to-br from-[#8B6F47]/20 to-[#8B6F47]/10",
            iconColor: "text-[#8B6F47]"
          }
        ]);

        const zonas = data.map(c => ({
          id: c.id,
          name: c.nombre,
          lugar: c.ubicacion || "Sin ubicación",
          humedad: c.humedad ? `${c.humedad}%` : "—",
          humedadValue: c.humedad || 0,
          temp: c.temperatura ? `${c.temperatura}°C` : "—",
          tempValue: c.temperatura || 0,
          status: (c.humedad ?? 0) < 60 || (c.temperatura ?? 0) > 30 ? "alert" : "ok"
        }));

        setZonasCultivo(zonas);

        const recientes = [...data]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        setCultivosRecientes(recientes);

        setActividad(
          recientes.map(c => ({
            id: c.id,
            text: `Se registró "${c.nombre}"`,
            date: new Date(c.createdAt).toLocaleDateString('es-MX', {
              day: 'numeric',
              month: 'short'
            })
          }))
        );

      } catch (err) {
        setError("Error al cargar los datos del dashboard");
        console.error("Error cargando dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCultivos();
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-gray-200 border-t-[#8B6F47] rounded-full animate-spin"></div>
          <Sprout size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#8B6F47] animate-pulse" />
        </div>
        <p className="mt-4 text-gray-500 animate-pulse">Cargando dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center animate-bounce">
          <AlertCircle size={40} className="text-red-500" />
        </div>
        <p className="mt-4 text-red-500 font-medium">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2.5 bg-gradient-to-r from-[#8B6F47] to-[#6b5436] text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#8B6F47] to-[#6b5436] rounded-xl flex items-center justify-center shadow-lg transform rotate-2 hover:rotate-0 transition-all">
          <BarChart3 size={18} className="sm:w-5.5 sm:h-5.5 text-white" />
        </div>
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-gray-800">
            Panel de Control
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-400 mt-1 flex items-center gap-1 font-medium">
            <Activity size={12} className="sm:w-3.5 sm:h-3.5" />
            Resumen diario del huerto
          </p>
        </div>
      </div>

      {/* KPI Section - Simplificado para Admin y User */}
      <section className="grid grid-cols-1 gap-4 sm:gap-6">
        {kpis.map((kpi, idx) => (
          <div 
            key={kpi.title} 
            className={`${kpi.bgColor} rounded-[24px] p-5 sm:p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500 transform hover:scale-[1.01]`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1 sm:space-y-2">
                <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-widest">{kpi.title}</p>
                <p className="text-4xl sm:text-5xl font-black text-gray-800">
                  {kpi.value}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1 font-medium">
                  <Activity size={10} className="sm:w-3.5 sm:h-3.5" />
                  {kpi.sub}
                </p>
              </div>
              <div className={`${kpi.iconBg} p-3 sm:p-4 rounded-2xl transition-all duration-300 shadow-inner`}>
                <div className={kpi.iconColor}>{kpi.icon}</div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Grid Principal - Ajustado para ocupar el espacio visual */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 pb-6">
        {/* Mapa de Cultivos */}
        <div className="bg-white rounded-[24px] border border-gray-100 p-5 sm:p-7 shadow-sm hover:shadow-xl transition-all duration-500">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm sm:text-base font-bold flex items-center gap-2 text-gray-800">
              <div className="p-1.5 bg-[#8B6F47]/10 rounded-lg">
                <MapPin size={16} className="text-[#8B6F47]" />
              </div>
              Mapa de cultivos
            </h3>
            <span className="text-[10px] sm:text-xs text-[#8B6F47] bg-[#8B6F47]/10 px-3 py-1 rounded-full font-bold">
              {zonasCultivo.length} activos
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {zonasCultivo.slice(0, 9).map((zone, idx) => (
              <div 
                key={zone.id} 
                className={`relative p-3 rounded-xl border transition-all duration-300 cursor-pointer transform hover:scale-[1.03] ${
                  zone.status === 'alert' 
                    ? 'bg-red-50/30 border-red-100 hover:shadow-lg' 
                    : 'bg-gray-50/30 border-gray-100 hover:shadow-lg'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <Sprout size={14} className={zone.status === 'alert' ? 'text-red-500 animate-pulse' : 'text-[#8B6F47]'} />
                  <p className="text-xs font-bold text-gray-700 truncate">{zone.name}</p>
                </div>
                <div className="flex items-center justify-center gap-3 text-[10px] font-bold text-gray-500">
                  <div className="flex items-center gap-1">
                    <Droplets size={10} className="text-blue-400" /> {zone.humedad}
                  </div>
                  <div className="flex items-center gap-1">
                    <Thermometer size={10} className="text-orange-400" /> {zone.temp}
                  </div>
                </div>
              </div>
            ))}
             {zonasCultivo.length === 0 && (
              <div className="col-span-full py-10 text-center text-gray-400 text-xs italic">
                Sin cultivos en el mapa
              </div>
            )}
          </div>
        </div>

        {/* Pronóstico Regional */}
        <div className="bg-white rounded-[24px] border border-gray-100 p-5 sm:p-7 shadow-sm hover:shadow-xl transition-all duration-500">
          <h3 className="text-sm sm:text-base font-bold mb-6 flex items-center gap-2 text-gray-800">
            <div className="p-1.5 bg-[#8B6F47]/10 rounded-lg">
              <CloudSun size={16} className="text-[#8B6F47]" />
            </div>
            Pronóstico de Tlaxcala
          </h3>
          <div className="space-y-3 sm:space-y-4">
            {pronostico.map((day, idx) => (
              <div 
                key={day.day} 
                className="flex justify-between items-center py-2 px-3 hover:bg-gray-50/80 rounded-xl transition-all"
              >
                <span className="text-xs sm:text-sm font-bold text-gray-500 w-10 uppercase">{day.day}</span>
                <div className="flex gap-2 items-center">{day.icon}</div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="text-[11px] sm:text-xs text-gray-400 font-bold">{day.min}°</span>
                  <div className="w-12 sm:w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
                      style={{ width: `${((day.max - 15) / 20) * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] sm:text-sm font-black text-gray-700">{day.temp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Últimos Registros */}
        <div className="bg-white rounded-[24px] border border-gray-100 p-5 sm:p-7 shadow-sm hover:shadow-xl transition-all duration-500">
          <h3 className="text-sm sm:text-base font-bold mb-6 flex items-center gap-2 text-gray-800">
            <div className="p-1.5 bg-[#8B6F47]/10 rounded-lg">
              <TrendingUp size={16} className="text-[#8B6F47]" />
            </div>
            Últimos Ingresos
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cultivosRecientes.map((c, idx) => (
              <div 
                key={c.id} 
                className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl border border-transparent hover:border-[#8B6F47]/20 transition-all hover:translate-x-1"
              >
                <div className="w-2 h-2 rounded-full bg-[#8B6F47]"></div>
                <p className="text-xs sm:text-sm text-gray-700 font-bold truncate">{c.nombre}</p>
              </div>
            ))}
             {cultivosRecientes.length === 0 && (
              <p className="col-span-full py-4 text-center text-gray-400 text-xs italic">No hay registros</p>
            )}
          </div>
        </div>

        {/* Bitácora Rápida */}
        <div className="bg-white rounded-[24px] border border-gray-100 p-5 sm:p-7 shadow-sm hover:shadow-xl transition-all duration-500">
          <h3 className="text-sm sm:text-base font-bold mb-6 flex items-center gap-2 text-gray-800">
            <div className="p-1.5 bg-[#8B6F47]/10 rounded-lg">
              <Activity size={16} className="text-[#8B6F47]" />
            </div>
            Actividad Histórica
          </h3>
          <div className="space-y-3">
            {actividad.map((a, idx) => (
              <div 
                key={a.id} 
                className="flex items-center justify-between p-3 bg-transparent hover:bg-[#8B6F47]/5 rounded-xl transition-all"
              >
                <p className="text-xs text-gray-600 font-bold truncate mr-3">{a.text}</p>
                <span className="text-[9px] font-black text-gray-400 bg-white px-3 py-1 rounded-full uppercase border border-gray-100">{a.date}</span>
              </div>
            ))}
             {actividad.length === 0 && (
              <p className="text-center text-[10px] text-gray-400 py-4 italic">Sin historial reciente</p>
            )}
          </div>
        </div>
      </section>

      <AddCultivoModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={() => window.location.reload()}
      />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn { 
          animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
        }
      `}</style>
    </div>
  );
}