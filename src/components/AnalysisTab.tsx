import { useState } from 'react'
import { loadLogs } from '../storage'
import { analyzeIraLogs } from '../gemini'
import type { AnalysisResult } from '../gemini'
import { LoadingSpinner } from './LoadingSpinner'

function stars(count: number): string {
  const filled = Math.min(count, 5)
  return '★'.repeat(filled) + '☆'.repeat(5 - filled)
}

export function AnalysisTab() {
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAnalyze() {
    const logs = loadLogs()
    if (logs.length === 0) {
      setError('記録がまだありません。先に記録タブでイライラを記録してください。')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const texts = logs.map(l => l.text)
      const data = await analyzeIraLogs(texts)
      setResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : '分析中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="rounded-xl bg-orange-400 px-8 py-3 text-white font-medium shadow-sm hover:bg-orange-500 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          分析する
        </button>
        <p className="text-xs text-gray-400">全ログをAIに送信してグルーピングします</p>
      </div>

      {loading && <LoadingSpinner />}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {result && (
        <div className="flex flex-col gap-3">
          {result.groups.map((group, i) => {
            const isSeed = group.count >= 3
            return (
              <div
                key={i}
                className={`rounded-xl border px-4 py-3 ${
                  isSeed
                    ? 'border-orange-200 bg-orange-50'
                    : 'border-gray-100 bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-medium text-sm text-gray-800">
                    {isSeed ? '🌱 ' : ''}{group.label}
                  </span>
                  <span className="shrink-0 text-xs text-gray-400">
                    {group.count}件　{stars(group.count)}
                  </span>
                </div>
                <ul className="flex flex-col gap-0.5">
                  {group.logs.map((log, j) => (
                    <li key={j} className="text-xs text-gray-600">
                      →「{log}」
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
          <p className="text-center text-xs text-gray-400 mt-1">
            🌱 3件以上のグループはアイデアの種として検討する価値があります
          </p>
        </div>
      )}
    </div>
  )
}
