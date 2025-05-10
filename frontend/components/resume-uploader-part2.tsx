const uploadSingleFile = async (uploadFile: UploadFile, onProgress: (progress: number) => void) => {
    const formData = new FormData()
    formData.append("file", uploadFile.file)
    formData.append("batchName", batchName) // Add batchName to form data

    try {
      const response = await fetch("http://localhost:8000/upload_resume", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to upload resume")
      }

      onProgress(100)
      return { success: true }
    } catch (error: any) {
      return { success: false, errorMessage: error.message }
    }
  }

  const uploadBatchFiles = async (filesToUpload: UploadFile[]) => {
    const formData = new FormData()
    filesToUpload.forEach((file) => {
      formData.append("files", file.file)
    })
    formData.append("batchName", batchName) // Add batchName to form data

    try {
      const response = await fetch("http://localhost:8000/parse_resumes_batch", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to upload batch resumes")
      }

      const data = await response.json()
      return data.results
    } catch (error: any) {
      return filesToUpload.map((file) => ({
        filename: file.file.name,
        error: error.message,
      }))
    }
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setIsUploading(true)

    setFiles((prev) =>
      prev.map((file) => ({
        ...file,
        status: "uploading",
        progress: 0,
        errorMessage: undefined,
      })),
    )

    if (useBatchUpload) {
      // Upload all files in a single batch request
      const results = await uploadBatchFiles(files)

      setFiles((prev) =>
        prev.map((file) => {
          const result = results.find((r: any) => r.filename === file.file.name)
          if (!result) {
            return { ...file, status: "error", errorMessage: "No response for file" }
          }
          if (result.error) {
            return { ...file, status: "error", errorMessage: result.error }
          }
          return { ...file, status: "success", progress: 100 }
        }),
      )
    } else {
      // Upload files sequentially
      for (const file of files) {
        const onProgress = (progress: number) => {
          setFiles((prev) =>
            prev.map((f) => (f.id === file.id ? { ...f, progress, status: "uploading" } : f)),
          )
        }

        const result = await uploadSingleFile(file, onProgress)

        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? {
                  ...f,
                  progress: 100,
                  status: result.success ? "success" : "error",
                  errorMessage: result.errorMessage,
                }
              : f,
          ),
        )
      }
    }

    setIsUploading(false)

    // Notify parent component upload is complete
    if (onUploadComplete) {
      onUploadComplete()
    }
  }

  const clearAll = () => {
    setFiles([])
    setBatchName("")
    setNotes("")
  }

  const successCount = files.filter((file) => file.status === "success").length
  const errorCount = files.filter((file) => file.status === "error").length
  const isComplete = isUploading === false && files.length > 0 && successCount + errorCount === files.length

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle>Upload Resumes</CardTitle>
        <CardDescription>
          Drag and drop resume files or click to browse. We'll process them and add them to your database.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="batch-name">Batch Name</Label>
            <Input
              id="batch-name"
              placeholder="e.g., May 2023 Applicants"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this batch of resumes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 resize-none h-20"
            />
          </div>
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              id="batch-upload"
              checked={useBatchUpload}
              onChange={(e) => setUseBatchUpload(e.target.checked)}
              disabled={isUploading}
            />
            <Label htmlFor="batch-upload">Use Batch Upload (Single Request Multiple Files)</Label>
          </div>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? "border-emerald-500 bg-emerald-50" : "border-gray-300 hover:border-emerald-400"
          } transition-colors duration-200 cursor-pointer`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept=".pdf,.doc,.docx,.txt,.rtf"
            className="hidden"
          />
          <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Drag and drop your resume files</h3>
          <p className="text-sm text-gray-500 mb-4">or click to browse your files</p>
          <p className="text-xs text-gray-400">Supported formats: PDF, DOCX, DOC, RTF, TXT (Max 10MB per file)</p>
        </div>

        {files.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Files ({files.length})</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              <AnimatePresence>
                {files.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.75rem",
                      backgroundColor: "rgb(249 250 251)",
                      borderRadius: "0.5rem",
                      border: "1px solid rgb(229 231 235)"
                    }}
                  >
                    <div className="bg-white p-2 rounded-md border border-gray-200">
                      <FileIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <p className="font-medium text-gray-900 truncate">{file.file.name}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFile(file.id)
                          }}
                          className="text-gray-400 hover:text-gray-600"
                          disabled={isUploading}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="text-xs text-gray-500">{(file.file.size / 1024 / 1024).toFixed(2)} MB</div>
                      {file.status === "uploading" && (
                        <div className="mt-2">
                          <Progress value={Math.min(100, Math.max(0, file.progress))} className="h-1.5" />
                        </div>
                      )}
                      {file.status === "error" && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-red-500">
                          <AlertCircle className="h-3 w-3" />
                          {file.errorMessage || "Upload failed"}
                        </div>
                      )}
                      {file.status === "success" && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-emerald-500">
                          <CheckCircle className="h-3 w-3" />
                          Upload complete
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {isComplete && (
          <div className={`p-4 rounded-lg ${errorCount > 0 ? "bg-amber-50" : "bg-emerald-50"}`}>
            <div className="flex items-center gap-2">
              {errorCount > 0 ? (
                <AlertCircle className="h-5 w-5 text-amber-500" />
              ) : (
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              )}
              <div className="font-medium">
                {errorCount > 0
                  ? `Completed with ${errorCount} error${errorCount > 1 ? "s" : ""}`
                  : "All files uploaded successfully"}
              </div>
            </div>
            <p className="text-sm mt-1 ml-7">
              {successCount} of {files.length} files were processed successfully.
              {errorCount > 0 && " You can retry the failed uploads."}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t bg-gray-50 p-4">
        <Button variant="outline" onClick={clearAll} disabled={isUploading}>
          Clear All
        </Button>
        <Button
          onClick={handleUpload}
          disabled={files.length === 0 || isUploading || isComplete}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>Upload {files.length > 0 ? `(${files.length})` : ""}</>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
