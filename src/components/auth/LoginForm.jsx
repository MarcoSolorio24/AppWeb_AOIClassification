import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [nomina, setNomina] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!nomina.trim() || !password.trim()) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    setIsSubmitting(true);
    try {
      const me = await login(nomina, password);
      if (me.rol === 'ADMIN') {
        navigate('/app');
      } else {
        navigate('/operador');
      }
    } catch (err) {
      setError('Credenciales incorrectas o error de conexión.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5">
      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-gray-500">No. Nómina</label>
        <input
          type="text"
          value={nomina}
          onChange={(e) => setNomina(e.target.value)}
          placeholder="Ej. 12345"
          autoComplete="username"
          className="w-full rounded-none border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-[#003588] focus:outline-none"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-gray-500">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Ingrese su contraseña"
          autoComplete="current-password"
          className="w-full rounded-none border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-[#003588] focus:outline-none"
          required
        />
      </div>

      {error && (
        <div className="rounded-none border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-none bg-[#003588] px-4 py-3 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#002255] disabled:opacity-60 flex items-center justify-center"
      >
        {isSubmitting && (
          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
        )}
        {isSubmitting ? 'Verificando...' : 'Iniciar Sesión'}
      </button>
    </form>
  );
};

export default LoginForm;
