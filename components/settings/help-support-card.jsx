'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LifeBuoy, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ReportIssueModal } from '@/components/settings/report-issue-modal'

export function HelpSupportCard() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <div className="bg-white rounded-[22px] border border-[#ECE8DF] p-6">
        <div className="flex items-center gap-2 mb-1">
          <LifeBuoy className="w-5 h-5 text-[#FF7A45]" />
          <h2 className="font-serif font-semibold text-[17px] text-[#17181C]">Help & Support</h2>
        </div>
        <p className="text-[13.5px] text-[#8A8E96] mb-4">
          Need help? Report bugs, suggest improvements, or contact our team.
        </p>

        <div className="flex gap-2">
          <Button
            onClick={() => setModalOpen(true)}
            className="gap-2 h-11 px-5 rounded-xl font-semibold border-0 text-white transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg,#FF7A45,#FF9A62)',
              boxShadow: '0 8px 20px -6px rgba(255,122,69,0.4)',
            }}
          >
            <LifeBuoy className="w-4 h-4" />
            Report an Issue
          </Button>

          <Link
            href="/settings/reports"
            className="inline-flex items-center gap-2 h-11 px-5 rounded-xl text-[13.5px] font-medium text-[#3A3D45] border border-[#ECE8DF] hover:bg-[#F5F2EA] transition-colors duration-300"
          >
            <FileText className="w-4 h-4" />
            My Reports
          </Link>
        </div>
      </div>

      <ReportIssueModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}