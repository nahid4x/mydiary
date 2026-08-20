// app/api/ai/improve/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { improveText } from '@/lib/ai'

const VALID_MODES = ['grammar', 'improve', 'structure', 'clear', 'shorten', 'expand']
const MAX_TEXT_LENGTH = 8000

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 })
  }

  const { text, mode, tone } = body || {}

  if (!text || typeof text !== 'string' || !text.trim()) {
    return NextResponse.json({ success: false, error: 'Text is required' }, { status: 400 })
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      { success: false, error: `Text too long (max ${MAX_TEXT_LENGTH} characters)` },
      { status: 400 }
    )
  }

  if (!VALID_MODES.includes(mode)) {
    return NextResponse.json({ success: false, error: 'Invalid mode' }, { status: 400 })
  }

  try {
    const result = await improveText(text.trim(), mode, tone)

    return NextResponse.json({
      success: true,
      data: {
        originalText: text,
        improvedText: result.improvedText,
        changes: result.changes,
        mode: result.mode,
      },
    })
  } catch (err) {
    // Never leak provider errors or API keys to the client
    console.error('[AI improve] all providers failed')
     console.error('[AI improve] all providers failed:', err.message)
    return NextResponse.json(
      { success: false, error: "Unable to improve the writing right now." },
      { status: 502 }
    )
  }
}