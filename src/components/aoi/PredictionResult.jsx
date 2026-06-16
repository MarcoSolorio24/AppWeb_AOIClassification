import LoadingSpinner from './LoadingSpinner'

function ScoreBar({ label, value }) {
  const barColor =
    String(label).toUpperCase() === 'BUENA' ? 'bg-emerald-500' : 'bg-rose-500'

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500">{Number(value).toFixed(2)}%</span>
      </div>

      <div className="h-2 overflow-hidden bg-slate-200">
        <div
          className={`h-full ${barColor}`}
          style={{ width: `${Math.min(Number(value), 100)}%` }}
        />
      </div>
    </div>
  )
}

export default function PredictionResult({
  result,
  loading,
  serviceStatus,
  classes,
}) {
  const modelReady = serviceStatus?.modelo_cargado
  const label = result?.prediccion?.toUpperCase()

  const resultColor =
    label === 'BUENA' ? 'text-emerald-600' : 'text-rose-600'

  return (
    <div className="border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Resultado</h2>
          <p className="mt-1 text-sm text-slate-500">
            Estado del backend y respuesta del clasificador.
          </p>
        </div>

        <span
          className={`px-3 py-1 text-xs font-semibold ${
            modelReady
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-amber-100 text-amber-700'
          }`}
        >
          {modelReady ? 'Modelo listo' : 'Modelo no disponible'}
        </span>
      </div>

      <div className="mb-6 bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-700">Clases disponibles</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(classes || []).map((item) => (
            <span
              key={item}
              className="bg-blue-100 px-3 py-1 text-xs font-semibold text-[#003588]"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : !result ? (
        <div className="border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-slate-600">
            Aún no hay una predicción. Presiona
            <span className="font-semibold"> Next</span> para analizar.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Predicción</p>
              <p className={`mt-2 text-3xl font-bold ${resultColor}`}>
                {result.prediccion}
              </p>
            </div>

            <div className="border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Confianza</p>
              <p className="mt-2 text-3xl font-bold text-slate-800">
                {Number(result.confianza).toFixed(2)}%
              </p>
            </div>
          </div>

          <div className="mt-6 border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Archivo</p>
            <p className="mt-1 font-medium text-slate-800">{result.archivo}</p>
          </div>

          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">
              Probabilidades por clase
            </h3>

            {result.scores?.map((item) => (
              <ScoreBar
                key={item.clase}
                label={item.clase}
                value={item.probabilidad}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}