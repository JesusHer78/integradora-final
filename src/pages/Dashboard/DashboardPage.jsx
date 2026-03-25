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
  const [cultivosPorTipo, setCultivosPorTipo] = useState([]);
  const [actividadesPendientes, setActividadesPendientes] = useState([]);
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
            sub: isAdmin ? "Registrados en el sistema" : "Tus cultivos actuales",
            icon: <Sprout size={22} />,
            bgColor: "bg-gradient-to-br from-amber-50 to-amber-100/30",
            iconBg: "bg-gradient-to-br from-[#8B6F47]/20 to-[#8B6F47]/10",
            iconColor: "text-[#8B6F47]",
            trend: isAdmin ? "+12%" : null,
            trendUp: true
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

        const conteoTipos = {};
        data.forEach(c => {
          const tipo = c.tipo || "Sin tipo";
          conteoTipos[tipo] = (conteoTipos[tipo] || 0) + 1;
        });

        setCultivosPorTipo(Object.entries(conteoTipos).map(([tipo, total]) => ({ tipo, total })));

        const actividades = [
          { id: 1, tarea: "Riego programado - Zona Norte", fecha: "Hoy, 10:00 AM", completada: false, prioridad: "alta" },
          { id: 2, tarea: "Fertilización - Cultivo de maíz", fecha: "Mañana, 8:30 AM", completada: false, prioridad: "media" },
          { id: 3, tarea: "Control de plagas", fecha: "15 Mar, 2:00 PM", completada: false, prioridad: "alta" },
          { id: 4, tarea: "Cosecha - Tomates", fecha: "18 Mar, 9:00 AM", completada: false, prioridad: "baja" },
        ];
        setActividadesPendientes(actividades);

      } catch (err) {
        setError("Error al cargar los datos del dashboard");
        console.error("Error cargando dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCultivos();
  }, [isAdmin]);

  const completarActividad = (id) => {
    setActividadesPendientes(prev =>
      prev.map(act =>
        act.id === id ? { ...act, completada: true } : act
      )
    );
  };

  const getPrioridadColor = (prioridad) => {
    const colors = {
      alta: "bg-red-100 text-red-700 border-red-200",
      media: "bg-amber-100 text-amber-700 border-amber-200",
      baja: "bg-green-100 text-green-700 border-green-200"
    };
    return colors[prioridad] || "bg-gray-100 text-gray-600";
  };

  const maxTipo = cultivosPorTipo.length ? Math.max(...cultivosPorTipo.map(t => t.total)) : 1;

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
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 animate-fadeIn">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#8B6F47] to-[#6b5436] rounded-xl flex items-center justify-center shadow-lg">
          <BarChart3 size={18} className="sm:w-5.5 sm:h-5.5 text-white" />
        </div>
        <div>
          <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Panel de Control
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-400 mt-1 flex items-center gap-1">
            <Activity size={12} className="sm:w-3.5 sm:h-3.5" />
            Bienvenido a tu resumen agrícola
          </p>
        </div>
      </div>

      {/* KPI Section */}
      <section className="grid grid-cols-1 gap-4 sm:gap-6">
        {kpis.map((kpi, idx) => (
          <div 
            key={kpi.title} 
            className={`${kpi.bgColor} rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500 transform hover:scale-[1.01] animate-slideUp`}
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1 sm:space-y-2">
                <p className="text-[10px] sm:text-sm text-gray-500 font-medium uppercase tracking-wider">{kpi.title}</p>
                <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  {kpi.value}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1">
                    <Activity size={10} className="sm:w-3 sm:h-3" />
                    {kpi.sub}
                  </p>
                  {kpi.trend && (
                    <span className={`text-[10px] sm:text-xs font-bold flex items-center gap-0.5 ${kpi.trendUp ? 'text-green-500' : 'text-red-500'}`}>
                      {kpi.trendUp ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                      {kpi.trend}
                    </span>
                  )}
                </div>
              </div>
              <div className={`${kpi.iconBg} p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-110 hover:rotate-6`}>
                <div className={kpi.iconColor}>{kpi.icon}</div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Main Content Grid */}
      <section className={`grid grid-cols-1 ${isAdmin ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-4 sm:gap-6`}>
        {/* Mapa de Cultivos - Expande si no es Admin */}
        <div className={`${isAdmin ? 'lg:col-span-2' : 'lg:col-span-1'} bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-500 animate-slideUp`}>
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h3 className="text-sm sm:text-base font-semibold flex items-center gap-2 text-gray-800">
              <div className="p-1.5 bg-[#8B6F47]/10 rounded-lg">
                <MapPin size={16} className="sm:w-4.5 sm:h-4.5 text-[#8B6F47]" />
              </div>
              Mapa de cultivos
            </h3>
            <span className="text-[10px] sm:text-xs text-[#8B6F47] bg-[#8B6F47]/10 px-2 sm:px-3 py-1 rounded-full font-medium">
              {zonasCultivo.length} activos
            </span>
          </div>
          <div className={`grid grid-cols-2 ${isAdmin ? 'sm:grid-cols-3 md:grid-cols-4' : 'sm:grid-cols-2'} gap-3 sm:gap-4`}>
            {zonasCultivo.slice(0, 8).map((zone, idx) => (
              <div 
                key={zone.id} 
                className={`relative p-3 sm:p-4 rounded-xl text-center transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                  zone.status === 'alert' 
                    ? 'bg-gradient-to-br from-red-50 to-red-100/30 border border-red-100 hover:shadow-lg' 
                    : 'bg-gradient-to-br from-gray-50 to-gray-100/30 border border-gray-100 hover:shadow-lg'
                }`}
                onMouseEnter={() => setHoveredZone(zone.id)}
                onMouseLeave={() => setHoveredZone(null)}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Sprout size={14} className={zone.status === 'alert' ? 'text-red-500 animate-pulse' : 'text-[#8B6F47]'} />
                  <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">{zone.name}</p>
                </div>
                <p className="text-[9px] sm:text-[10px] text-gray-400 truncate">{zone.lugar}</p>
                {zone.humedad !== "—" && (
                  <div className={`flex items-center justify-center gap-2 mt-2 sm:mt-3 text-[10px] transition-all duration-300 ${hoveredZone === zone.id ? 'opacity-100' : 'opacity-70'}`}>
                    <div className="flex items-center gap-1">
                      <Droplets size={10} className="text-blue-400" />
                      <span className="text-gray-600">{zone.humedad}</span>
                    </div>
                    <div className="w-px h-2 sm:h-3 bg-gray-200"></div>
                    <div className="flex items-center gap-1">
                      <Thermometer size={10} className="text-orange-400" />
                      <span className="text-gray-600">{zone.temp}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {zonasCultivo.length === 0 && (
              <div className="col-span-full py-8 text-center text-gray-400 text-xs italic">
                No hay cultivos registrados
              </div>
            )}
          </div>
        </div>

        {/* Pronóstico - Siempre Visible */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-500 animate-slideUp">
          <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-gray-800">
            <div className="p-1.5 bg-[#8B6F47]/10 rounded-lg">
              <CloudSun size={16} className="sm:w-4.5 sm:h-4.5 text-[#8B6F47]" />
            </div>
            Pronóstico Regional
          </h3>
          <div className="space-y-2 sm:space-y-3">
            {pronostico.map((day, idx) => (
              <div 
                key={day.day} 
                className="flex justify-between items-center py-1.5 sm:py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 px-2 rounded-lg transition-all duration-300"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <span className="text-xs sm:text-sm font-medium text-gray-600 w-8">{day.day}</span>
                <div className="flex gap-2 items-center">{day.icon}</div>
                <div className="flex items-center gap-2 lg:gap-3">
                  <span className="text-[10px] sm:text-sm text-gray-400">{day.min}°</span>
                  <div className="w-8 sm:w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                      style={{ width: `${((day.max - 15) / 20) * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] sm:text-sm font-bold text-gray-700">{day.temp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Row 2: Secondary Info */}
      <section className={`grid grid-cols-1 ${isAdmin ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-4 sm:gap-6`}>
        {/* Recientes - Expande */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-500 animate-slideUp">
          <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-gray-800">
            <div className="p-1.5 bg-[#8B6F47]/10 rounded-lg">
              <TrendingUp size={16} className="sm:w-4.5 sm:h-4.5 text-[#8B6F47]" />
            </div>
            Últimos Registros
          </h3>
          <div className="space-y-2 sm:space-y-3">
            {cultivosRecientes.map((c, idx) => (
              <div 
                key={c.id} 
                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-all duration-300 transform hover:translate-x-1"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#8B6F47]/40"></div>
                <p className="text-xs sm:text-sm text-gray-700 font-medium truncate">{c.nombre}</p>
              </div>
            ))}
            {cultivosRecientes.length === 0 && (
              <p className="text-center text-[10px] text-gray-400 py-4 italic">No hay registros recientes</p>
            )}
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-500 animate-slideUp">
          <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-gray-800">
            <div className="p-1.5 bg-[#8B6F47]/10 rounded-lg">
              <Activity size={16} className="sm:w-4.5 sm:h-4.5 text-[#8B6F47]" />
            </div>
            Bitácora Rápida
          </h3>
          <div className="space-y-2 sm:space-y-3">
            {actividad.map((a, idx) => (
              <div 
                key={a.id} 
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-all duration-300"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <p className="text-xs sm:text-sm text-gray-600 truncate mr-2">{a.text}</p>
                <span className="text-[9px] sm:text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-medium">{a.date}</span>
              </div>
            ))}
             {actividad.length === 0 && (
              <p className="text-center text-[10px] text-gray-400 py-4 italic">Sin actividad registrada</p>
            )}
          </div>
        </div>

        {/* Distribución - Solo ADMIN */}
        {isAdmin && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-500 animate-slideUp">
            <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-gray-800">
              <div className="p-1.5 bg-[#8B6F47]/10 rounded-lg">
                <Gauge size={16} className="sm:w-4.5 sm:h-4.5 text-[#8B6F47]" />
              </div>
              Distribución por tipo
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {cultivosPorTipo.map((t, idx) => (
                <div 
                  key={t.tipo} 
                  className="group"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex justify-between items-center gap-2 mb-1.5">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">{t.tipo}</span>
                    <span className="text-xs sm:text-sm font-bold text-[#8B6F47]">{t.total}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 sm:h-2 overflow-hidden shadow-inner">
                    <div 
                      style={{ width: `${(t.total / maxTipo) * 100}%` }} 
                      className="h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-[#8B6F47] to-[#9b7f57] group-hover:scale-y-110"
                    />
                  </div>
                </div>
              ))}
              {cultivosPorTipo.length === 0 && (
                <p className="text-center text-[10px] text-gray-400 py-4 italic">No hay datos disponibles</p>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Row 3: Admin Only Actions */}
      {isAdmin && (
        <section className="grid md:grid-cols-2 gap-4 sm:gap-6 pb-4 sm:pb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-500 animate-slideUp">
            <h3 className="text-sm sm:text-base font-semibold flex items-center gap-2 mb-4 sm:mb-5 text-gray-800">
              <div className="p-1.5 bg-[#8B6F47]/10 rounded-lg">
                <Calendar size={16} className="sm:w-4.5 sm:h-4.5 text-[#8B6F47]" />
              </div>
              Próximas Actividades
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {actividadesPendientes.filter(act => !act.completada).map((act, idx) => (
                <div 
                  key={act.id} 
                  className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent rounded-xl transition-all duration-300 transform hover:translate-x-1 border border-transparent hover:border-gray-50"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#8B6F47]/5 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Sprout size={16} className="text-[#8B6F47]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[11px] sm:text-sm font-semibold text-gray-700 truncate">{act.tarea}</p>
                      <span className={`text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-tighter ${getPrioridadColor(act.prioridad)}`}>
                        {act.prioridad}
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1 mt-1 font-medium">
                      <Clock size={10} />
                      {act.fecha}
                    </p>
                  </div>
                  <button
                    onClick={() => completarActividad(act.id)}
                    className="p-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-xs bg-gray-50 hover:bg-[#8B6F47] text-gray-400 hover:text-white rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <Check size={14} className="sm:hidden" />
                    <span className="hidden sm:inline">Completar</span>
                  </button>
                </div>
              ))}
              {actividadesPendientes.filter(act => !act.completada).length === 0 && (
                <div className="text-center py-6 sm:py-8 animate-fadeIn">
                  <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Check size={20} className="text-green-500" />
                  </div>
                  <p className="text-xs text-gray-500 font-semibold">¡Todo al día!</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-500 animate-slideUp">
            <h3 className="text-sm sm:text-base font-semibold flex items-center gap-2 mb-4 sm:mb-5 text-gray-800">
              <div className="p-1.5 bg-green-50 rounded-lg">
                <Check size={16} className="sm:w-4.5 sm:h-4.5 text-green-600" />
              </div>
              Actividades Completadas
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {actividadesPendientes.filter(act => act.completada).map((act, idx) => (
                <div 
                  key={act.id} 
                  className="flex items-center gap-3 p-2.5 sm:p-3 bg-gray-50/50 rounded-xl transition-all duration-300"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-50 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Check size={16} className="text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] sm:text-sm font-medium text-gray-400 line-through truncate">{act.tarea}</p>
                    <p className="text-[10px] sm:text-xs text-gray-300 flex items-center gap-1 mt-0.5">
                      <Calendar size={10} />
                      {act.fecha}
                    </p>
                  </div>
                </div>
              ))}
              {actividadesPendientes.filter(act => act.completada).length === 0 && (
                <div className="text-center py-6 sm:py-10">
                  <p className="text-[10px] sm:text-xs text-gray-400 italic">No hay historial</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

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
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn { 
          animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
        }
        .animate-slideUp {
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}