import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { 
  Sprout, 
  MapPin, 
  Calendar, 
  Eye, 
  Plus, 
  AlertCircle, 
  CheckCircle,
  Droplets,
  Thermometer,
  Grid,
  Layers,
  ChevronRight,
  Filter,
  TrendingUp,
  Clock,
  Leaf,
  Search,
  X,
  ChevronLeft
} from "lucide-react";
import EditCultivoModal from "../../components/cultivo/EditCultivoModal";
import AddCultivoModal from "../../components/cultivo/AddCultivoModal";
import {
  getCultivos,
  createCultivo,
  updateCultivo,
  deleteCultivo
} from "../../services/cultivos.service";

export default function CultivosPage({ onOpenCultivo }) {
  const { user } = useAuth();
  const userRole = user?.role;

  const [cultivos, setCultivos] = useState([]);
  const [selectedCultivo, setSelectedCultivo] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedUbicacion, setSelectedUbicacion] = useState("todas");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    const loadCultivos = async () => {
      setLoading(true);
      try {
        const data = await getCultivos();
        setCultivos(Array.isArray(data) ? data : []);
      } catch {
        setCultivos([]);
      } finally {
        setLoading(false);
      }
    };
    loadCultivos();
  }, []);

  useEffect(() => {
    if (selectedCultivo || isAddOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [selectedCultivo, isAddOpen]);

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, message: "", type: "success" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const surcos = useMemo(() => {
    const grouped = {};
    cultivos.forEach(({ ubicacion = "Sin ubicación", ...cultivo }) => {
      if (!grouped[ubicacion]) grouped[ubicacion] = [];
      grouped[ubicacion].push({ ubicacion, ...cultivo });
    });
    return Object.entries(grouped).map(([ubicacion, lista]) => ({
      id: ubicacion,
      nombre: ubicacion,
      cultivos: lista
    }));
  }, [cultivos]);

  const surcosFiltrados = useMemo(() => {
    let filtered = surcos;
    
    if (selectedUbicacion !== "todas") {
      filtered = filtered.filter(surco => surco.nombre === selectedUbicacion);
    }
    
    if (searchTerm) {
      filtered = filtered.map(surco => ({
        ...surco,
        cultivos: surco.cultivos.filter(cultivo => 
          cultivo.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(surco => surco.cultivos.length > 0);
    }
    
    return filtered;
  }, [surcos, selectedUbicacion, searchTerm]);

  const handleCreateCultivo = async (nuevoCultivo) => {
    try {
      const creado = await createCultivo(nuevoCultivo);
      setCultivos(prev => [...prev, creado]);
      setIsAddOpen(false);
      setNotification({
        show: true,
        message: `✅ ¡Cultivo "${creado.nombre}" creado exitosamente!`,
        type: "success"
      });
    } catch (error) {
      console.error("Error creando cultivo:", error);
      setNotification({
        show: true,
        message: `❌ Error al crear el cultivo`,
        type: "error"
      });
    }
  };

  const handleUpdateCultivo = async (id, updatedData) => {
    try {
      const data = await updateCultivo(id, updatedData);
      setCultivos(prev => prev.map(c => c.id === id ? data : c));
      setSelectedCultivo(null);
      setNotification({
        show: true,
        message: `✏️ Cultivo "${data.nombre}" actualizado correctamente`,
        type: "success"
      });
    } catch (err) {
      console.error("Error actualizando cultivo:", err);
      setNotification({
        show: true,
        message: `❌ Error al actualizar el cultivo`,
        type: "error"
      });
    }
  };

  const handleDeleteCultivo = async (id) => {
    try {
      const cultivoEliminado = cultivos.find(c => c.id === id);
      await deleteCultivo(id);
      setCultivos(prev => prev.filter(c => c.id !== id));
      setSelectedCultivo(null);
      setNotification({
        show: true,
        message: `🗑️ Cultivo "${cultivoEliminado?.nombre || 'desconocido'}" eliminado correctamente`,
        type: "success"
      });
    } catch (err) {
      console.error("Error eliminando cultivo:", err);
      setNotification({
        show: true,
        message: `❌ Error al eliminar el cultivo`,
        type: "error"
      });
    }
  };

  const getEstadoColor = (estado) => {
    const colores = {
      activo: "bg-emerald-100 text-emerald-700 border-emerald-200",
      inactivo: "bg-gray-100 text-gray-600 border-gray-200",
      alerta: "bg-red-100 text-red-700 border-red-200",
      saludable: "bg-green-100 text-green-700 border-green-200",
      cosechado: "bg-amber-100 text-amber-700 border-amber-200",
      perdido: "bg-red-100 text-red-700 border-red-200"
    };
    return colores[estado?.toLowerCase()] || "bg-gray-100 text-gray-600 border-gray-200";
  };

  const getEstadoIcon = (estado) => {
    if (estado?.toLowerCase() === "alerta") return <AlertCircle size={12} className="sm:w-3.5 sm:h-3.5 text-red-600" />;
    if (estado?.toLowerCase() === "saludable" || estado?.toLowerCase() === "activo") return <CheckCircle size={12} className="sm:w-3.5 sm:h-3.5 text-green-600" />;
    return null;
  };

  const totalActivos = cultivos.filter(c => c.estado?.toLowerCase() === "activo" || c.estado?.toLowerCase() === "saludable").length;
  const totalAlertas = cultivos.filter(c => c.estado?.toLowerCase() === "alerta").length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-gray-200 border-t-[#8B6F47] rounded-full animate-spin"></div>
          <Sprout size={20} className="sm:w-6 sm:h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#8B6F47] animate-pulse" />
        </div>
        <p className="mt-4 text-gray-500 text-sm sm:text-base">Cargando cultivos...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 sm:space-y-8 relative">
      {notification.show && (
        <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[10000] animate-in slide-in-from-top-2 fade-in duration-300 max-w-[calc(100%-2rem)] sm:max-w-md">
          <div className={`rounded-lg shadow-lg p-3 sm:p-4 flex items-center gap-2 sm:gap-3 ${
            notification.type === "success" 
              ? "bg-green-50 border-l-4 border-green-500" 
              : "bg-red-50 border-l-4 border-red-500"
          }`}>
            <div className="flex-shrink-0">
              {notification.type === "success" ? (
                <CheckCircle size={16} className="sm:w-5 sm:h-5 text-green-500" />
              ) : (
                <AlertCircle size={16} className="sm:w-5 sm:h-5 text-red-500" />
              )}
            </div>
            <div className="flex-1">
              <p className={`text-xs sm:text-sm font-medium ${
                notification.type === "success" ? "text-green-800" : "text-red-800"
              }`}>
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => setNotification({ show: false, message: "", type: "success" })}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <X size={14} className="sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#8B6F47] to-[#6b5436] rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
            <Sprout size={20} className="sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Mis Cultivos
            </h1>
            <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <Grid size={12} className="sm:w-3.5 sm:h-3.5" />
              Gestiona tus cultivos
            </p>
          </div>
        </div>
        
        <button
          className="bg-gradient-to-r from-[#8B6F47] to-[#6b5436] hover:from-[#7a5f3c] hover:to-[#5a4530] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-1.5 sm:gap-2"
          onClick={() => setIsAddOpen(true)}
        >
          <Plus size={14} className="sm:w-4.5 sm:h-4.5" />
          <span>Nuevo cultivo</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-5 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] sm:text-sm text-gray-400 mb-0.5 sm:mb-1">Total cultivos</p>
              <p className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">{cultivos.length}</p>
            </div>
            <div className="p-1.5 sm:p-3 bg-gradient-to-br from-[#8B6F47]/10 to-[#8B6F47]/5 rounded-lg sm:rounded-xl group-hover:scale-110 transition-all">
              <Sprout size={14} className="sm:w-5 sm:h-5 text-[#8B6F47]" />
            </div>
          </div>
          <p className="text-[9px] sm:text-xs text-gray-400 mt-1 sm:mt-2 flex items-center gap-1">
            <TrendingUp size={8} className="sm:w-2.5 sm:h-2.5" />
            Registrados
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-5 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] sm:text-sm text-gray-400 mb-0.5 sm:mb-1">Ubicaciones</p>
              <p className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">{surcos.length}</p>
            </div>
            <div className="p-1.5 sm:p-3 bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-lg sm:rounded-xl group-hover:scale-110 transition-all">
              <MapPin size={14} className="sm:w-5 sm:h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-[9px] sm:text-xs text-gray-400 mt-1 sm:mt-2 flex items-center gap-1">
            <Layers size={8} className="sm:w-2.5 sm:h-2.5" />
            Zonas activas
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-5 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] sm:text-sm text-gray-400 mb-0.5 sm:mb-1">Activos</p>
              <p className="text-xl sm:text-3xl font-bold text-green-600">{totalActivos}</p>
            </div>
            <div className="p-1.5 sm:p-3 bg-gradient-to-br from-green-50 to-green-100/30 rounded-lg sm:rounded-xl group-hover:scale-110 transition-all">
              <CheckCircle size={14} className="sm:w-5 sm:h-5 text-green-600" />
            </div>
          </div>
          <p className="text-[9px] sm:text-xs text-gray-400 mt-1 sm:mt-2 flex items-center gap-1">
            <Leaf size={8} className="sm:w-2.5 sm:h-2.5" />
            En buen estado
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-5 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] sm:text-sm text-gray-400 mb-0.5 sm:mb-1">Alertas</p>
              <p className={`text-xl sm:text-3xl font-bold ${totalAlertas > 0 ? 'text-red-600' : 'text-gray-800'}`}>
                {totalAlertas}
              </p>
            </div>
            <div className={`p-1.5 sm:p-3 rounded-lg sm:rounded-xl transition-all group-hover:scale-110 ${totalAlertas > 0 ? 'bg-gradient-to-br from-red-50 to-red-100/30' : 'bg-gray-50'}`}>
              <AlertCircle size={14} className={`sm:w-5 sm:h-5 ${totalAlertas > 0 ? 'text-red-600' : 'text-gray-400'}`} />
            </div>
          </div>
          <p className="text-[9px] sm:text-xs text-gray-400 mt-1 sm:mt-2 flex items-center gap-1">
            <Clock size={8} className="sm:w-2.5 sm:h-2.5" />
            Requieren atención
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Filter size={14} className="sm:w-4 sm:h-4 text-[#8B6F47]" />
            <h3 className="text-xs sm:text-sm font-semibold text-gray-700">Filtros</h3>
          </div>
          
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-400 hover:text-red-500"
            >
              <X size={10} className="sm:w-3 sm:h-3" />
              Limpiar búsqueda
            </button>
          )}
        </div>

        <div className="relative mb-4">
          <Search size={14} className="sm:w-4.5 sm:h-4.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar cultivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B6F47]/20 focus:border-[#8B6F47] transition-all bg-white"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <button
            onClick={() => setSelectedUbicacion("todas")}
            className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-sm font-medium whitespace-nowrap transition-all ${
              selectedUbicacion === "todas"
                ? "bg-gradient-to-r from-[#8B6F47] to-[#6b5436] text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Todas
          </button>
          {surcos.map(surco => (
            <button
              key={surco.id}
              onClick={() => setSelectedUbicacion(surco.nombre)}
              className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-sm font-medium whitespace-nowrap transition-all ${
                selectedUbicacion === surco.nombre
                  ? "bg-gradient-to-r from-[#8B6F47] to-[#6b5436] text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {surco.nombre}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {surcosFiltrados.map(({ id, nombre, cultivos }, index) => (
          <section 
            key={id} 
            className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[#fffaf8] via-[#fbefe1] to-transparent px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-white rounded-lg shadow-md">
                  <MapPin size={14} className="sm:w-4.5 sm:h-4.5 text-[#8B6F47]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm sm:text-lg font-semibold text-gray-800 truncate">{nombre}</h2>
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <Layers size={10} className="sm:w-3 sm:h-3" />
                    {cultivos.length} cultivo{cultivos.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-[10px] sm:text-xs bg-gradient-to-r from-emerald-50 to-emerald-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-emerald-700 font-medium whitespace-nowrap">
                    {cultivos.filter(c => c.estado?.toLowerCase() === "activo" || c.estado?.toLowerCase() === "saludable").length} activos
                  </span>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <ChevronRight size={12} className="sm:w-4 sm:h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {cultivos.map((cultivo, idx) => (
                  <div
                    key={cultivo.id || idx}
                    className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden hover:border-[#8B6F47]/40 hover:-translate-y-1 sm:hover:-translate-y-2 cursor-pointer"
                    onClick={() => setSelectedCultivo(cultivo)}
                  >
                    <div className="h-32 sm:h-44 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
                      {cultivo.imagen ? (
                        <>
                          <img
                            src={
                              cultivo.imagen.startsWith('http') && !cultivo.imagen.includes('localhost:3000')
                                ? cultivo.imagen 
                                : `${import.meta.env.VITE_API_URL}${cultivo.imagen.replace('http://localhost:3000', '').replace(/\\/g, '/').startsWith('/') ? '' : '/'}${cultivo.imagen.replace('http://localhost:3000', '').replace(/\\/g, '/')}`
                            }
                            alt={cultivo.nombre}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/400x300?text=Cultivo+sin+imagen";
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </>
                      ) : (
                        <div className="relative">
                          <Sprout size={40} className="sm:w-14 sm:h-14 text-[#8B6F47]/30 group-hover:scale-110 transition-transform duration-500" />
                        </div>
                      )}
                      
                      <div className={`absolute top-2 right-2 sm:top-3 sm:right-3 px-1.5 sm:px-2.5 py-0.5 sm:py-1.5 rounded-full text-[9px] sm:text-xs font-medium border shadow-lg backdrop-blur-sm bg-opacity-95 ${getEstadoColor(cultivo.estado)} flex items-center gap-1`}>
                        {getEstadoIcon(cultivo.estado)}
                        <span className="capitalize">{cultivo.estado}</span>
                      </div>

                      {cultivo.fechaSiembra && (
                        <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-black/60 backdrop-blur-md rounded-lg text-[9px] sm:text-xs text-white flex items-center gap-0.5 sm:gap-1">
                          <Calendar size={8} className="sm:w-2.5 sm:h-2.5" />
                          {new Date(cultivo.fechaSiembra).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                        </div>
                      )}
                    </div>

                    <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                      <div>
                        <h3 className="font-semibold text-gray-800 group-hover:text-[#8B6F47] transition-colors text-sm sm:text-base truncate">
                          {cultivo.nombre}
                        </h3>
                        <div className="flex items-center gap-2 sm:gap-4 mt-2 sm:mt-3">
                          <div className="flex-1 bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-100 rounded-lg px-2 sm:px-2.5 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)]">
                            <div className="p-1 sm:p-1.5 bg-white rounded-md shadow-sm">
                               <Droplets size={12} className="sm:w-3.5 sm:h-3.5 text-blue-500" />
                            </div>
                            <div className="flex flex-col">
                               <span className="text-[8px] sm:text-[9px] font-bold text-blue-400 uppercase tracking-wider leading-none">Humedad</span>
                               <span className="text-[10px] sm:text-xs font-bold text-blue-700 leading-tight block mt-0.5">{cultivo.humedad || '45%'}</span>
                            </div>
                          </div>

                          <div className="flex-1 bg-gradient-to-r from-orange-50 to-orange-100/50 border border-orange-100 rounded-lg px-2 sm:px-2.5 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)]">
                            <div className="p-1 sm:p-1.5 bg-white rounded-md shadow-sm">
                               <Thermometer size={12} className="sm:w-3.5 sm:h-3.5 text-orange-500" />
                            </div>
                            <div className="flex flex-col">
                               <span className="text-[8px] sm:text-[9px] font-bold text-orange-400 uppercase tracking-wider leading-none">Temp.</span>
                               <span className="text-[10px] sm:text-xs font-bold text-orange-700 leading-tight block mt-0.5">{cultivo.temperatura || '24°C'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        className="w-full bg-gradient-to-r from-gray-50 to-gray-100 hover:from-[#8B6F47] hover:to-[#7a5f3c] text-gray-600 hover:text-white py-1.5 sm:py-2.5 rounded-lg text-[10px] sm:text-xs font-medium transition-all duration-300 border border-gray-200 hover:border-transparent flex items-center justify-center gap-1.5 sm:gap-2 group/btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenCultivo(cultivo);
                        }}
                      >
                        <Eye size={10} className="sm:w-3.5 sm:h-3.5" />
                        <span>Ver bitácora</span>
                        <ChevronRight size={10} className="sm:w-3.5 sm:h-3.5 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}

        {!surcosFiltrados.length && surcos.length > 0 && (
          <div className="text-center py-16 sm:py-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Search size={36} className="sm:w-12 sm:h-12 text-amber-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-700 mb-1 sm:mb-2">No se encontraron cultivos</h2>
            <p className="text-gray-400 text-xs sm:text-sm">
              {searchTerm ? `No hay cultivos que coincidan con "${searchTerm}"` : "No hay cultivos en esta ubicación"}
            </p>
            {(searchTerm || selectedUbicacion !== "todas") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedUbicacion("todas");
                }}
                className="mt-4 sm:mt-6 inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-[#8B6F47] text-white rounded-lg sm:rounded-xl text-xs sm:text-sm hover:bg-[#7a5f3c]"
              >
                <ChevronLeft size={12} className="sm:w-4 sm:h-4" />
                Limpiar filtros
              </button>
            )}
          </div>
        )}

        {!surcos.length && (
          <div className="text-center py-16 sm:py-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 sm:w-28 sm:h-28 bg-gradient-to-br from-[#8B6F47]/20 to-[#8B6F47]/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Sprout size={40} className="sm:w-14 sm:h-14 text-[#8B6F47]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-700 mb-1 sm:mb-2">¡Bienvenido a tu huerto digital!</h2>
            <p className="text-gray-400 text-xs sm:text-sm mb-6 sm:mb-8 max-w-xs sm:max-w-md mx-auto px-4">
              Comienza añadiendo tu primer cultivo al sistema
            </p>
            <button
              onClick={() => setIsAddOpen(true)}
              className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#8B6F47] to-[#6b5436] text-white rounded-lg sm:rounded-xl hover:shadow-xl transition-all text-sm sm:text-base font-medium"
            >
              <Plus size={16} className="sm:w-5 sm:h-5" />
              Añadir mi primer cultivo
            </button>
          </div>
        )}
      </div>

      <EditCultivoModal
        isOpen={!!selectedCultivo}
        onClose={() => setSelectedCultivo(null)}
        cultivo={selectedCultivo}
        onSave={handleUpdateCultivo}
        onDelete={handleDeleteCultivo}
        userRole={userRole}
      />

      <AddCultivoModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={handleCreateCultivo}
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
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .animate-slideUp {
          animation: slideUp 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}