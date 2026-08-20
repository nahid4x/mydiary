import { DiaryForm } from '@/components/diary/diary-form'

export const metadata = { title: 'New Entry — MyDiary' }

export default function NewEntryPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900">New Entry</h1>
        <p className="text-gray-500 mt-1 text-sm">Take a moment to capture what&apos;s on your mind.</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <DiaryForm />
      </div>
    </div>
  )
}
