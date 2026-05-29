import { useState } from 'react'
import { loadLogs, saveLog, deleteLog } from '../storage'
import type { IraLog } from '../types'
import { VoiceInputButton } from './VoiceInputButton'

export function RecordTab() {
  const [text, setText] = useState('')
  const [detail, setDetail] = useState('')
  const [showDetail, setShowDetail] = useState(false)
  const [logs, setLogs] = useState<IraLog[]>(() => loadLogs())

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return

    const log: IraLog = {
      id: crypto.randomUUID(),
      text: trimmed,
      ...(detail.trim() ? { detail: detail.trim() } : {}),
      createdAt: new Date().toISOString(),
    }
    saveLog(log)
    setLogs(loadLogs())
    setText('')
    setDetail('')
    setShowDetail(false)
  }

  function handleDelete(id: string) {
    deleteLog(id)
    setLogs(loadLogs())
  }

  function formatDate(iso: string) {
    const d = new Date(iso)
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <textarea
          className="w-full rounded-xl border border-gray-200 bg-white p-3 text-base leading-relaxed shadow-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 resize-none"
          rows={3}
          placeholder="何にイライラした？（一言でOK）"
          value={text}
          onChange={e => setText(e.target.value)}
          autoFocus
        />
        <button
          type="button"
          onClick={() => setShowDetail(v => !v)}
          className="self-start text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          {showDetail ? '▲ 詳細を閉じる' : '▼ 詳細を追加（任意）'}
        </button>

        {showDetail && (
          <textarea
            className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm leading-relaxed shadow-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 resize-none text-gray-600"
            rows={3}
            placeholder="状況・背景など（任意）"
            value={detail}
            onChange={e => setDetail(e.target.value)}
          />
        )}

        <div className="flex items-center justify-between">
          <VoiceInputButton onResult={transcript => setText(transcript)} />
          <button
            type="submit"
            disabled={!text.trim()}
            className="rounded-xl bg-orange-400 px-6 py-2 text-white font-medium shadow-sm hover:bg-orange-500 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            記録する
          </button>
        </div>
      </form>

      {logs.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-gray-400">{logs.length} 件</p>
          {logs.map(log => (
            <div
              key={log.id}
              className="flex items-start gap-2 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 break-words">{log.text}</p>
                {log.detail && (
                  <p className="mt-1 text-xs text-gray-500 break-words whitespace-pre-wrap">{log.detail}</p>
                )}
                <p className="mt-0.5 text-xs text-gray-400">{formatDate(log.createdAt)}</p>
              </div>
              <button
                onClick={() => handleDelete(log.id)}
                className="shrink-0 text-gray-300 hover:text-red-400 transition-colors text-lg leading-none"
                aria-label="削除"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {logs.length === 0 && (
        <p className="text-center text-sm text-gray-400 mt-4">まだ記録がありません</p>
      )}
    </div>
  )
}
