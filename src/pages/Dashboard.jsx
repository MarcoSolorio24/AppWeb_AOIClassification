import React from 'react';

const Dashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Visión General</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-medium text-gray-800">Métrica {idx + 1}</h3>
            <p className="text-gray-500 mt-2">Descripción de prueba para verificar el layout y scroll.</p>
            <div className="mt-4 text-3xl font-bold text-gray-900">
              {Math.floor(Math.random() * 1000)}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-96">
        <h3 className="text-lg font-medium text-gray-800">Gráfico de Prueba</h3>
        <p className="text-gray-500">Contenido extenso para probar el comportamiento del scroll vertical.</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-96">
        <h3 className="text-lg font-medium text-gray-800">Tabla de Prueba</h3>
        <p className="text-gray-500">Contenido secundario para probar el scroll.</p>
      </div>

      <div className="flex justify-start">
        <a
          href="http://mxquaml001.mx.kostal.int:3000/goto/b8hu-poDR?orgId=1"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition-colors"
        >
          Abrir Dashboard Grafana
        </a>
      </div>
    </div>
  );
};

export default Dashboard;
