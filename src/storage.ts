import type { IraLog } from './types'

const KEY = 'ira-logs'

export function loadLogs(): IraLog[] {
  const raw = localStorage.getItem(KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as IraLog[]
  } catch {
    return []
  }
}

export function saveLog(log: IraLog): void {
  const logs = loadLogs()
  localStorage.setItem(KEY, JSON.stringify([log, ...logs]))
}

export function deleteLog(id: string): void {
  const logs = loadLogs().filter(l => l.id !== id)
  localStorage.setItem(KEY, JSON.stringify(logs))
}
