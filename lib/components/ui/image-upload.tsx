'use client'

import imageCompression from 'browser-image-compression'
import { Image as ImageIcon, Upload, X } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState } from 'react'

import { Button } from '@/lib/components/ui/button'
import { Label } from '@/lib/components/ui/label'

interface ImageUploadProps {
  value?: string
  onChange: (value: string) => void
  /** parent gets realtime upload state */
  onUploadingChange?: (isUploading: boolean) => void
  disabled?: boolean
}

export function ImageUpload({ value, onChange, onUploadingChange, disabled }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState(value || '')
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [msg, setMsg] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  /** keep parent in‑sync */
  const setUploading = (v: boolean) => {
    setIsUploading(v)
    onUploadingChange?.(v)
  }

  const resetInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 2, // Maximum file size in MB
      maxWidthOrHeight: 1920, // Maximum width or height in pixels
      useWebWorker: true, // Use web worker for better performance
      quality: 0.8, // High quality compression (0.8 = 80% quality)
      fileType: 'image/webp', // Convert to WebP for better compression
      initialQuality: 0.8, // Initial quality for the compression algorithm
    }

    try {
      const compressedFile = await imageCompression(file, options)

      // If compression results in a larger file, return original
      if (compressedFile.size > file.size) {
        return file
      }

      return compressedFile
    } catch (error) {
      console.warn('Image compression failed, using original file:', error)
      return file
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setMsg('Please select an image')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setMsg('Image must be < 10 MB')
      return
    }

    setMsg('Compressing image...')
    setProgress(0)
    setUploading(true)

    try {
      // Compress the image first
      const compressedFile = await compressImage(file)

      // immediate local preview from compressed file
      const reader = new FileReader()
      reader.onload = (ev) => setPreviewUrl(ev.target?.result as string)
      reader.readAsDataURL(compressedFile)

      // Show compression results
      const originalSizeKB = Math.round(file.size / 1024)
      const compressedSizeKB = Math.round(compressedFile.size / 1024)
      const compressionRatio = Math.round((1 - compressedFile.size / file.size) * 100)

      setMsg(
        `Compressed ${originalSizeKB}KB → ${compressedSizeKB}KB (${compressionRatio}% reduction). Uploading...`,
      )

      // upload with progress using XMLHttpRequest
      const formData = new FormData()
      formData.append('file', compressedFile)
      const xhr = new XMLHttpRequest()
      xhr.open('POST', '/api/upload')

      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) {
          setProgress(Math.round((ev.loaded / ev.total) * 100))
        }
      }

      xhr.onload = () => {
        try {
          if (xhr.status === 200) {
            const { url } = JSON.parse(xhr.responseText)
            onChange(url)
            setPreviewUrl(url)
            setMsg(`✓ Image uploaded successfully! (${compressedSizeKB}KB)`)
          } else {
            const errorData = JSON.parse(xhr.responseText)
            throw new Error(errorData.error || 'Upload failed')
          }
        } catch (error) {
          setMsg(error instanceof Error ? error.message : 'Upload failed')
          resetInput()
        } finally {
          setUploading(false)
        }
      }

      xhr.onerror = () => {
        setMsg('Upload failed')
        resetInput()
        setUploading(false)
      }

      xhr.send(formData)
    } catch (error) {
      setMsg(error instanceof Error ? error.message : 'Compression failed')
      resetInput()
      setUploading(false)
    }
  }

  const clear = () => {
    setPreviewUrl('')
    setMsg('')
    onChange('')
    resetInput()
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="image-upload">Image (optional)</Label>

        <input
          ref={fileInputRef}
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
            className="flex-1"
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? 'Processing...' : previewUrl ? 'Change Image' : 'Select Image'}
          </Button>

          {previewUrl && (
            <Button
              type="button"
              variant="outline"
              onClick={clear}
              disabled={disabled || isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* progress bar */}
        {isUploading && (
          <div className="bg-muted h-2 w-full overflow-hidden rounded">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {msg && (
          <p
            className={`text-sm ${
              msg.startsWith('✓')
                ? 'text-green-600'
                : msg.includes('Compressed') || msg.includes('Compressing')
                  ? 'text-blue-600'
                  : 'text-red-600'
            }`}
          >
            {msg}
          </p>
        )}
      </div>

      {previewUrl ? (
        <div className="relative h-48 w-full overflow-hidden rounded-lg border">
          <Image
            src={previewUrl}
            alt="Preview"
            fill
            className="object-cover"
            sizes="(max-width:768px)100vw,50vw"
          />
        </div>
      ) : (
        <div className="flex h-48 w-full items-center justify-center rounded-lg border border-dashed">
          <div className="text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              {isUploading ? 'Processing...' : 'No image selected'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
