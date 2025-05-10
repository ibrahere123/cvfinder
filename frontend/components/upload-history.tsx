"use client"

import React, { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Clock, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "./ui/button"
import Link from "next/link"

type BatchStatus = "processing" | "completed" | "failed" | "partial"

export const fetchBatches = async () => {
  const res = await fetch("http://localhost:8000/recent_uploads", { cache: "no-store" })
  if (!res.ok) {
    throw new Error("Failed to fetch recent uploads")
  }
  const data = await res.json()
  return data.uploads
}

interface BatchProps {
  id: string
  name: string
  date: string
  fileCount: number
  status: BatchStatus
  successCount?: number
  failedCount?: number
  files?: Array<{
    filename: string
    name: string
    metadata: any
  }>
}

function BatchStatusBadge({ status }: { status: BatchStatus }) {
  switch (status) {
    case "processing":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Loader2 className="h-3 w-3 animate-spin mr-1" />
          Processing
        </Badge>
      )
    case "completed":
      return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      )
    case "failed":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <AlertCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      )
    case "partial":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          <AlertCircle className="h-3 w-3 mr-1" />
          Partial
        </Badge>
      )
    default:
      return null
  }
}

function BatchItem({ batch }: { batch: BatchProps }) {
  const [isExpanded, setIsExpanded] = React.useState(false)

  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <button 
          onClick={() => setIsExpanded(!isExpanded)} 
          className="flex items-start gap-2 text-left"
        >
          <div>
            <div className="font-medium text-gray-900">{batch.name}</div>
            <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
              <Clock className="h-3.5 w-3.5" />
              <span>{new Date(batch.date).toLocaleString()}</span>
            </div>
          </div>
        </button>
        <BatchStatusBadge status={batch.status} />
      </div>
      <div className="flex items-center gap-1 text-sm text-gray-500">
        <FileText className="h-3.5 w-3.5" />
        <span>{batch.fileCount} file{batch.fileCount > 1 ? "s" : ""}</span>
        {batch.status === "partial" && batch.successCount !== undefined && batch.failedCount !== undefined && (
          <span className="text-xs text-gray-400">
            ({batch.successCount} processed, {batch.failedCount} failed)
          </span>
        )}
      </div>
      
      {isExpanded && batch.files && (
        <div className="mt-4 pl-4 border-l border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-2">Files in this batch:</div>
          <div className="space-y-2">
            {batch.files.map((file) => (
              <div key={file.filename} className="text-sm text-gray-600">
                {file.name || file.filename}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function UploadHistory({ refreshTrigger }: { refreshTrigger: number }) {
  const [batches, setBatches] = useState<BatchProps[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUploads = useCallback(async () => {
    setLoading(true)
    try {
      const newBatches = await fetchBatches()
      setBatches(newBatches)
      setError(null)
    } catch (error) {
      console.error(error)
      setError("Failed to fetch recent uploads")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchUploads()
  }, [fetchUploads, refreshTrigger])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Recent Uploads</CardTitle>
          <CardDescription>Your recent resume batch uploads</CardDescription>
        </div>
        <Link href="/upload">
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <FileText className="h-4 w-4 mr-2" />
            Upload Resumes
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          </div>
        ) : error ? (
          <div className="text-red-500 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        ) : (
          <div className="space-y-3">
            {batches.length === 0 ? (
              <div className="text-gray-500 text-center py-4">No recent uploads found.</div>
            ) : (
              batches.map((batch) => <BatchItem key={batch.id} batch={batch} />)
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
