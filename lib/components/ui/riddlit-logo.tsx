'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface RiddlitLogoProps {
  size?: number
  className?: string
  animate?: boolean
}

export const RiddlitLogo = ({ size = 400, className = '', animate = false }: RiddlitLogoProps) => {
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle theme resolution
  const currentTheme = mounted ? (theme === 'system' ? systemTheme : theme) : 'light'
  const isDark = currentTheme === 'dark'

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
    },
  }

  if (!mounted) {
    return <div style={{ width: size, height: size }} className={className} />
  }

  return (
    <motion.div
      className={`${className} relative`}
      variants={animate ? containerVariants : undefined}
      initial={animate ? 'hidden' : undefined}
      animate={animate ? 'visible' : undefined}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{ width: size, height: size }}
    >
      <div
        className={`relative h-full w-full drop-shadow-lg transition-all duration-300 ease-in-out ${isDark ? 'brightness-0 invert' : ''} `}
        style={{
          filter: isDark
            ? 'brightness(0) invert(1) hue-rotate(180deg) saturate(0.8)'
            : 'brightness(0.95) contrast(1.05)',
        }}
      >
        <Image
          src="/riddix_logo.svg"
          alt="Riddlit Logo"
          width={size}
          height={size}
          className="h-full w-full object-contain"
          priority
        />
      </div>
    </motion.div>
  )
}
