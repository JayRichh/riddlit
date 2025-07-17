'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Users } from 'lucide-react'
import Link from 'next/link'

import { AnimatedGradientText } from '@/lib/components/magicui/animated-gradient-text'
import { Button } from '@/lib/components/ui/button'
import { cn } from '@/lib/utils'

export const CTASection = () => {
  return (
    <section className="bg-muted/30 px-4 py-24">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="space-y-8 text-center"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={cn('text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl')}
          >
            <AnimatedGradientText>Ready to Challenge Your Team?</AnimatedGradientText>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed md:text-xl"
          >
            Join teams solving daily riddles, compete on leaderboards, and build stronger
            connections through shared challenges.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button asChild size="lg" className="group">
              <Link href="/teams" className="flex items-center">
                <Users className="mr-2 size-4" />
                Join a Team
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="group">
              <Link href="/teams/create" className="flex items-center">
                Create Your Team
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="border-border/50 mt-12 border-t pt-8"
          >
            <div className="grid grid-cols-1 gap-6 text-center md:grid-cols-3">
              <div className="space-y-2">
                <div className="text-primary text-2xl font-bold">500+</div>
                <div className="text-muted-foreground text-sm">Daily Solvers</div>
              </div>
              <div className="space-y-2">
                <div className="text-primary text-2xl font-bold">150+</div>
                <div className="text-muted-foreground text-sm">Active Teams</div>
              </div>
              <div className="space-y-2">
                <div className="text-primary text-2xl font-bold">1,000+</div>
                <div className="text-muted-foreground text-sm">Riddles Solved</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
