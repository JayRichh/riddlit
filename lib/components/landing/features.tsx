'use client'

import { motion } from 'framer-motion'
import { Calendar, Clock, Target, Trophy, Users, Zap } from 'lucide-react'
import React from 'react'

import { cn } from '@/lib/utils'

interface FeatureProps {
  title: string
  description: string
  icon: React.ElementType
}

const features: FeatureProps[] = [
  {
    title: 'Smart Scheduling',
    description:
      'Set riddles to run daily, weekly, or on custom timelines. Automated delivery keeps teams engaged.',
    icon: Calendar,
  },
  {
    title: 'Flexible Teams',
    description:
      'Invite coworkers, manage requests, set team limits. Build the perfect solving squad.',
    icon: Users,
  },
  {
    title: 'Real-Time Leaderboards',
    description: 'Track individuals or teams. Rankings update live as answers come in.',
    icon: Trophy,
  },
  {
    title: 'One Answer. One Shot.',
    description:
      'Each riddle allows a single response — make it count. No second chances, just pure thinking.',
    icon: Target,
  },
  {
    title: 'Multiple Choice or Freeform',
    description: 'Admins choose the riddle format. You focus on solving, not guessing the system.',
    icon: Zap,
  },
  {
    title: 'Time-Limited Challenges',
    description:
      'Each riddle lives for 24 hours. Miss it, and you will have to wait for the next one.',
    icon: Clock,
  },
]

const HowItWorksStep = ({
  step,
  title,
  description,
}: {
  step: number
  title: string
  description: string
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: step * 0.1 }}
    className="flex min-h-[240px] flex-col items-center justify-start space-y-6 text-center"
  >
    <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-full shadow-sm">
      <span className="text-primary text-xl font-bold">{step}</span>
    </div>
    <div className="flex flex-1 flex-col space-y-4">
      <h3 className="text-xl leading-tight font-semibold">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  </motion.div>
)

const FeatureCard = ({ title, description, icon: Icon }: FeatureProps) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-card flex min-h-[180px] rounded-xl border p-8 transition-all duration-300 hover:shadow-lg"
  >
    <div className="flex w-full items-start gap-6">
      <div className="bg-primary/10 shrink-0 rounded-lg p-4 shadow-sm">
        <Icon className="text-primary size-7" />
      </div>
      <div className="flex flex-1 flex-col justify-start space-y-3">
        <h3 className="text-lg leading-tight font-semibold">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  </motion.div>
)

export const FeaturesSection = () => {
  return (
    <section className="px-4 py-32">
      <div className="container mx-auto max-w-7xl">
        {/* How It Works Section */}
        <div id="how-it-works" className="mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-20 text-center"
          >
            <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">How It Works</h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed">
              Three simple steps to sharper thinking and stronger teams.
            </p>
          </motion.div>

          <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-3">
            <HowItWorksStep
              step={1}
              title="Join or Create a Team"
              description="Get your crew together or join one already solving."
            />
            <HowItWorksStep
              step={2}
              title="Solve Daily Riddles"
              description="Each day unlocks a new challenge, live for 24 hours."
            />
            <HowItWorksStep
              step={3}
              title="Track Progress & Climb the Leaderboard"
              description="Points, streaks, and rankings for friendly competition."
            />
          </div>
        </div>

        {/* Key Features Section */}
        <div className="mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-20 text-center"
          >
            <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">Key Features</h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed">
              Everything you need for engaging team challenges and friendly competition.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:gap-10">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <FeatureCard {...feature} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Screenshots Preview Section */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-20 text-center"
          >
            <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">See It in Action</h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed">
              Clean interfaces designed for focus and clarity.
            </p>
          </motion.div>

          <div className="grid gap-10 md:grid-cols-2 lg:gap-12">
            {/* Mock Screenshot 1 - Riddle Detail */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="from-primary/5 to-primary/10 flex h-full rounded-xl border bg-gradient-to-br p-8"
            >
              <div className="bg-background flex flex-1 flex-col space-y-6 rounded-lg p-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Daily Riddle #247</h3>
                  <div className="bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-medium">
                    23h 42m left
                  </div>
                </div>
                <p className="text-muted-foreground text-base leading-relaxed">
                  I speak without a mouth and hear without ears. I have no body, but I come alive
                  with wind. What am I?
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium">156 teams solving</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium">42 answers submitted</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Mock Screenshot 2 - Team Leaderboard */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="from-primary/5 to-primary/10 flex h-full rounded-xl border bg-gradient-to-br p-8"
            >
              <div className="bg-background flex flex-1 flex-col space-y-6 rounded-lg p-8">
                <h3 className="text-lg font-semibold">Team Leaderboard</h3>
                <div className="space-y-4">
                  {[
                    { name: 'Code Warriors', score: '2,450', streak: '🔥 12' },
                    { name: 'Mind Hackers', score: '2,180', streak: '🔥 8' },
                    { name: 'Logic Squad', score: '1,920', streak: '🔥 5' },
                  ].map((team, idx) => (
                    <div
                      key={idx}
                      className="bg-muted/50 flex items-center justify-between rounded-lg p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
                            idx === 0
                              ? 'bg-yellow-500 text-white'
                              : idx === 1
                                ? 'bg-gray-400 text-white'
                                : 'bg-amber-600 text-white',
                          )}
                        >
                          {idx + 1}
                        </div>
                        <span className="font-medium">{team.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">{team.streak}</span>
                        <span className="font-mono text-sm font-medium">{team.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
