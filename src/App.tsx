import { useState } from 'react'
import { RecordTab } from './components/RecordTab'
import { AnalysisTab } from './components/AnalysisTab'

type Tab = 'record' | 'analysis'

export default function App() {
  const [tab, setTab] = useState<Tab>('record')

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="mx-auto max-w-md px-4 pt-6 pb-10">
        <h1 className="mb-5 text-center text-xl font-bold text-orange-500 tracking-wide">
          イラパトログ
        </h1>

        <div className="mb-5 flex rounded-xl bg-white shadow-sm overflow-hidden border border-gray-100">
          {(['record', 'analysis'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                tab === t
                  ? 'bg-orange-400 text-white'
                  : 'text-gray-500 hover:bg-orange-50'
              }`}
            >
              {t === 'record' ? '記録' : '分析'}
            </button>
          ))}
        </div>

        {tab === 'record' && <RecordTab />}
        {tab === 'analysis' && <AnalysisTab />}
      </div>
    </div>
  )
}
