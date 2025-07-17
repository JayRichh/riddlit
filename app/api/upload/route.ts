import { auth } from '@clerk/nextjs/server'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json()) as HandleUploadBody

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Validate file type and size on server
        if (clientPayload) {
          try {
            const payload = JSON.parse(clientPayload as string) as { type: string; size: number }

            // Check file type
            if (!payload.type.startsWith('image/')) {
              throw new Error('Only image files are allowed')
            }

            // Check file size (5MB limit)
            if (payload.size > 5 * 1024 * 1024) {
              throw new Error('File size must be less than 5MB')
            }
          } catch {
            throw new Error('Invalid file metadata')
          }
        }

        // Generate token with user-specific path
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
          tokenPayload: JSON.stringify({
            userId,
            timestamp: Date.now(),
          }),
        }
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Optional: Log upload completion or perform additional actions
        console.log('Upload completed:', {
          url: blob.url,
          userId: tokenPayload ? JSON.parse(tokenPayload).userId : 'unknown',
        })
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 400 },
    )
  }
}
