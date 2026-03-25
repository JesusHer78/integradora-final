import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Globe, Sliders, Save, MapPin, Building2, Calendar, Download, Upload, Check, AlertCircle } from 'lucide-react';

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

  // Protección de Ruta: Solo Admin (como refuerzo)
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
          // Guardamos el formato de fecha aunque el backend no lo use explícitamente aún
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

  const handleExportData = () => {
    const backupData = {
      ...settings,
      exportDate: new Date().toISOString(),
      appName: "Tetlalli"
    };
    
    const dataStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // Nombre de archivo descriptivo: tetlalli_config_NombreDelHuerto.json
    const safeName = settings.farmName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    link.download = `tetlalli_config_${safeName}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (imported.farmName && imported.location) {
          setSettings(prev => ({ 
            ...prev, 
            farmName: imported.farmName,
            location: imported.location,
            dateFormat: imported.dateFormat || prev.dateFormat
          }));
          setSuccessMessage('Configuración cargada. Pulsa "Guardar" para aplicar.');
          setTimeout(() => setSuccessMessage(''), 4000);
        } else {
          throw new Error("Formato inválido");
        }
      } catch (err) {
        alert('El archivo no es una configuración válida de Tetlalli');
      }
    };
    reader.readAsText(file);
  };

  if (user && user.role !== 'admin') return null;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#8B6F47] to-[#6b5436] rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform">
            <Sliders size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#4B3621]">
              Ajustes del Sistema
            </h1>
            <p className="text-xs text-[#8b6f47] font-medium tracking-wide uppercase">
              Configuración Maestra del Huerto
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {successMessage && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl text-xs font-bold border border-green-100 animate-fadeIn">
              <Check size={14} />
              {successMessage}
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl text-xs font-bold border border-red-100 animate-fadeIn">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#5c4731] hover:bg-[#4B3621] text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
            <span>Guardar cambios</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Información del Huerto */}
        <div className="bg-white rounded-3xl border border-[#fbefe1] shadow-sm p-6 sm:p-8 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-[#8B6F47]/10 rounded-xl">
              <Building2 size={20} className="text-[#8B6F47]" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 font-serif">Identidad del Huerto Escolar</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                Nombre Oficial
              </label>
              <input
                type="text"
                value={settings.farmName}
                onChange={(e) => handleChange('farmName', e.target.value)}
                className="w-full px-5 py-4 bg-[#fffaf8] border border-[#fbefe1] rounded-2xl focus:ring-4 focus:ring-[#8B6F47]/10 focus:border-[#8B6F47] transition-all text-gray-700 font-medium placeholder:text-gray-300"
                placeholder="Ej: Tetlalli - Huerto UTT"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                Ubicación Regional
              </label>
              <input
                type="text"
                value={settings.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full px-5 py-4 bg-[#fffaf8] border border-[#fbefe1] rounded-2xl focus:ring-4 focus:ring-[#8B6F47]/10 focus:border-[#8B6F47] transition-all text-gray-700 font-medium placeholder:text-gray-300"
                placeholder="Ej: Tlaxcala, México"
              />
            </div>
          </div>
        </div>

        {/* Formatos Regionales */}
        <div className="bg-white rounded-3xl border border-[#fbefe1] shadow-sm p-6 sm:p-8 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-[#8B6F47]/10 rounded-xl">
              <Calendar size={20} className="text-[#8B6F47]" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 font-serif">Formatos Regionales</h3>
          </div>

          <div className="max-w-md">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                Formato de fecha (Estilo México)
              </label>
              <select
                value={settings.dateFormat}
                onChange={(e) => handleChange('dateFormat', e.target.value)}
                className="w-full px-5 py-4 bg-[#fffaf8] border border-[#fbefe1] rounded-2xl focus:ring-4 focus:ring-[#8B6F47]/10 focus:border-[#8B6F47] transition-all text-gray-700 font-bold appearance-none cursor-pointer"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (Ej: 25/03/2026)</option>
                <option value="DD de MMMM de YYYY">DD de MMMM de YYYY (Ej: 25 de Marzo de 2026)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (Estándar)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Datos y Respaldo */}
        <div className="bg-white rounded-3xl border border-[#fbefe1] shadow-sm p-6 sm:p-8 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-[#8B6F47]/10 rounded-xl">
              <Download size={20} className="text-[#8B6F47]" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 font-serif">Respaldo Maestro</h3>
          </div>

          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            Mantén tu configuración segura. Exporta los ajustes actuales del huerto a un archivo JSON para poder restaurarlos más tarde si es necesario.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={handleExportData}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-[#fbefe1] text-[#5c4731] rounded-2xl font-bold hover:bg-[#8B6F47] hover:text-white hover:border-[#8B6F47] transition-all transform active:scale-95 group"
            >
              <Download size={18} className="group-hover:scale-110 transition-transform" />
              Exportar JSON
            </button>

            <label className="cursor-pointer group">
              <div className="flex items-center justify-center gap-3 px-6 py-4 bg-[#8B6F47]/5 border-2 border-dashed border-[#8B6F47]/20 text-[#8B6F47] rounded-2xl font-bold group-hover:bg-[#8B6F47] group-hover:text-white group-hover:border-[#8B6F47] transition-all transform active:scale-95">
                <Upload size={18} className="group-hover:scale-110 transition-transform" />
                Importar JSON
              </div>
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
          </div>
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