'use client'

import Image from 'next/image'
import { useState } from 'react'

import { validateImageUrl } from '@/lib/actions/storage/images'
import { Button } from '@/lib/components/ui/button'
import { Input } from '@/lib/components/ui/input'
import { Label } from '@/lib/components/ui/label'

interface ImageUploadProps {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [url, setUrl] = useState(value || '')
  const [previewUrl, setPreviewUrl] = useState(value || '')
  const [isValidating, setIsValidating] = useState(false)
  const [validationMessage, setValidationMessage] = useState('')

  const handleValidate = async () => {
    if (!url.trim()) {
      setPreviewUrl('')
      setValidationMessage('')
      onChange('')
      return
    }

    setIsValidating(true)
    setValidationMessage('')

    const result = await validateImageUrl(url)

    if (result.isSuccess && result.data) {
      setPreviewUrl(result.data)
      onChange(result.data)
      setValidationMessage('✓ Valid image URL')
    } else {
      setPreviewUrl('')
      onChange('')
      setValidationMessage(result.message)
    }

    setIsValidating(false)
  }

  const handleClear = () => {
    setUrl('')
    setPreviewUrl('')
    setValidationMessage('')
    onChange('')
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="image-url">Image URL (optional)</Label>
        <div className="flex gap-2">
          <Input
            id="image-url"
            type="url"
            placeholder="https://example.com/image.jpg"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={disabled}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleValidate}
            disabled={disabled || isValidating || !url.trim()}
          >
            {isValidating ? 'Validating...' : 'Validate'}
          </Button>
          {previewUrl && (
            <Button type="button" variant="outline" onClick={handleClear} disabled={disabled}>
              Clear
            </Button>
          )}
        </div>
        {validationMessage && (
          <p
            className={`text-sm ${
              validationMessage.startsWith('✓') ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {validationMessage}
          </p>
        )}
      </div>

      {previewUrl && (
        <div className="relative h-48 w-full overflow-hidden rounded-lg border">
          <Image
            src={previewUrl}
            alt="Preview"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
    </div>
  )
}
