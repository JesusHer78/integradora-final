import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sliders, Save, Building2, Calendar, Download, Check, AlertCircle } from 'lucide-react';

export default function AjustesPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState({
    farmName: user?.farmName || 'Tetlalli - Huerto Escolar UTT',
    location: user?.location || 'Tlaxcala, México',
    dateFormat: user?.dateFormat || 'DD/MM/YYYY',
  });

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  // Protección de Ruta: Solo Admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage('');
    setError('');

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios/preferences`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          farmName: settings.farmName,
          location: settings.location,
          language: settings.dateFormat 
        })
      });

      if (!res.ok) throw new Error("Error al guardar cambios");
      
      const updatedData = await res.json();
      
      updateUser({
        farmName: updatedData.farmName,
        location: updatedData.location,
      });

      setSuccessMessage('¡Configuración guardada correctamente!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Fallo al guardar en el servidor');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/backup`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error("Error al descargar respaldo");
      
      const fullBackup = await res.json();
      const dataStr = JSON.stringify(fullBackup, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeName = settings.farmName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      link.download = `tetlalli_full_backup_${safeName}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccessMessage('¡Respaldo de base de datos generado!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Fallo al generar respaldo de DB');
    }
  };

  if (user && user.role !== 'admin') return null;

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#8B6F47] rounded-2xl flex items-center justify-center shadow-lg transform rotate-2">
            <Sliders size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Ajustes del Sistema
            </h1>
            <p className="text-[10px] text-[#8b6f47] font-bold tracking-widest uppercase">
              Configuración Maestra
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {successMessage && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-xl text-[10px] font-bold border border-green-100 uppercase animate-fadeIn">
              <Check size={12} />
              {successMessage}
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#5c4731] hover:bg-[#4B3621] text-white px-6 py-3 rounded-2xl text-[13px] font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
            <span>Guardar cambios</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Información del Huerto */}
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-[#8B6F47]/10 rounded-xl">
              <Building2 size={18} className="text-[#8B6F47]" />
            </div>
            <h3 className="text-base font-bold text-gray-800 uppercase tracking-tight">Identidad del Huerto</h3>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                Nombre del Huerto Escolar UTT
              </label>
              <input
                type="text"
                value={settings.farmName}
                onChange={(e) => handleChange('farmName', e.target.value)}
                className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-[#8B6F47]/10 focus:border-[#8B6F47] transition-all text-sm font-bold text-gray-700 placeholder:text-gray-300"
                placeholder="Ej: Tetlalli - Huerto UTT"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                Ubicación Regional (Tlaxcala)
              </label>
              <input
                type="text"
                value={settings.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-[#8B6F47]/10 focus:border-[#8B6F47] transition-all text-sm font-bold text-gray-700 placeholder:text-gray-300"
                placeholder="Ej: Tlaxcala, México"
              />
            </div>
          </div>
        </div>

        {/* Formatos Regionales */}
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-[#8B6F47]/10 rounded-xl">
              <Calendar size={18} className="text-[#8B6F47]" />
            </div>
            <h3 className="text-base font-bold text-gray-800 uppercase tracking-tight">Preferencias Regionales</h3>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
              Formato de fecha (Estilo México)
            </label>
            <select
              value={settings.dateFormat}
              onChange={(e) => handleChange('dateFormat', e.target.value)}
              className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-[#8B6F47]/10 focus:border-[#8B6F47] transition-all text-sm font-bold text-gray-700 cursor-pointer appearance-none"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY (Ej: 25/03/2026)</option>
              <option value="DD de MMMM de YYYY">DD de MMMM de YYYY (Ej: 25 de Marzo de 2026)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (Universal)</option>
            </select>
          </div>
        </div>

        {/* Único Botón de Respaldo JSON */}
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8 text-center">
           <div className="w-16 h-16 bg-[#8B6F47]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Download size={28} className="text-[#8B6F47]" />
           </div>
           <h3 className="text-base font-bold text-gray-800 mb-2 uppercase tracking-tight">Respaldo Maestro de Configuración</h3>
           <p className="text-xs text-gray-400 font-medium mb-8 max-w-sm mx-auto">
            Guarda una copia de seguridad oficial de los ajustes de tu huerto en un archivo JSON seguro.
           </p>
           
           <button
              onClick={handleExportData}
              className="inline-flex items-center justify-center gap-3 px-10 py-4 bg-[#8B6F47] text-white rounded-2xl font-bold hover:bg-[#6b5436] transition-all transform active:scale-95 group shadow-lg shadow-[#8B6F47]/20"
            >
              <Download size={18} className="group-hover:scale-110 transition-transform" />
              Generar Backup JSON
            </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}