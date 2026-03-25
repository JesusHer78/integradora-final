import { useState } from 'react';
import { LayoutDashboard, Sprout, BarChart3, Users, Settings, ChevronLeft, LogOut, Home, X, AlertCircle } from 'lucide-react';
import logo from '../../assets/logo.png';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Componente para el Modal de Cierre de Sesión Estético
const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#F5F5DC] w-full max-w-sm rounded-[24px] overflow-hidden shadow-2xl border border-[#fbefe1] animate-slideUp">
        <div className="p-8 pb-4 text-center">
          <div className="w-16 h-16 bg-[#8b6f47]/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <AlertCircle size={32} className="text-[#5c4731]" />
          </div>
          <h2 className="text-xl font-bold text-[#4B3621] mb-2 font-serif">¿Seguro que quieres salir de Tetlalli?</h2>
          <p className="text-[#847563] text-sm">Esperamos verte de vuelta pronto en el huerto.</p>
        </div>
        
        <div className="p-6 flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className="w-full bg-[#5c4731] hover:bg-[#4B3621] text-white py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-[#5c4731]/20 active:scale-95 text-sm"
          >
            Sí, salir ahora
          </button>
          <button
            onClick={onClose}
            className="w-full bg-white hover:bg-white/80 text-[#5c4731] py-3.5 rounded-xl font-semibold transition-all duration-300 border border-[#fbefe1] active:scale-95 text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Sidebar({ currentPage, onNavigate, role = 'user', isOpen, onClose, onLogout }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // El menú básico para todos
  const menu = [
    { id: 'dashboard', label: 'Inicio', icon: <LayoutDashboard size={20} /> },
    { id: 'cultivos', label: 'Cultivos', icon: <Sprout size={20} /> },
    { id: 'reportes', label: 'Reportes', icon: <BarChart3 size={20} /> },
  ];

  // Solo Admin ve Usuarios y Ajustes
  if (role === 'admin') {
    menu.push({ id: 'usuarios', label: 'Usuarios', icon: <Users size={20} /> });
    menu.push({ id: 'ajustes', label: 'Ajustes', icon: <Settings size={20} /> });
  }

  const handleLogout = () => {
    logout();
    if (onLogout) onLogout();
    navigate('/');
    setShowLogoutModal(false);
  };

  const sidebarClasses = `
    fixed lg:static inset-y-0 left-0 z-50
    w-[260px] h-screen
    px-6 py-8
    flex flex-col
    transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1)
    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    bg-gradient-to-b from-[#fffaf8] via-[#fbefe1] to-[#f3e5ca] text-gray-800
    shadow-[4px_0_30px_rgba(16,24,40,0.06)]
    lg:shadow-none
  `;

  const headerTitleClasses = `
    text-lg font-semibold
    text-[#5c4731]
    tracking-tight
  `;

  const navItemClasses = (isActive) => `
    w-full flex items-center gap-3.5 px-4 py-3.5 rounded-[16px]
    text-[13px] font-semibold transition-all duration-300
    ${isActive 
      ? 'bg-white text-[#8b6f47] shadow-[0_8px_20px_rgba(139,111,71,0.12)] scale-[1.02]'
      : 'text-gray-500 hover:bg-[rgba(139,111,71,0.06)] hover:text-[#5c4731]'
    }
  `;

  return (
    <>
      <LogoutModal 
        isOpen={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)} 
        onConfirm={handleLogout} 
      />

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden animate-fadeIn"
          onClick={onClose}
        />
      )}

      <aside className={sidebarClasses}>
        <div className="flex items-center gap-3 mb-10 overflow-hidden">
          <img src={logo} alt="Tetlalli" className="w-[40px] h-[40px] rounded-2xl object-cover shadow-sm bg-white p-1" />
          <h1 className={headerTitleClasses}>{user?.farmName || "Tetlalli"}</h1>
          <button
            onClick={onClose}
            className="absolute top-8 right-4 p-2.5 lg:hidden hover:bg-black/5 rounded-xl transition-all"
          >
            <ChevronLeft size={18} className="text-gray-500" />
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-2.5 overflow-y-auto pr-1">
          {menu.map(item => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                if (window.innerWidth < 1024) onClose();
              }}
              className={navItemClasses(currentPage === item.id)}
            >
              <span className={`
                flex items-center transition-colors
                ${currentPage === item.id 
                  ? 'text-[#8b6f47]' 
                  : 'text-gray-400'
                }
              `}>
                {item.icon}
              </span>
              <span className="flex-1 text-left">{item.label}</span>
              {item.id === 'usuarios' && role === 'admin' && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#8b6f47]/10 text-[#8b6f47] uppercase tracking-tighter">
                  Pro
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-[rgba(139,111,71,0.15)] bg-transparent">
          <div className="flex items-center gap-3 p-1">
            <div className="w-[40px] h-[40px] rounded-[14px] bg-[#8b6f47] text-white font-bold flex items-center justify-center shadow-lg shadow-[#8b6f47]/20 border border-white/20">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-bold text-[#5c4731] truncate">{user?.name || "Invitado"}</span>
              <span className="text-[10px] font-medium text-gray-400 capitalize">{user?.role || "Usuario"}</span>
            </div>
            <button 
              onClick={() => setShowLogoutModal(true)}
              className="ml-auto p-2.5 hover:bg-red-50 rounded-xl transition-all duration-300 group shadow-sm bg-white/40 border border-[#fbefe1]"
              title="Cerrar sesión"
            >
              <LogOut size={16} className="text-gray-400 group-hover:text-red-500 transition-colors" />
            </button>
          </div>
        </div>
      </aside>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(15px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </>
  );
}