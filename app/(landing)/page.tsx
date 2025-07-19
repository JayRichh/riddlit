import { CTASection } from '@/lib/components/landing/cta'
import { FeaturesSection } from '@/lib/components/landing/features'
import { HeroSection } from '@/lib/components/landing/hero'

export default async function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <CTASection />
    </div>
  )
}
