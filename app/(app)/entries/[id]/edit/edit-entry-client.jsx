'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { DiaryForm } from '@/components/diary/diary-form'

export function EditEntryClient({ diary }) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href={`/entries/${diary.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to entry
        </Link>
        <h1 className="text-3xl font-serif font-bold text-gray-900">Edit Entry</h1>
        <p className="text-gray-500 mt-1 text-sm">Make changes to your diary entry.</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <DiaryForm initialData={diary} isEdit />
      </div>
    </div>
  )
}
