'use server'

import { auth } from '@clerk/nextjs/server'

import { ActionState } from '@/lib/types/server-action'

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
      url.includes('githubusercontent.com')

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
