export default function LoadingSpinner({ text = 'Procesando imagen...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-[#003588]"></div>
      <p className="mt-4 text-sm font-medium text-slate-600">{text}</p>
    </div>
  )
}