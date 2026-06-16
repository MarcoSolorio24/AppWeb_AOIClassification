import ImageUploader from '../../components/aoi/ImageUploader'
import PredictionResult from '../../components/aoi/PredictionResult'
import useAoi from '../../hooks/aoi/useAoi'

export default function AoiPage() {
  const {
    previewUrl,
    result,
    serviceStatus,
    classes,
    loading,
    initialLoading,
    error,
    folderStatus,
    handleNextImage,
    handleFinishBatch,
    loadInitialData,
  } = useAoi()

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 bg-[#003588] p-6 text-white shadow-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-blue-100">AOI</p>
              <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
                Clasificador de imágenes
              </h1>
              <p className="mt-3 max-w-3xl text-sm text-blue-50 sm:text-base">
                Analiza imágenes de la carpeta configurada y visualiza la clasificación generada por el modelo de TensorFlow.
              </p>
            </div>

            <div className="flex justify-end">
              <img
                src="/public/KOSTAL_LOGO.png"
                alt="Kostal"
                className="h-18 w-auto object-contain sm:h-16"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={loadInitialData}
            disabled={loading || initialLoading}
            className="bg-white px-4 py-2 text-sm font-semibold text-[#003588] shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {initialLoading ? 'Verificando...' : 'Verificar backend'}
          </button>

          {serviceStatus && (
            <span
              className={`px-3 py-1 text-xs font-semibold ${
                serviceStatus.modelo_cargado
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {serviceStatus.modelo_cargado
                ? 'Modelo cargado correctamente'
                : 'Modelo no cargado'}
            </span>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ImageUploader
            previewUrl={previewUrl}
            loading={loading}
            folderStatus={folderStatus}
            onNext={handleNextImage}
            onFinish={handleFinishBatch}
          />

          <PredictionResult
            result={result}
            loading={loading || initialLoading}
            serviceStatus={serviceStatus}
            classes={classes}
          />
        </div>
      </div>
    </div>
  )
}