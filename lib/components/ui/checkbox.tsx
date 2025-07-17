import { Check } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e)
      onCheckedChange?.(e.target.checked)
    }

    return (
      <div className="relative">
        <input
          type="checkbox"
          className={cn(
            'peer border-primary ring-offset-background focus-visible:ring-ring checked:bg-primary checked:border-primary h-4 w-4 shrink-0 rounded-sm border focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          ref={ref}
          checked={checked}
          onChange={handleChange}
          {...props}
        />
        {checked && (
          <Check className="text-primary-foreground pointer-events-none absolute inset-0 h-4 w-4" />
        )}
      </div>
    )
  },
)
Checkbox.displayName = 'Checkbox'

export { Checkbox }
