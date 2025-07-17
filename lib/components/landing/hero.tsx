'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Play } from 'lucide-react'
import Link from 'next/link'

import { AnimatedGradientText } from '@/lib/components/magicui/animated-gradient-text'
import { Button } from '@/lib/components/ui/button'
import { RiddlixLogo } from '@/lib/components/ui/riddlix-logo'

export const HeroSection = () => {
  return (
    <section className="relative flex min-h-[100vh] items-center justify-center px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left: Text Content */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <h1 className="text-4xl leading-tight font-bold tracking-tight sm:text-5xl md:text-6xl">
                <AnimatedGradientText>
                  Challenge Minds.
                  <br />
                  Build Teams.
                  <br />
                  Reach Rank 1.
                </AnimatedGradientText>
              </h1>

              <p className="text-muted-foreground max-w-[600px] text-lg leading-relaxed md:text-xl">
                Daily team riddles for sharper thinking and smarter teams.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col gap-4 sm:flex-row"
            >
              <Button asChild size="lg" className="group">
                <Link href="/teams" className="flex items-center">
                  Join a Team
                  <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg" className="group">
                <Link href="#how-it-works" className="flex items-center">
                  <Play className="mr-2 size-4" />
                  See How It Works
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Right: Riddlix Logo */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative flex items-center justify-center"
          >
            <div className="relative">
              <RiddlixLogo
                size={420}
                className="w-full max-w-md lg:max-w-lg xl:max-w-xl"
                animate={true}
              />

              {/* Subtle background glow effect */}
              <div className="from-primary/10 via-primary/5 to-primary/10 absolute inset-0 -z-10 rounded-full bg-gradient-to-r opacity-60 blur-3xl" />

              {/* Floating elements for visual interest */}
              <motion.div
                className="bg-primary/20 absolute -top-4 -right-4 h-8 w-8 rounded-full blur-sm"
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              <motion.div
                className="bg-primary/10 absolute -bottom-6 -left-6 h-12 w-12 rounded-full blur-sm"
                animate={{
                  y: [0, 10, 0],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.5,
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
