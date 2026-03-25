import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  FileText,
  Download,
  Calendar,
  User,
  Tag,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Filter,
  BarChart3,
  PieChart,
  Search,
  TrendingUp,
  Clock,
  Grid3x3,
  List,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { authFetch } from "../../services/authFetch";

export default function ReportesPage() {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showStats, setShowStats] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });
  const [isStatsAnimatingOut, setIsStatsAnimatingOut] = useState(false);
  const itemsPerPage = 6;
  const API = "/api/reportes";

  useEffect(() => {
    if (showStats) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showStats]);

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, message: "", type: "success" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  useEffect(() => {
    const fetchReportes = async () => {
      setLoading(true);
      try {
        const res = await authFetch(`${API}/list`);
        if (!res.ok) throw new Error("Error al obtener reportes");
        const data = await res.json();
        setReportes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error cargando reportes", err);
        setReportes([]);
        setNotification({
          show: true,
          message: "❌ Error al cargar los reportes",
          type: "error"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchReportes();
  }, []);

  const descargarReporte = async (id, titulo) => {
    try {
      const res = await authFetch(`${API}/${id}/descargar`);
      if (!res.ok) throw new Error("Error al descargar");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `reporte-${titulo || id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setNotification({
        show: true,
        message: `✅ Reporte "${titulo}" descargado exitosamente`,
        type: "success"
      });
    } catch (error) {
      console.error("Error descargando reporte", error);
      setNotification({
        show: true,
        message: "❌ Error al descargar el reporte",
        type: "error"
      });
    }
  };

  const toggleFilter = (type) => {
    setSelectedFilters((prev) => {
      if (type === "todos") return [];
      return prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type];
    });
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedFilters([]);
    setCurrentPage(1);
  };

  const handleCloseStats = () => {
    setIsStatsAnimatingOut(true);
    setTimeout(() => {
      setIsStatsAnimatingOut(false);
      setShowStats(false);
    }, 200);
  };

  const getTypeStats = () => {
    const stats = {};
    reportes.forEach(rep => {
      const type = rep.type?.toLowerCase() || "sin tipo";
      stats[type] = (stats[type] || 0) + 1;
    });
    return stats;
  };

  const getMonthStats = () => {
    const stats = {};
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    reportes.forEach(rep => {
      if (rep.date) {
        const date = new Date(rep.date);
        const monthKey = months[date.getMonth()];
        stats[monthKey] = (stats[monthKey] || 0) + 1;
      }
    });
    
    return stats;
  };

  const filteredReportes = useMemo(() => {
    let filtered = reportes;
    
    if (selectedFilters.length > 0) {
      filtered = filtered.filter((rep) => selectedFilters.includes(rep.type?.toLowerCase()));
    }
    
    if (searchTerm) {
      filtered = filtered.filter((rep) => 
        rep.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rep.autor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rep.cultivo?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [reportes, selectedFilters, searchTerm]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReportes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReportes.length / itemsPerPage);

  const nextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
  const prevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const firstPage = () => setCurrentPage(1);
  const lastPage = () => setCurrentPage(totalPages);

  const uniqueTypes = [...new Set(reportes.map((r) => r.type?.toLowerCase()).filter(Boolean))];

  const getTypeColor = (type) => {
    const colors = {
      riego: "bg-blue-50 text-blue-700 border-blue-200",
      fertilizacion: "bg-green-50 text-green-700 border-green-200",
      plaga: "bg-red-50 text-red-700 border-red-200",
      cosecha: "bg-amber-50 text-amber-700 border-amber-200",
      observacion: "bg-purple-50 text-purple-700 border-purple-200"
    };
    return colors[type?.toLowerCase()] || "bg-gray-50 text-gray-600 border-gray-200";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-gray-200 border-t-[#8B6F47] rounded-full animate-spin"></div>
          <FileText size={20} className="sm:w-6 sm:h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#8B6F47] animate-pulse" />
        </div>
        <p className="mt-4 text-gray-500 animate-pulse text-sm sm:text-base">Cargando reportes...</p>
      </div>
    );
  }

  return (
    <>
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
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={14} className="sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#8B6F47] to-[#6b5436] rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 size={18} className="sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Reportes del Sistema
              </h1>
              <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                <FileText size={12} className="sm:w-3.5 sm:h-3.5" />
                Consulta y descarga reportes generados
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowStats(true)}
            className="bg-gradient-to-r from-[#8B6F47] to-[#6b5436] hover:from-[#7a5f3c] hover:to-[#5a4530] text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-1.5 sm:gap-2 hover:scale-105"
          >
            <PieChart size={14} className="sm:w-4 sm:h-4" />
            <span>Estadísticas</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-5 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] sm:text-sm text-gray-400 mb-0.5 sm:mb-1">Total reportes</p>
                <p className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform">{reportes.length}</p>
              </div>
              <div className="p-1.5 sm:p-3 bg-[#8B6F47]/10 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform duration-300">
                <FileText size={14} className="sm:w-5 sm:h-5 text-[#8B6F47]" />
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
                <p className="text-[10px] sm:text-sm text-gray-400 mb-0.5 sm:mb-1">Filtrados</p>
                <p className="text-xl sm:text-3xl font-bold text-[#8B6F47] group-hover:scale-105 transition-transform">{filteredReportes.length}</p>
              </div>
              <div className="p-1.5 sm:p-3 bg-[#8B6F47]/10 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Filter size={14} className="sm:w-5 sm:h-5 text-[#8B6F47]" />
              </div>
            </div>
            <p className="text-[9px] sm:text-xs text-gray-400 mt-1 sm:mt-2">
              {selectedFilters.length} filtros
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-5 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] sm:text-sm text-gray-400 mb-0.5 sm:mb-1">Este mes</p>
                <p className="text-xl sm:text-3xl font-bold text-emerald-600 group-hover:scale-105 transition-transform">
                  {filteredReportes.filter((r) => {
                    const fecha = new Date(r.date);
                    const hoy = new Date();
                    return fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear();
                  }).length}
                </p>
              </div>
              <div className="p-1.5 sm:p-3 bg-emerald-50 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Calendar size={14} className="sm:w-5 sm:h-5 text-emerald-600" />
              </div>
            </div>
            <p className="text-[9px] sm:text-xs text-gray-400 mt-1 sm:mt-2 flex items-center gap-1">
              <Clock size={8} className="sm:w-2.5 sm:h-2.5" />
              Últimos 30 días
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-5 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] sm:text-sm text-gray-400 mb-0.5 sm:mb-1">Tipos</p>
                <p className="text-xl sm:text-3xl font-bold text-amber-600 group-hover:scale-105 transition-transform">{uniqueTypes.length}</p>
              </div>
              <div className="p-1.5 sm:p-3 bg-amber-50 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Tag size={14} className="sm:w-5 sm:h-5 text-amber-600" />
              </div>
            </div>
            <p className="text-[9px] sm:text-xs text-gray-400 mt-1 sm:mt-2">
              Categorías
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Filter size={14} className="sm:w-4 sm:h-4 text-[#8B6F47]" />
              <h3 className="text-xs sm:text-sm font-semibold text-gray-700">Filtros</h3>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1 rounded-lg transition-all duration-300 ${viewMode === "grid" ? "bg-white shadow-sm text-[#8B6F47]" : "text-gray-400"}`}
                >
                  <Grid3x3 size={14} className="sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1 rounded-lg transition-all duration-300 ${viewMode === "list" ? "bg-white shadow-sm text-[#8B6F47]" : "text-gray-400"}`}
                >
                  <List size={14} className="sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="relative mb-4">
            <Search size={14} className="sm:w-4 sm:h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar reporte..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
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

          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <button
              className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 ${
                selectedFilters.length === 0 
                  ? "bg-gradient-to-r from-[#8B6F47] to-[#6b5436] text-white shadow-md" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={clearFilters}
            >
              Todos ({reportes.length})
            </button>

            {uniqueTypes.map((type) => (
              <button
                key={type}
                className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-all duration-300 ${
                  selectedFilters.includes(type) 
                    ? "bg-gradient-to-r from-[#8B6F47] to-[#6b5436] text-white shadow-md" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                onClick={() => toggleFilter(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {currentItems.map((rep) => (
              <div
                key={rep.id}
                className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden hover:border-[#8B6F47]/30 transform hover:-translate-y-1 sm:hover:-translate-y-2"
              >
                <div className="p-4 sm:p-5">
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <span className={`px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-full border ${getTypeColor(rep.type)}`}>
                      {rep.type}
                    </span>
                    <span className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1 bg-gray-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                      <Calendar size={8} className="sm:w-2.5 sm:h-2.5" />
                      {rep.date}
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-800 text-sm sm:text-lg mb-2 line-clamp-2 group-hover:text-[#8B6F47] transition-colors">
                    {rep.title}
                  </h3>

                  {rep.cultivo && (
                    <div className="text-[10px] sm:text-xs text-gray-500 mt-2 flex items-center gap-1 bg-gray-50 inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                      <Tag size={8} className="sm:w-2.5 sm:h-2.5" />
                      {rep.cultivo}
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-100">
                    <span className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1 truncate max-w-[120px] sm:max-w-full">
                      <User size={8} className="sm:w-3 sm:h-3 flex-shrink-0" />
                      <span className="truncate">{rep.autor}</span>
                    </span>

                    <button
                      onClick={() => descargarReporte(rep.id, rep.title)}
                      className="p-1.5 sm:p-2 text-gray-400 hover:text-[#8B6F47] hover:bg-[#8B6F47]/10 rounded-lg transition-all duration-300"
                    >
                      <Download size={12} className="sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider px-3 sm:px-6 py-2 sm:py-4">Tipo</th>
                  <th className="text-left text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider px-3 sm:px-6 py-2 sm:py-4">Título</th>
                  <th className="text-left text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider px-3 sm:px-6 py-2 sm:py-4 hidden sm:table-cell">Cultivo</th>
                  <th className="text-left text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider px-3 sm:px-6 py-2 sm:py-4 hidden md:table-cell">Fecha</th>
                  <th className="text-left text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider px-3 sm:px-6 py-2 sm:py-4 hidden lg:table-cell">Autor</th>
                  <th className="text-right text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider px-3 sm:px-6 py-2 sm:py-4">Acciones</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentItems.map((rep) => (
                  <tr key={rep.id} className="hover:bg-gray-50/50 transition-all duration-300 group">
                    <td className="px-3 sm:px-6 py-2 sm:py-4">
                      <span className={`px-1.5 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-xs rounded-full border inline-block ${getTypeColor(rep.type)}`}>
                        {rep.type}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-800 group-hover:text-[#8B6F47] transition-colors line-clamp-1 max-w-[120px] sm:max-w-none">
                        {rep.title}
                      </p>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 hidden sm:table-cell">
                      {rep.cultivo ? (
                        <span className="text-[9px] sm:text-xs text-gray-500 flex items-center gap-1">
                          <Tag size={8} className="sm:w-2.5 sm:h-2.5" />
                          <span className="truncate max-w-[80px] sm:max-w-none">{rep.cultivo}</span>
                        </span>
                      ) : (
                        <span className="text-[9px] sm:text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 hidden md:table-cell">
                      <span className="text-[9px] sm:text-xs text-gray-500 flex items-center gap-1 whitespace-nowrap">
                        <Calendar size={8} className="sm:w-2.5 sm:h-2.5" />
                        {rep.date}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 hidden lg:table-cell">
                      <span className="text-[9px] sm:text-xs text-gray-500 flex items-center gap-1 truncate max-w-[100px]">
                        <User size={8} className="sm:w-2.5 sm:h-2.5" />
                        {rep.autor}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 text-right">
                      <button
                        onClick={() => descargarReporte(rep.id, rep.title)}
                        className="p-1.5 sm:p-2 text-gray-400 hover:text-[#8B6F47] hover:bg-[#8B6F47]/10 rounded-lg transition-all duration-300"
                      >
                        <Download size={12} className="sm:w-4 sm:h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {currentItems.length === 0 && (
          <div className="text-center py-12 sm:py-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#8B6F47]/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <FileText size={24} className="sm:w-8 sm:h-8 text-[#8B6F47]" />
            </div>
            <p className="text-gray-500 text-base sm:text-lg mb-1 sm:mb-2 font-medium">No se encontraron reportes</p>
            <p className="text-gray-400 text-xs sm:text-sm">Intenta con otros filtros o términos de búsqueda</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-1 sm:gap-2 mt-6 sm:mt-8">
            <button
              onClick={firstPage}
              disabled={currentPage === 1}
              className="p-1.5 sm:p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
            >
              <ChevronsLeft size={14} className="sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className="p-1.5 sm:p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
            >
              <ChevronLeft size={14} className="sm:w-4 sm:h-4" />
            </button>
            <span className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className="p-1.5 sm:p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
            >
              <ChevronRight size={14} className="sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={lastPage}
              disabled={currentPage === totalPages}
              className="p-1.5 sm:p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
            >
              <ChevronsRight size={14} className="sm:w-4 sm:h-4" />
            </button>
          </div>
        )}
      </div>

      {showStats && createPortal(
        <div
          className={`fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-3 sm:p-4 transition-all duration-200 ${
            isStatsAnimatingOut ? "opacity-0" : "opacity-100"
          }`}
          onClick={handleCloseStats}
        >
          <div
            className={`bg-white rounded-2xl w-[calc(100%-2rem)] sm:w-full max-w-md shadow-2xl relative overflow-hidden transition-all duration-300 mx-2 sm:mx-0 max-h-[90vh] overflow-y-auto ${
              isStatsAnimatingOut 
                ? "opacity-0 scale-95 translate-y-4" 
                : "opacity-100 scale-100 translate-y-0"
            }`}
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#8B6F47] to-[#6b5436] rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                  <PieChart size={16} className="sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-lg font-semibold text-gray-800">
                    Estadísticas
                  </h3>
                  <p className="text-[10px] sm:text-xs text-gray-400 hidden sm:block">
                    Resumen de reportes del sistema
                  </p>
                </div>
              </div>
              <button
                className="text-gray-400 hover:text-gray-600 transition-all duration-300 p-1.5 hover:bg-gray-100 rounded-full"
                onClick={handleCloseStats}
              >
                <X size={16} className="sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="px-4 sm:px-6 py-4 sm:py-6">
              <div className="space-y-5 sm:space-y-6">
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-3 sm:mb-4">Por tipo</h4>
                  {Object.entries(getTypeStats()).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center mb-2 sm:mb-3">
                      <span className="text-[11px] sm:text-sm text-gray-600 capitalize">{type}</span>
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 ml-3 sm:ml-4">
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5 sm:h-2 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-[#8B6F47] to-[#6b5436] h-full rounded-full"
                            style={{ width: `${(count / reportes.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-[#8B6F47] min-w-[35px] sm:min-w-[40px]">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-3 sm:mb-4">Por mes</h4>
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                    {Object.entries(getMonthStats()).map(([month, count]) => (
                      <div key={month} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg sm:rounded-xl p-2 sm:p-3 text-center">
                        <p className="text-[9px] sm:text-xs text-gray-500">{month}</p>
                        <p className="text-sm sm:text-xl font-bold text-[#8B6F47]">{count}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 sm:pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center text-xs sm:text-sm py-1.5 sm:py-2">
                    <span className="text-gray-500">Total:</span>
                    <span className="font-bold text-gray-800">{reportes.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs sm:text-sm py-1.5 sm:py-2">
                    <span className="text-gray-500">Tipos:</span>
                    <span className="font-bold text-gray-800">{Object.keys(getTypeStats()).length}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCloseStats}
                className="mt-5 sm:mt-6 w-full py-2.5 sm:py-3 bg-gradient-to-r from-[#8B6F47] to-[#6b5436] text-white rounded-lg sm:rounded-xl font-semibold hover:shadow-lg transition-all duration-300 text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

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
        
        .slide-in-from-left-4 {
          animation: slideInLeft 0.3s ease-out forwards;
        }
        
        .slide-in-from-right-4 {
          animation: slideInRight 0.3s ease-out forwards;
        }
        
        .slide-in-from-bottom-4 {
          animation: slideInBottom 0.3s ease-out forwards;
        }
        
        .zoom-in {
          animation: zoomIn 0.3s ease-out forwards;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
}