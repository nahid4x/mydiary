// lib/ai.js
// Handles AI provider calls with automatic fallback: Groq -> Gemini -> OpenRouter

const SYSTEM_PROMPT = `You are MyDiary AI, a private writing assistant built into a personal diary application.

Your job is to improve the user's diary writing while preserving their authentic voice.

The user's diary may contain personal experiences, emotions, memories, informal language,
mixed sentence structures, grammar and spelling mistakes, or short/incomplete thoughts.

Improve readability without changing what the user is trying to say.

STRICT RULES:
- Never invent facts, events, people, conversations, or emotions.
- Never change the user's meaning or opinion.
- Preserve important names, dates, places, and details.
- Preserve first-person perspective when appropriate.
- Preserve the emotional tone.
- Keep the writing personal and natural — not overly formal.
- Do not criticize the user's writing or provide psychological analysis.
- Do not add information not supported by the user's text.
- Do not remove important emotional or factual details.
- If the original text is already clear, make minimal changes.
- If the text is extremely short, do not unnecessarily expand it.

The selected mode determines the type of transformation:
grammar: Only fix grammar, spelling, punctuation, and capitalization.
improve: Improve grammar, wording, sentence flow, readability, and repetition while preserving the original voice.
structure: Organize thoughts into a natural, logical structure (Context -> What happened -> Feelings -> Reflection) without forcing it if it doesn't fit.
clear: Make the writing easier to understand while keeping the same personality and meaning.
shorten: Make the writing more concise while preserving important information and emotions.
expand: Expand existing ideas naturally, but NEVER invent new events, facts, people, or emotions.

Language: auto-detect and respond in the same language/style the user wrote in (English, Bangla, Banglish, etc). Do not translate.

Return ONLY valid JSON in this exact structure, with no markdown fences, no extra text:
{"improvedText": "...", "changes": ["...", "..."], "mode": "..."}`

function buildUserPrompt(text, mode, tone) {
  return `Mode: ${mode}${tone ? `\nTone: ${tone}` : ''}\n\nDiary text:\n"""${text}"""`
}

function extractJson(raw) {
  if (!raw) return null
  const cleaned = raw.trim().replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```$/, '')
  try {
    return JSON.parse(cleaned)
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        return JSON.parse(match[0])
      } catch {
        return null
      }
    }
    return null
  }
}

function validateResult(parsed, mode) {
  if (!parsed || typeof parsed.improvedText !== 'string' || !Array.isArray(parsed.changes)) {
    return null
  }
  return {
    improvedText: parsed.improvedText,
    changes: parsed.changes.filter((c) => typeof c === 'string').slice(0, 10),
    mode: parsed.mode || mode,
  }
}

// NOTE: verify current valid model IDs periodically — providers rotate free-tier
// and deprecate models frequently. Check:
//   Groq:       console.groq.com/docs/models
//   Gemini:     ai.google.dev/gemini-api/docs/models
//   OpenRouter: openrouter.ai/models?max_price=0

async function callGemini(userPrompt) {
  const key = process.env.GEMINI_API_KEY
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash'
  if (!key) throw new Error('Gemini not configured')

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: { temperature: 0.4 },
      }),
      // Gemini can be slower to first-byte than Groq; give it more room
      // than Groq but don't let it stall the whole request forever.
      signal: AbortSignal.timeout(10000),
    }
  )

  if (!res.ok) {
    const errBody = await res.text()
    throw new Error(`Gemini error: ${res.status} - ${errBody}`)
  }

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Gemini returned no content')
  return text
}

async function callGroq(userPrompt) {
  const key = process.env.GROQ_API_KEY
  const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b'
  if (!key) throw new Error('Groq not configured')

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.4,
    }),
    // Groq's LPU inference is normally sub-second to a couple seconds.
    // Tightened from 8000 -> 5000 so a bad/hanging request fails fast
    // and falls through to the next provider quickly.
    signal: AbortSignal.timeout(5000),
  })

  if (!res.ok) {
    const errBody = await res.text()
    throw new Error(`Groq error: ${res.status} - ${errBody}`)
  }

  const data = await res.json()
  const text = data?.choices?.[0]?.message?.content
  if (!text) throw new Error('Groq returned no content')
  return text
}

async function callOpenRouter(userPrompt) {
  const key = process.env.OPENROUTER_API_KEY
  const model = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.2-3b-instruct'
  if (!key) throw new Error('OpenRouter not configured')

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.4,
    }),
    signal: AbortSignal.timeout(15000), // OpenRouter can be slow, give it more time
  })

  if (!res.ok) {
    const errBody = await res.text()
    throw new Error(`OpenRouter error: ${res.status} - ${errBody}`)
  }

  const data = await res.json()
  const text = data?.choices?.[0]?.message?.content
  if (!text) throw new Error('OpenRouter returned no content')
  return text
}

// Reordered: Groq first (fastest, most reliable), Gemini second, OpenRouter last.
// This matters for the sequential fallback loop below — the common case (Groq
// succeeds) now returns almost immediately instead of waiting through a slower
// or misconfigured provider first.
const PROVIDERS = [
  { name: 'groq', call: callGroq },
  { name: 'gemini', call: callGemini },
  { name: 'openrouter', call: callOpenRouter },
]

export async function improveText(text, mode, tone) {
  const userPrompt = buildUserPrompt(text, mode, tone)
  const errors = []

  for (const provider of PROVIDERS) {
    try {
      const raw = await provider.call(userPrompt)
      const parsed = extractJson(raw)
      const validated = validateResult(parsed, mode)
      if (validated) {
        return { ...validated, provider: provider.name }
      }
      errors.push(`${provider.name}: invalid response format`)
    } catch (err) {
      errors.push(`${provider.name}: ${err.message}`)
      continue
    }
  }

  throw new Error(`All AI providers failed: ${errors.join(' | ')}`)
}