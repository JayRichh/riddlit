'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Play } from 'lucide-react'
import Link from 'next/link'

import { AnimatedGradientText } from '@/lib/components/magicui/animated-gradient-text'
import { Button } from '@/lib/components/ui/button'
import { cn } from '@/lib/utils'

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

          {/* Right: Visual/Image Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative"
          >
            <div className="from-primary/10 to-primary/5 rounded-2xl border bg-gradient-to-br p-8">
              <div className="space-y-6">
                {/* Mock leaderboard preview */}
                <div className="space-y-3">
                  <h3 className="text-muted-foreground text-sm font-medium">Team Leaderboard</h3>
                  <div className="space-y-2">
                    {[
                      { name: 'Code Warriors', score: '2,450', position: 1 },
                      { name: 'Mind Hackers', score: '2,180', position: 2 },
                      { name: 'Logic Squad', score: '1,920', position: 3 },
                    ].map((team, idx) => (
                      <div
                        key={idx}
                        className="bg-background flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                              idx === 0
                                ? 'bg-yellow-500 text-white'
                                : idx === 1
                                  ? 'bg-gray-400 text-white'
                                  : 'bg-amber-600 text-white',
                            )}
                          >
                            {team.position}
                          </div>
                          <span className="font-medium">{team.name}</span>
                        </div>
                        <span className="font-mono text-sm">{team.score}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mock riddle preview */}
                <div className="space-y-3">
                  <h3 className="text-muted-foreground text-sm font-medium">
                    Today&apos;s Challenge
                  </h3>
                  <div className="bg-background rounded-lg border p-4">
                    <p className="text-muted-foreground mb-2 text-sm">Daily Riddle #247</p>
                    <p className="font-medium">I speak without a mouth and hear without ears...</p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="bg-primary/10 text-primary rounded px-2 py-1 text-xs">
                        24h remaining
                      </div>
                      <div className="rounded bg-green-500/10 px-2 py-1 text-xs text-green-600">
                        156 teams solving
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
