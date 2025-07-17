import Image from 'next/image'
import * as React from 'react'

import { cn } from '@/lib/utils'

const Avatar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)}
      {...props}
    />
  ),
)
Avatar.displayName = 'Avatar'

const AvatarImage = React.forwardRef<
  HTMLDivElement,
  { src: string; alt?: string; className?: string }
>(({ className, src, alt = '' }, ref) => (
  <div ref={ref} className="relative h-full w-full">
    <Image
      src={src}
      alt={alt}
      fill
      className={cn('object-cover', className)}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  </div>
))
AvatarImage.displayName = 'AvatarImage'

const AvatarFallback = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-muted flex h-full w-full items-center justify-center rounded-full text-sm font-medium',
        className,
      )}
      {...props}
    />
  ),
)
AvatarFallback.displayName = 'AvatarFallback'

export { Avatar, AvatarFallback, AvatarImage }
