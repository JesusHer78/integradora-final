import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Mail, Shield, Info, User } from "lucide-react";

export default function EditUsuarioModal({ isOpen, onClose, onSave, user }) {
  const [form, setForm] = useState({
    email: "",
    role: "USER"
  });

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (user) {
      setForm({
        email: user.email || "",
        role: user.role || "USER"
      });
    }
  }, [user]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl shadow-xl relative animate-in fade-in duration-200 max-h-[95vh] overflow-y-auto"
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
              <h2 className="text-2xl font-semibold text-gray-800">Editar usuario</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Modifica la información del usuario
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 min-h-[200px] bg-gray-50">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#8B6F47] to-[#6b5436] rounded-full flex items-center justify-center text-white shadow-md">
                    <User size={40} strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Foto de perfil</span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Info size={10} />
                    Sin cambios
                  </span>
                </div>
                <p className="text-xs text-gray-400 text-center mt-2">
                  La imagen no se puede modificar
                </p>
              </div>

              <div className="lg:col-span-2 space-y-5">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Mail size={12} />
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="w-full px-4 py-2.5 border-0 border-b-2 border-gray-200 focus:border-[#8B6F47] outline-none transition-colors bg-transparent"
                    placeholder="usuario@ejemplo.com"
                    value={form.email}
                    onChange={handleChange}
                  />
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Info size={10} />
                    Email del usuario
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Shield size={12} />
                    Rol del usuario
                  </label>
                  <div className="relative">
                    <select
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#8B6F47]/20 focus:border-[#8B6F47] transition-all bg-white"
                    >
                      <option value="USER">Usuario</option>
                      <option value="ADMIN">Administrador</option>
                    </select>
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Info size={10} />
                    Define los permisos del usuario
                  </div>
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
                Guardar cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}