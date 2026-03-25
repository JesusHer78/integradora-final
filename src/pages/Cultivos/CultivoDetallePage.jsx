import { useState, useEffect } from "react";
import { getReportesByCultivo, createReporte } from "../../services/reportes.service";
import AddReporteModal from "../../components/cultivo/AddReporteModal";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Droplets, 
  FileText,
  Clock,
  Image as ImageIcon,
  Sprout,
  Plus,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Wind,
  Search,
  X
} from "lucide-react";

export default function CultivoDetallePage({ cultivo, onBack }) {
  const [reportes, setReportes] = useState([]);
  const [isReporteOpen, setIsReporteOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    if (isReporteOpen) {
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
  }, [isReporteOpen]);

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, message: "", type: "success" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  if (!cultivo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-4 sm:p-8">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#8B6F47]/20 to-[#8B6F47]/10 rounded-full flex items-center justify-center mb-4 sm:mb-6">
          <ImageIcon size={32} className="sm:w-10 sm:h-10 text-[#8B6F47]" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-700 mb-2">No hay cultivo seleccionado</h2>
        <p className="text-gray-500 text-sm sm:text-base mb-4 sm:mb-6">Selecciona un cultivo para ver su información detallada</p>
        <button
          onClick={onBack}
          className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#8B6F47] to-[#6b5436] text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
        >
          <ArrowLeft size={16} className="sm:w-4.5 sm:h-4.5" />
          Volver a cultivos
        </button>
      </div>
    );
  }

  useEffect(() => {
    const loadReportes = async () => {
      setLoading(true);
      try {
        const data = await getReportesByCultivo(cultivo.id);
        setReportes(data);
      } catch (error) {
        console.error("Error cargando reportes", error);
      } finally {
        setLoading(false);
      }
    };
    loadReportes();
  }, [cultivo]);

  const handleCreateReporte = async (formData) => {
    try {
      const nuevo = await createReporte(formData);
      setReportes(prev => [nuevo, ...prev]);
      setIsReporteOpen(false);
      setNotification({
        show: true,
        message: `✅ Reporte "${nuevo.titulo}" registrado exitosamente`,
        type: "success"
      });
    } catch (error) {
      console.error("Error creando reporte", error);
      setNotification({
        show: true,
        message: `❌ Error al registrar el reporte`,
        type: "error"
      });
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatDateShort = (date) =>
    new Date(date).toLocaleDateString("es-MX", {
      month: "short",
      day: "numeric",
    });

  const getEstadoStyles = (estado) => {
    const styles = {
      activo: "bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200",
      inactivo: "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 border-gray-200",
      cosechado: "bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-200",
      perdido: "bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-200",
      alerta: "bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-200",
      saludable: "bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200"
    };
    return styles[estado?.toLowerCase()] || styles.activo;
  };

  const getEstadoIcon = (estado) => {
    if (estado?.toLowerCase() === "alerta") return <AlertCircle size={14} className="sm:w-4 sm:h-4 text-red-600" />;
    if (estado?.toLowerCase() === "saludable" || estado?.toLowerCase() === "activo") return <CheckCircle size={14} className="sm:w-4 sm:h-4 text-green-600" />;
    return <Sprout size={14} className="sm:w-4 sm:h-4 text-[#8B6F47]" />;
  };

  const filteredReportes = reportes.filter(reporte =>
    reporte.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reporte.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const diasDesdeSiembra = Math.floor((new Date() - new Date(cultivo.fechaSiembra)) / (1000 * 60 * 60 * 24));
  const reportesSemana = reportes.filter(r => new Date(r.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-gray-200 border-t-[#8B6F47] rounded-full animate-spin"></div>
          <Sprout size={20} className="sm:w-6 sm:h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#8B6F47] animate-pulse" />
        </div>
        <p className="mt-4 text-gray-500 text-sm sm:text-base">Cargando información del cultivo...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8 relative">
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

      <button
        onClick={onBack}
        className="group mb-2 flex items-center gap-1.5 sm:gap-2 text-gray-500 hover:text-[#8B6F47] transition-all duration-300"
      >
        <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gray-100 group-hover:bg-[#8B6F47]/10 transition-all duration-300">
          <ArrowLeft size={14} className="sm:w-4.5 sm:h-4.5 group-hover:text-[#8B6F47] group-hover:translate-x-[-2px] transition-all duration-300" />
        </div>
        <span className="text-xs sm:text-sm font-medium">Regresar a cultivos</span>
      </button>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-4 sm:p-6 md:p-8 overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B6F47] via-[#b5956a] to-[#8B6F47]"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#8B6F47] to-[#6b5436] rounded-xl flex items-center justify-center shadow-lg">
              {getEstadoIcon(cultivo.estado)}
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-0.5 sm:mb-1">
                {cultivo.nombre}
              </h1>
              <p className="text-[11px] sm:text-sm text-gray-400 flex items-center gap-1">
                <Clock size={12} className="sm:w-3.5 sm:h-3.5" />
                Creado el {formatDate(cultivo.createdAt || new Date())}
              </p>
            </div>
          </div>
          <span className={`px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-[11px] sm:text-sm font-medium border shadow-md flex items-center gap-1.5 sm:gap-2 self-start sm:self-auto ${getEstadoStyles(cultivo.estado)}`}>
            {getEstadoIcon(cultivo.estado)}
            <span className="capitalize">{cultivo.estado || "activo"}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-1">
          {cultivo.imagen ? (
            <div className="relative group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
              <img
                src={
                  cultivo.imagen.startsWith('http') 
                    ? cultivo.imagen 
                    : `${import.meta.env.VITE_API_URL}${cultivo.imagen.replace(/\\/g, '/').startsWith('/') ? '' : '/'}${cultivo.imagen.replace(/\\/g, '/')}`
                }
                alt={cultivo.nombre}
                className="w-full h-56 sm:h-64 lg:h-72 object-cover group-hover:scale-110 transition-transform duration-700"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/400x300?text=Cultivo+sin+imagen";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 bg-black/60 backdrop-blur-md rounded-lg p-1.5 sm:p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                <p className="text-white text-[10px] sm:text-xs text-center">{cultivo.nombre}</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-56 sm:h-64 lg:h-72 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 sm:gap-3 group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ImageIcon size={32} className="sm:w-10 sm:h-10 text-gray-400" />
              </div>
              <p className="text-xs sm:text-sm text-gray-400">Sin imagen disponible</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-4 sm:p-6 hover:shadow-lg transition-all duration-300">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 sm:mb-5 flex items-center gap-2">
              <div className="w-1 h-5 sm:w-1.5 sm:h-6 bg-gradient-to-b from-[#8B6F47] to-[#6b5436] rounded-full"></div>
              Información del cultivo
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg sm:rounded-xl hover:bg-[#8B6F47]/5 transition-all duration-300 group">
                <div className="p-1.5 sm:p-2 bg-[#8B6F47]/10 rounded-lg group-hover:scale-110 transition-transform">
                  <MapPin size={14} className="sm:w-4 sm:h-4 text-[#8B6F47]" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-400 mb-0.5">Ubicación</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-800">{cultivo.ubicacion || "Sin especificar"}</p>
                </div>
              </div>

              <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg sm:rounded-xl hover:bg-[#8B6F47]/5 transition-all duration-300 group">
                <div className="p-1.5 sm:p-2 bg-[#8B6F47]/10 rounded-lg group-hover:scale-110 transition-transform">
                  <Calendar size={14} className="sm:w-4 sm:h-4 text-[#8B6F47]" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-400 mb-0.5">Fecha de siembra</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-800">{formatDate(cultivo.fechaSiembra)}</p>
                </div>
              </div>

              <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg sm:rounded-xl hover:bg-[#8B6F47]/5 transition-all duration-300 group">
                <div className="p-1.5 sm:p-2 bg-[#8B6F47]/10 rounded-lg group-hover:scale-110 transition-transform">
                  <Droplets size={14} className="sm:w-4 sm:h-4 text-[#8B6F47]" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-400 mb-0.5">Frecuencia de riego</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-800">Cada {cultivo.frecuenciaRiego || "—"} días</p>
                </div>
              </div>

              <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg sm:rounded-xl hover:bg-[#8B6F47]/5 transition-all duration-300 group">
                <div className="p-1.5 sm:p-2 bg-[#8B6F47]/10 rounded-lg group-hover:scale-110 transition-transform">
                  <Wind size={14} className="sm:w-4 sm:h-4 text-[#8B6F47]" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-400 mb-0.5">Tipo de cultivo</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-800">{cultivo.tipo || "Sin especificar"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <p className="text-xl sm:text-3xl font-bold text-[#8B6F47]">{reportes.length}</p>
              <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1 flex items-center justify-center gap-1">
                <FileText size={8} className="sm:w-2.5 sm:h-2.5" />
                Reportes
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <p className="text-xl sm:text-3xl font-bold text-emerald-600">{reportesSemana}</p>
              <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1 flex items-center justify-center gap-1">
                <Calendar size={8} className="sm:w-2.5 sm:h-2.5" />
                Última semana
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <p className="text-xl sm:text-3xl font-bold text-amber-600">{diasDesdeSiembra}</p>
              <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1 flex items-center justify-center gap-1">
                <Sprout size={8} className="sm:w-2.5 sm:h-2.5" />
                Días
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
              <div className="w-1 h-6 sm:w-1.5 sm:h-8 bg-gradient-to-b from-[#8B6F47] to-[#6b5436] rounded-full"></div>
              Bitácora
            </h2>
            <p className="text-[11px] sm:text-sm text-gray-400 mt-0.5 sm:mt-1 flex items-center gap-1">
              <TrendingUp size={10} className="sm:w-3 sm:h-3" />
              {filteredReportes.length} reporte{filteredReportes.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <button
            className="bg-gradient-to-r from-[#8B6F47] to-[#6b5436] hover:from-[#7a5f3c] hover:to-[#5a4530] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-1.5 sm:gap-2"
            onClick={() => setIsReporteOpen(true)}
          >
            <Plus size={14} className="sm:w-4.5 sm:h-4.5" />
            Registrar reporte
          </button>
        </div>

        <div className="relative mb-4 sm:mb-6">
          <Search size={14} className="sm:w-4.5 sm:h-4.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar en la bitácora..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 sm:pl-10 pr-8 sm:pr-10 py-2 sm:py-3 text-sm border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B6F47]/20 focus:border-[#8B6F47] transition-all bg-white"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-all"
            >
              <X size={12} className="sm:w-4 sm:h-4" />
            </button>
          )}
        </div>

        {filteredReportes.length === 0 ? (
          <div className="text-center py-12 sm:py-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#8B6F47]/20 to-[#8B6F47]/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <FileText size={24} className="sm:w-8 sm:h-8 text-[#8B6F47]" />
            </div>
            <p className="text-gray-500 text-base sm:text-lg mb-1 sm:mb-2 font-medium">
              {searchTerm ? "No se encontraron reportes" : "Bitácora vacía"}
            </p>
            <p className="text-gray-400 text-xs sm:text-sm">
              {searchTerm 
                ? `No hay reportes que coincidan con "${searchTerm}"` 
                : `Comienza registrando el primer reporte`}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setIsReporteOpen(true)}
                className="mt-4 sm:mt-6 inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-[#8B6F47] text-white rounded-lg text-xs sm:text-sm hover:bg-[#7a5f3c] transition-all"
              >
                <Plus size={12} className="sm:w-4 sm:h-4" />
                Crear primer reporte
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredReportes.map((reporte, index) => (
              <div
                key={reporte.id}
                className="bg-white border border-gray-100 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-500 hover:border-[#8B6F47]/30 transform hover:-translate-y-1 cursor-pointer group"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2 sm:mb-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#8B6F47]/20 to-[#8B6F47]/10 rounded-lg sm:rounded-xl flex items-center justify-center text-[#8B6F47] font-bold text-xs sm:text-sm group-hover:scale-110 transition-transform">
                      {index + 1}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="text-[10px] sm:text-xs font-medium bg-emerald-50 text-emerald-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1 group-hover:bg-emerald-100 transition-all">
                        <Calendar size={8} className="sm:w-2.5 sm:h-2.5" />
                        {formatDateShort(reporte.createdAt)}
                      </span>
                      <span className="text-[9px] sm:text-xs text-gray-400">
                        {new Date(reporte.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>

                <h4 className="text-sm sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-2 pl-9 sm:pl-13 group-hover:text-[#8B6F47] transition-colors">
                  {reporte.titulo}
                </h4>
                
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed pl-9 sm:pl-13 group-hover:text-gray-700 transition-colors">
                  {reporte.descripcion}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddReporteModal
        isOpen={isReporteOpen}
        onClose={() => setIsReporteOpen(false)}
        cultivoId={cultivo.id}
        onSave={handleCreateReporte}
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
        
        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-1rem);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(1rem);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInBottom {
          from {
            opacity: 0;
            transform: translateY(1rem);
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
        
        .animate-in {
          animation-fill-mode: forwards;
        }
        
        .zoom-in {
          animation: zoomIn 0.3s ease-out forwards;
        }
        
        .slide-in-from-left-4 {
          animation: slideInLeft 0.3s ease-out forwards;
        }
        
        .slide-in-from-right-4 {
          animation: slideInRight 0.3s ease-out forwards;
        }
        
        .slide-in-from-bottom-4 {
          animation: slideInBottom 0.3s ease-out forwards;
        }
        
        .pl-13 {
          padding-left: 2.75rem;
        }
        
        @media (min-width: 640px) {
          .pl-13 {
            padding-left: 3.25rem;
          }
        }
      `}</style>
    </div>
  );
}