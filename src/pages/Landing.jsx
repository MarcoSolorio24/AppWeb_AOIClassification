import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/auth/LoginForm';

const Landing = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-gray-300 border-t-[#003588] animate-spin" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    if (user.rol === 'ADMIN') return <Navigate to="/app" replace />;
    return <Navigate to="/operador" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100 lg:grid lg:grid-cols-2">
      <div
        className="hidden lg:flex min-h-screen items-end bg-cover bg-center"
        style={{ backgroundImage: "url('/landing.png')" }}
      >
        <div className="w-full bg-black/40 p-10">
          <div className="max-w-md">
            <h1 className="text-4xl font-black uppercase tracking-[0.14em] text-white">Plantilla kostal web</h1>
            <p className="mt-3 text-sm text-gray-200">
              Plantilla
            </p>
          </div>
        </div>
      </div>

      <div className="flex min-h-screen flex-col bg-white">
        <header className="border-b border-gray-200 px-8 py-6">
          <img src="/KOSTAL_LOGO.png" alt="Kostal Logo" className="h-10 w-auto object-contain" />
        </header>

        <main className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <div className="text-xs font-bold uppercase tracking-[0.24em] text-[#003588]">Acceso Seguro</div>
              <h2 className="mt-2 text-3xl font-black uppercase tracking-wide text-gray-900">Iniciar Sesión</h2>
              <p className="mt-2 text-sm text-gray-500">Ingresa tus credenciales para acceder al sistema.</p>
            </div>
            <LoginForm />
          </div>
        </main>

        <footer className="border-t border-gray-200 bg-gray-50 px-8 py-4 text-xs font-medium uppercase tracking-widest text-gray-500">
          2026 Plantilla Kostal v1.0
        </footer>
      </div>
    </div>
  );
};

export default Landing;
