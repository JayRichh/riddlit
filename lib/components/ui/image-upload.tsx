'use client'

import { upload } from '@vercel/blob/client'
import { Image as ImageIcon, Upload, X } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState } from 'react'

import { Button } from '@/lib/components/ui/button'
import { Label } from '@/lib/components/ui/label'

interface ImageUploadProps {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState(value || '')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadMessage('Please select an image file')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setUploadMessage('Image must be smaller than 5MB')
      return
    }

    setSelectedFile(file)
    setUploadMessage('')

    // Create preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadMessage('')

    try {
      // Generate unique filename
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 8)
      const extension = selectedFile.name.split('.').pop()
      const filename = `riddle-images/${timestamp}-${randomString}.${extension}`

      // Upload using client-side blob upload
      const blob = await upload(filename, selectedFile, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        clientPayload: JSON.stringify({
          type: selectedFile.type,
          size: selectedFile.size,
        }),
      })

      onChange(blob.url)
      setUploadMessage('✓ Image uploaded successfully')

      // Update preview to use uploaded URL
      setPreviewUrl(blob.url)
    } catch (error) {
      console.error('Upload error:', error)
      setUploadMessage(error instanceof Error ? error.message : 'Failed to upload image')
      setPreviewUrl('')
    } finally {
      setIsUploading(false)
    }
  }

  const handleClear = () => {
    setSelectedFile(null)
    setPreviewUrl('')
    setUploadMessage('')
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSelectClick = () => {
    fileInputRef.current?.click()
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
          disabled={disabled}
        />

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleSelectClick}
            disabled={disabled}
            className="flex-1"
          >
            <Upload className="mr-2 h-4 w-4" />
            {selectedFile ? 'Change Image' : 'Select Image'}
          </Button>

          {selectedFile && !value && (
            <Button type="button" onClick={handleUpload} disabled={disabled || isUploading}>
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          )}

          {previewUrl && (
            <Button type="button" variant="outline" onClick={handleClear} disabled={disabled}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {uploadMessage && (
          <p
            className={`text-sm ${
              uploadMessage.startsWith('✓') ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {uploadMessage}
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
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div className="flex h-48 w-full items-center justify-center rounded-lg border border-dashed">
          <div className="text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">No image selected</p>
          </div>
        </div>
      )}
    </div>
  )
}
