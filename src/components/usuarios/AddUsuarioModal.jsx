import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, User, Mail, Lock, Shield, Building2, MapPin, Globe, Info, Eye, EyeOff } from "lucide-react";

export default function AddUsuarioModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    farmName: "",
    location: "",
    language: "es",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
    handleChange("avatar", file);
  };

  const handleRemoveAvatar = () => {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarPreview(null);
    handleChange("avatar", null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-3xl shadow-xl relative animate-in fade-in duration-200 max-h-[95vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="sticky top-4 right-4 float-right text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full z-10"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>

        <div className="clear-both"></div>

        <div className="px-6 pt-2 pb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-[#8B6F47] to-[#6b5436] rounded-xl flex items-center justify-center shadow-md">
              <User size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">Nuevo Usuario</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Registra un nuevo usuario en el sistema
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 min-h-[200px] transition-all cursor-pointer ${
                  avatarPreview 
                    ? 'border-[#8B6F47] bg-[#8B6F47]/5' 
                    : 'border-gray-200 bg-gray-50 hover:border-[#8B6F47] hover:bg-[#8B6F47]/5'
                }`}>
                  {avatarPreview ? (
                    <div className="relative">
                      <img 
                        src={avatarPreview} 
                        alt="avatar preview" 
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md" 
                      />
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <User size={40} className="text-gray-400" strokeWidth={1.5} />
                      <span className="text-sm font-medium text-gray-600">Foto de perfil</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Info size={10} />
                        Opcional
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
                <p className="text-xs text-gray-400 text-center mt-2">
                  Imagen opcional del usuario
                </p>
              </div>

              <div className="lg:col-span-2 space-y-5">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <User size={12} />
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border-0 border-b-2 border-gray-200 focus:border-[#8B6F47] outline-none transition-colors bg-transparent"
                    placeholder="Ej: Juan Pérez"
                    value={formData.name}
                    onChange={e => handleChange("name", e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Mail size={12} />
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2.5 border-0 border-b-2 border-gray-200 focus:border-[#8B6F47] outline-none transition-colors bg-transparent"
                    placeholder="usuario@ejemplo.com"
                    value={formData.email}
                    onChange={e => handleChange("email", e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Lock size={12} />
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full px-4 py-2.5 border-0 border-b-2 border-gray-200 focus:border-[#8B6F47] outline-none transition-colors bg-transparent pr-10"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={e => handleChange("password", e.target.value)}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Info size={10} />
                    Mínimo 8 caracteres
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <Shield size={12} />
                      Rol
                    </label>
                    <div className="relative">
                      <select
                        value={formData.role}
                        onChange={e => handleChange("role", e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#8B6F47]/20 focus:border-[#8B6F47] transition-all bg-white"
                      >
                        <option value="user">Usuario</option>
                        <option value="admin">Administrador</option>
                      </select>
                      <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <Globe size={12} />
                      Idioma
                    </label>
                    <div className="relative">
                      <select
                        value={formData.language}
                        onChange={e => handleChange("language", e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#8B6F47]/20 focus:border-[#8B6F47] transition-all bg-white"
                      >
                        <option value="es">Español</option>
                        <option value="en">Inglés</option>
                      </select>
                      <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Building2 size={12} />
                    Nombre de la granja
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border-0 border-b-2 border-gray-200 focus:border-[#8B6F47] outline-none transition-colors bg-transparent"
                    placeholder="Ej: Granja El Rosal"
                    value={formData.farmName}
                    onChange={e => handleChange("farmName", e.target.value)}
                    autoComplete="organization"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <MapPin size={12} />
                    Ubicación
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border-0 border-b-2 border-gray-200 focus:border-[#8B6F47] outline-none transition-colors bg-transparent"
                    placeholder="Ej: Antioquia, Colombia"
                    value={formData.location}
                    onChange={e => handleChange("location", e.target.value)}
                    autoComplete="address-level1"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-[#8B6F47] hover:bg-[#7a5f3c] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow-md flex items-center gap-2"
              >
                <User size={16} />
                Crear Usuario
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}