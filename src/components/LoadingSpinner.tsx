export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center gap-3 py-12">
      <div className="w-8 h-8 rounded-full border-4 border-orange-200 border-t-orange-400 animate-spin" />
      <p className="text-sm text-gray-400">AIが分析中...</p>
    </div>
  )
}
