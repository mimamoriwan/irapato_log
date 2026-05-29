export type Group = {
  label: string
  count: number
  logs: string[]
}

export type AnalysisResult = {
  groups: Group[]
}

export async function analyzeIraLogs(logs: string[]): Promise<AnalysisResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined
  if (!apiKey) throw new Error('VITE_GEMINI_API_KEY が設定されていません')

  const prompt = `以下はユーザーが記録した日常のイライラのログです。
表現が異なっていても、意味・文脈が近いものを同じグループにまとめてください。

出力はJSON形式で、以下の構造にしてください：
{
  "groups": [
    {
      "label": "グループ名（10字以内）",
      "count": 件数,
      "logs": ["ログ1", "ログ2", ...]
    }
  ]
}

グループは件数の多い順に並べてください。
JSONのみ出力し、前置きや説明は不要です。

--- ログ一覧 ---
${logs.join('\n')}`

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  )

  if (!res.ok) throw new Error(`Gemini API エラー: ${res.status}`)

  const data = await res.json() as {
    candidates?: { content?: { parts?: { text?: string }[] } }[]
  }
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

  // ```json ... ``` で囲まれている場合も抽出できるよう最外のオブジェクトを取り出す
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('レスポンスのJSONパースに失敗しました')

  return JSON.parse(match[0]) as AnalysisResult
}
