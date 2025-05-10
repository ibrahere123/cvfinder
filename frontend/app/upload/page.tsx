"use client"

import { useState } from "react"
import { ResumeUploader } from "../../components/resume-uploader"
import { UploadHistory } from "../../components/upload-history"

export default function UploadPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleUploadComplete = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Bulk Resume Upload</h1>
      <p className="text-gray-600 mb-8">
        Upload multiple resumes at once to be processed by our AI ranking system. Supported formats: PDF, DOCX, DOC,
        RTF, TXT.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ResumeUploader onUploadComplete={handleUploadComplete} />
        </div>
        <div className="lg:col-span-1">
          <UploadHistory refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  )
}
