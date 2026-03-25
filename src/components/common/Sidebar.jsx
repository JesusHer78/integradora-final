import { LayoutDashboard, Sprout, BarChart3, Users, Settings, ChevronLeft, LogOut, Home } from 'lucide-react';
import logo from '../../assets/logo.png';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ currentPage, onNavigate, role = 'admin', isOpen, onClose, onLogout }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menu = [
    { id: 'dashboard', label: 'Inicio', icon: <LayoutDashboard size={20} /> },
    { id: 'cultivos', label: 'Cultivos', icon: <Sprout size={20} /> },
    { id: 'reportes', label: 'Reportes', icon: <BarChart3 size={20} /> },
  ];

  if (role === 'admin') {
    menu.push({ id: 'usuarios', label: 'Usuarios', icon: <Users size={20} /> });
  }

  menu.push({ id: 'ajustes', label: 'Ajustes', icon: <Settings size={20} /> });

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
  `;

  const navItemClasses = (isActive) => `
    w-full flex items-center gap-3.5 px-4 py-3 rounded-[14px]
    text-sm font-medium transition-all duration-250 ease
    ${isActive 
      ? 'bg-white text-[#8b6f47] shadow-[0_6px_18px_rgba(139,111,71,0.12)]'
      : 'text-gray-500 hover:bg-[rgba(139,111,71,0.08)] hover:text-[#5c4731]'
    }
  `;

  const footerClasses = `
    mt-auto pt-6 border-t
    border-[rgba(139,111,71,0.15)]
  `;

  const avatarClasses = `
    w-[38px] h-[38px] rounded-xl bg-[#8b6f47] text-white font-semibold
    flex items-center justify-center shadow-sm
  `;

  const userNameClasses = `
    text-sm font-semibold
    text-[#5c4731]
  `;

  const userRoleClasses = `
    text-xs
    text-gray-400
  `;

  return (
    <>
      {/* Overlay con blur mejorado para móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden animate-fadeIn"
          onClick={onClose}
        />
      )}

      <aside className={sidebarClasses}>
        <div className="flex items-center gap-3 mb-10">
          <img src={logo} alt="Tetlalli" className="w-[38px] h-[38px] rounded-xl object-cover" />
          <h1 className={headerTitleClasses}>{user?.farmName || "Tetlalli"}</h1>
          <button
            onClick={onClose}
            className="absolute top-8 right-4 p-2 lg:hidden hover:bg-black/5 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-500" />
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-2 overflow-y-auto">
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
                <span className="px-2 py-1 rounded-lg text-xs font-medium bg-[#8b6f47]/10 text-[#8b6f47]">
                  Admin
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className={footerClasses}>
          <div className="flex items-center gap-3">
            <div className={avatarClasses}>
              {user?.name?.[0] || "U"}
            </div>
            <div className="flex flex-col">
              <span className={userNameClasses}>{user?.name || "Invitado"}</span>
              <span className={userRoleClasses}>{user?.role || "Usuario"}</span>
            </div>
            <button 
              onClick={() => {
                if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
                  logout();
                  if (onLogout) onLogout();
                }
              }}
              className="ml-auto p-2 hover:bg-black/5 rounded-lg transition-colors group"
              title="Cerrar sesión"
            >
              <LogOut size={16} className="text-gray-400 group-hover:text-red-500 transition-colors" />
            </button>
          </div>
        </div>
      </aside>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out forwards;
        }
      `}</style>
    </>
  );
}