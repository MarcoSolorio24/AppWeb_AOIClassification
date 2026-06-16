import React, { useState } from 'react';
import { LayoutDashboard, Folder, ChevronDown, ChevronRight, FileText, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 h-full flex flex-col bg-white border-r border-gray-200 shrink-0">
      <div className="h-16 flex items-center justify-center px-6 border-b border-gray-200 shrink-0">
        <img src="/KOSTAL_LOGO.png" alt="Kostal Logo" className="h-8 object-contain" />
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <Link
          to="/app"
          className="flex items-center px-3 py-2 text-sm font-medium rounded-none text-gray-900 bg-gray-100 hover:bg-gray-200"
        >
          <LayoutDashboard className="mr-3 h-5 w-5 text-gray-500" />
          Dashboard
        </Link>

        <div>
          <button
            onClick={() => setIsCatalogOpen(!isCatalogOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-none text-gray-700 hover:bg-gray-100"
          >
            <div className="flex items-center">
              <Folder className="mr-3 h-5 w-5 text-gray-400" />
              Catálogos
            </div>
            {isCatalogOpen ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
          </button>

          {isCatalogOpen && (
            <div className="mt-1 space-y-1 pl-11 pr-3">
              <Link
                to="/app/catalogos/turnos"
                className="block px-3 py-2 text-sm font-medium rounded-none text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <FileText className="inline-block mr-2 h-4 w-4" /> Turnos
              </Link>
            </div>
          )}
        </div>
      </nav>

      <div className="border-t border-gray-200 p-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-0">
            {user ? (
              <>
                <div className="h-8 w-8 rounded-none bg-[#003588] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {`${(user.nombre || '').charAt(0)}${(user.apellido_paterno || '').charAt(0)}`.toUpperCase() || 'UD'}
                </div>
                <div className="ml-3 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {`${user.nombre || ''} ${user.apellido_paterno || ''}`.trim() || 'Usuario Demo'}
                  </p>
                  <p className="text-xs font-medium text-gray-500 truncate">{user.rol || ''}</p>
                </div>
              </>
            ) : (
              <>
                <div className="h-8 w-8 rounded-none bg-[#003588] text-white flex items-center justify-center text-xs font-bold shrink-0">UD</div>
                <div className="ml-3 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">Usuario</p>
                  <p className="text-xs font-medium text-gray-500 truncate">Invitado</p>
                </div>
              </>
            )}
          </div>
          <button
            onClick={logout}
            title="Cerrar sesion"
            className="p-1.5 text-gray-400 hover:text-[#003588] hover:bg-blue-50 transition-colors rounded-none focus:outline-none shrink-0"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
