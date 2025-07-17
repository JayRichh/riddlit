'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { ThemeProviderProps } from 'next-themes'

import { DisplayNameProvider } from '@/lib/components/providers/display-name-provider'
import { TooltipProvider } from '@/lib/components/ui/tooltip'

export const Providers = ({ children, ...props }: ThemeProviderProps) => {
  return (
    <NextThemesProvider {...props}>
      <TooltipProvider>
        <DisplayNameProvider>{children}</DisplayNameProvider>
      </TooltipProvider>
    </NextThemesProvider>
  )
}
