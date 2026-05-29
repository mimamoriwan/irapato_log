import { useState, useRef } from 'react'

type Props = {
  onResult: (text: string) => void
}

type SpeechRecognitionInstance = {
  lang: string
  interimResults: boolean
  continuous: boolean
  onresult: (e: SpeechRecognitionEvent) => void
  onerror: () => void
  onend: () => void
  start: () => void
  stop: () => void
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance
  }
}

function getSpeechRecognition(): (new () => SpeechRecognitionInstance) | null {
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null
}

export function VoiceInputButton({ onResult }: Props) {
  const [pressing, setPressing] = useState(false)
  const [unsupported, setUnsupported] = useState(false)
  const recogRef = useRef<SpeechRecognitionInstance | null>(null)
  const transcriptRef = useRef('')

  function startRecording() {
    const SpeechRecognition = getSpeechRecognition()
    if (!SpeechRecognition) {
      setUnsupported(true)
      return
    }
    if (recogRef.current) return

    transcriptRef.current = ''
    const recog = new SpeechRecognition()
    recog.lang = 'ja-JP'
    recog.interimResults = true
    recog.continuous = true

    recog.onresult = (e: SpeechRecognitionEvent) => {
      let full = ''
      for (let i = 0; i < e.results.length; i++) {
        full += e.results[i][0].transcript
      }
      transcriptRef.current = full
    }

    recog.onerror = () => {
      setPressing(false)
      recogRef.current = null
    }

    recog.onend = () => {
      setPressing(false)
      const transcript = transcriptRef.current.trim()
      if (transcript) onResult(transcript)
      recogRef.current = null
    }

    recogRef.current = recog
    recog.start()
    setPressing(true)
  }

  function stopRecording() {
    recogRef.current?.stop()
  }

  if (unsupported) return null

  return (
    <button
      type="button"
      aria-label={pressing ? '録音中（離すと確定）' : '押している間、音声入力'}
      onMouseDown={startRecording}
      onMouseUp={stopRecording}
      onMouseLeave={() => { if (pressing) stopRecording() }}
      onTouchStart={e => { e.preventDefault(); startRecording() }}
      onTouchEnd={e => { e.preventDefault(); stopRecording() }}
      className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all select-none ${
        pressing
          ? 'bg-red-500 text-white scale-95 shadow-inner'
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-4 h-4"
      >
        <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z" />
        <path d="M19 11a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.92V20H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-2.08A7 7 0 0 0 19 11Z" />
      </svg>
      {pressing ? '録音中...' : '音声入力'}
    </button>
  )
}
