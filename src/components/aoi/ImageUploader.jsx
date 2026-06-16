export default function ImageUploader({
  previewUrl,
  loading,
  folderStatus,
  onNext,
  onFinish,
}) {
  return (
    <div className="border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-slate-800">Imagen actual</h2>
        <p className="mt-1 text-sm text-slate-500">
          Presiona Next para analizar la siguiente imagen
        </p>

        {folderStatus && (
          <div className="mt-3 text-sm text-slate-600">
            <p><strong>Lote:</strong> {folderStatus.batch_name}</p>
            <p>
              <strong>Imagen:</strong> {folderStatus.current_index} de {folderStatus.total_images}
            </p>
          </div>
        )}
      </div>

      <div className="flex min-h-[320px] items-center justify-center border border-dashed border-slate-300 bg-slate-50 p-6">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Imagen actual"
            className="max-h-[280px] w-full object-contain"
          />
        ) : (
          <p className="text-slate-500">No hay imagen disponible.</p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onNext}
          disabled={loading || !previewUrl}
          className="border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-[#003588] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        >
          {loading ? 'Procesando...' : 'Next →'}
        </button>

       <button
          type="button"
          onClick={onFinish}
          disabled={loading || !previewUrl || folderStatus?.current_index !== folderStatus?.total_images}
          className="bg-[#003588] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#002255] disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Finalizado
      </button>
      </div>
    </div>
  )
}