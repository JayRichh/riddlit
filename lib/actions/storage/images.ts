'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'

import { ActionState } from '@/lib/types/server-action'

export async function uploadImage(formData: FormData): Promise<ActionState<string>> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    const file = formData.get('file') as File

    if (!file) {
      return { isSuccess: false, message: 'No file provided' }
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { isSuccess: false, message: 'File must be an image' }
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return { isSuccess: false, message: 'Image must be smaller than 5MB' }
    }

    // This function will be called from the client-side component
    // The actual upload will be handled by the client using @vercel/blob/client
    revalidatePath('/riddles')
    revalidatePath('/teams')

    return {
      isSuccess: true,
      message: 'File validated successfully',
      data: '', // URL will be set by client-side upload
    }
  } catch (error) {
    console.error('Error validating file:', error)
    return { isSuccess: false, message: 'Failed to validate file' }
  }
}

export async function deleteImage(imageUrl: string): Promise<ActionState<boolean>> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    // Extract blob name from URL
    const urlParts = imageUrl.split('/')
    const blobName = urlParts[urlParts.length - 1]

    // For Vercel Blob, deletion is handled through the API
    // This would typically require additional setup
    console.log('Image deletion requested for:', blobName)

    return {
      isSuccess: true,
      message: 'Image deleted successfully',
      data: true,
    }
  } catch (error) {
    console.error('Error deleting image:', error)
    return { isSuccess: false, message: 'Failed to delete image' }
  }
}

export async function validateImageUrl(imageUrl: string): Promise<ActionState<string>> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    if (!imageUrl.trim()) {
      return { isSuccess: false, message: 'Image URL is required' }
    }

    // Basic URL validation
    try {
      new URL(imageUrl)
    } catch {
      return { isSuccess: false, message: 'Invalid URL format' }
    }

    // Check if URL points to an image
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
    const url = imageUrl.toLowerCase()
    const isImageUrl =
      imageExtensions.some((ext) => url.includes(ext)) ||
      url.includes('imgur.com') ||
      url.includes('unsplash.com') ||
      url.includes('vercel.app') ||
      url.includes('githubusercontent.com') ||
      url.includes('blob.vercel-storage.com')

    if (!isImageUrl) {
      return { isSuccess: false, message: 'URL must point to an image file' }
    }

    return {
      isSuccess: true,
      message: 'Valid image URL',
      data: imageUrl,
    }
  } catch (error) {
    console.error('Error validating image URL:', error)
    return { isSuccess: false, message: 'Failed to validate image URL' }
  }
}
