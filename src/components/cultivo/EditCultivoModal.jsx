import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Upload,
  MapPin,
  Calendar,
  Droplets,
  Activity,
  Sprout,
  Info,
  ChevronDown,
  FileText
} from "lucide-react";

export default function EditCultivoModal({
  isOpen,
  onClose,
  cultivo,
  onSave,
  onDelete,
  userRole
}) {
  const [formData, setFormData] = useState({
    nombre: "",
    fechaSiembra: "",
    frecuenciaRiego: "",
    estado: "",
    ubicacion: "",
    descripcion: "",
    file: null,
  });

  const [previewUrl, setPreviewUrl] = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [isConfirmAnimatingOut, setIsConfirmAnimatingOut] = useState(false);

  useEffect(() => {
    if (cultivo) {
      setFormData({
        nombre: cultivo.nombre || "",
        fechaSiembra: cultivo.fechaSiembra ? cultivo.fechaSiembra.split("T")[0] : "",
        frecuenciaRiego: cultivo.frecuenciaRiego || "",
        estado: cultivo.estado || "",
        ubicacion: cultivo.ubicacion || "",
        descripcion: cultivo.descripcion || "",
        file: null,
      });

      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }

      if (cultivo.imagen) {
        setPreviewUrl(
          cultivo.imagen.startsWith('http') && !cultivo.imagen.includes('localhost:3000')
            ? cultivo.imagen 
            : `${import.meta.env.VITE_API_URL}${cultivo.imagen.replace('http://localhost:3000', '').replace(/\\/g, '/').startsWith('/') ? '' : '/'}${cultivo.imagen.replace('http://localhost:3000', '').replace(/\\/g, '/')}`
        );
      } else {
        setPreviewUrl("");
      }
    }

    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [cultivo]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen && !isAnimatingOut) return null;

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsAnimatingOut(false);
      onClose();
    }, 200);
  };

  const handleConfirmClose = () => {
    setIsConfirmAnimatingOut(true);
    setTimeout(() => {
      setIsConfirmAnimatingOut(false);
      setShowConfirmDelete(false);
    }, 200);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRiegoChange = (e) => {
    let value = e.target.value;
    if (value === "") {
      handleChange("frecuenciaRiego", "");
      return;
    }
    let numValue = Number(value);
    if (numValue < 0) numValue = 0;
    if (numValue > 365) numValue = 365;
    handleChange("frecuenciaRiego", numValue.toString());
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setFormData(prev => ({ ...prev, file }));
  };

  const handleSave = async () => {
    if (!formData.nombre || !formData.fechaSiembra) {
      alert("Completa los campos obligatorios");
      return;
    }

    const data = new FormData();
    data.append("nombre", formData.nombre);
    data.append("fechaSiembra", new Date(formData.fechaSiembra).toISOString());
    data.append("frecuenciaRiego", formData.frecuenciaRiego);
    data.append("estado", formData.estado);
    data.append("ubicacion", formData.ubicacion);
    data.append("descripcion", formData.descripcion);

    if (formData.file) {
      data.append("imagen", formData.file);
    }

    await onSave(cultivo.id, data);

    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    handleClose();
  };

  const handleDelete = () => {
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    await onDelete(cultivo.id);

    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    handleConfirmClose();
    handleClose();
  };

  const handleRemoveImage = () => {
    setPreviewUrl("");
    setFormData(prev => ({ ...prev, file: null }));
  };

  return createPortal(
    <>
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4 transition-all duration-200 ${
          isAnimatingOut ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
      >
        <div
          className={`bg-white rounded-2xl w-full max-w-3xl shadow-2xl relative overflow-hidden transition-all duration-300 mx-2 sm:mx-0 max-h-[98vh] sm:max-h-[95vh] overflow-y-auto ${
            isAnimatingOut 
              ? "opacity-0 scale-95 translate-y-4" 
              : "opacity-100 scale-100 translate-y-0"
          }`}
          onClick={e => e.stopPropagation()}
        >
          <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#8B6F47] to-[#6b5436] rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                <Sprout size={16} className="sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-semibold text-gray-800">
                  Editar cultivo
                </h2>
                <p className="text-[10px] sm:text-xs text-gray-400 hidden sm:block">
                  Modifica la información del cultivo
                </p>
              </div>
            </div>
            <button
              className="text-gray-400 hover:text-gray-600 transition-all duration-300 p-1.5 hover:bg-gray-100 rounded-full hover:rotate-90"
              onClick={handleClose}
            >
              <X size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>

          <div className="px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="lg:col-span-1">
                <div
                  className={`relative border-2 border-dashed rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center gap-2 min-h-[160px] sm:min-h-[200px] transition-all duration-300 cursor-pointer group ${
                    previewUrl
                      ? "border-[#8B6F47] bg-[#8B6F47]/5"
                      : "border-gray-200 bg-gray-50 hover:border-[#8B6F47] hover:bg-[#8B6F47]/5 active:scale-[0.98]"
                  }`}
                >
                  {previewUrl ? (
                    <div className="relative w-full">
                      <img
                        src={previewUrl}
                        alt="preview"
                        className="w-full h-24 sm:h-32 object-cover rounded-lg shadow-md"
                      />
                      <button
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all duration-300 shadow-lg active:scale-95"
                      >
                        <X size={12} className="sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 sm:w-14 sm:h-14 bg-[#8B6F47]/10 rounded-full flex items-center justify-center group-active:scale-95 transition-transform">
                        <Upload size={18} className="sm:w-6 sm:h-6 text-[#8B6F47]" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-600">
                        Subir imagen
                      </span>
                      <span className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1">
                        <Info size={10} />
                        PNG, JPG hasta 5MB
                      </span>
                    </>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>

                <p className="text-[10px] sm:text-xs text-gray-400 text-center mt-2">
                  Imagen opcional del cultivo
                </p>
              </div>

              <div className="lg:col-span-2 space-y-3 sm:space-y-5">
                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Sprout size={10} className="sm:w-3 sm:h-3" /> 
                    Nombre del cultivo
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={e => handleChange("nombre", e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border-0 border-b-2 border-gray-200 focus:border-[#8B6F47] outline-none transition-all bg-transparent"
                    placeholder="Ej: Tomates cherry"
                  />
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <MapPin size={10} className="sm:w-3 sm:h-3" /> 
                    Ubicación
                  </label>
                  <div className="relative">
                    <select
                      value={formData.ubicacion}
                      onChange={e => handleChange("ubicacion", e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#8B6F47]/20 focus:border-[#8B6F47] transition-all bg-white"
                    >
                      <option value="">Seleccionar ubicación</option>
                      <option value="Invernadero A">Invernadero A</option>
                      <option value="Invernadero B">Invernadero B</option>
                      <option value="Campo Abierto">Campo Abierto</option>
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <Calendar size={10} className="sm:w-3 sm:h-3" /> 
                      Fecha de siembra
                    </label>
                    <input
                      type="date"
                      value={formData.fechaSiembra}
                      onChange={e => handleChange("fechaSiembra", e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border-0 border-b-2 border-gray-200 focus:border-[#8B6F47] outline-none transition-all bg-transparent"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <Droplets size={10} className="sm:w-3 sm:h-3" /> 
                      Riego (días)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="365"
                      step="1"
                      value={formData.frecuenciaRiego}
                      onChange={handleRiegoChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border-0 border-b-2 border-gray-200 focus:border-[#8B6F47] outline-none transition-all bg-transparent"
                      placeholder="Ej: 2"
                    />
                    <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-400">
                      <Info size={10} />
                      Días entre riegos
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Activity size={10} className="sm:w-3 sm:h-3" /> 
                    Estado
                  </label>
                  <div className="relative">
                    <select
                      value={formData.estado}
                      onChange={e => handleChange("estado", e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#8B6F47]/20 focus:border-[#8B6F47] transition-all bg-white"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                      <option value="cosechado">Cosechado</option>
                      <option value="perdido">Perdido</option>
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <FileText size={10} className="sm:w-3 sm:h-3" /> 
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={e => handleChange("descripcion", e.target.value)}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47]/20 focus:border-[#8B6F47] transition-all resize-none"
                    placeholder="Notas adicionales sobre el cultivo..."
                  />
                  <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-400">
                    <Info size={10} />
                    Información adicional opcional
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-white border-t border-gray-100 p-3 sm:p-6">
            <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-3">
              {userRole === "admin" && (
                <button
                  onClick={handleDelete}
                  className="w-full sm:w-auto px-4 py-2.5 bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 border border-red-200"
                >
                  <X size={14} />
                  Eliminar cultivo
                </button>
              )}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  onClick={handleClose}
                  className="w-full sm:w-auto px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="w-full sm:w-auto bg-gradient-to-r from-[#8B6F47] to-[#6b5436] hover:from-[#7a5f3c] hover:to-[#5a4530] active:scale-[0.98] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Sprout size={14} />
                  Guardar cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showConfirmDelete && createPortal(
        <div
          className={`fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[10000] p-3 sm:p-4 transition-all duration-200 ${
            isConfirmAnimatingOut ? "opacity-0" : "opacity-100"
          }`}
          onClick={handleConfirmClose}
        >
          <div
            className={`bg-white rounded-2xl w-[calc(100%-2rem)] sm:w-full max-w-md shadow-2xl relative overflow-hidden transition-all duration-300 mx-2 sm:mx-0 ${
              isConfirmAnimatingOut 
                ? "opacity-0 scale-95 translate-y-4" 
                : "opacity-100 scale-100 translate-y-0"
            }`}
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-red-400 to-red-500"></div>
            
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-4">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <X size={20} className="sm:w-7 sm:h-7 text-red-600" />
                </div>
                <h3 className="text-base sm:text-xl font-semibold text-gray-800">
                  Confirmar eliminación
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 mb-4">
                ¿Seguro que deseas eliminar este cultivo? Esta acción no se puede deshacer.
              </p>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 sm:p-4 mb-5 sm:mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#8B6F47] to-[#6b5436] rounded-xl flex items-center justify-center text-white font-semibold text-sm sm:text-base shadow-md flex-shrink-0">
                    {cultivo?.nombre?.[0]?.toUpperCase() || "C"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                      {cultivo?.nombre || "Sin nombre"}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1 truncate">
                      <MapPin size={10} className="flex-shrink-0" />
                      <span className="truncate">{cultivo?.ubicacion || "Sin ubicación"}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                <button
                  onClick={handleConfirmClose}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm font-medium text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 active:scale-[0.98] text-white rounded-lg text-xs sm:text-sm font-medium transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <X size={14} />
                  Sí, eliminar
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>,
    document.body
  );
}