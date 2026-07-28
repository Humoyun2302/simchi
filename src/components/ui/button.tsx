import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-semibold transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none min-h-11 touch-manipulation',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-white shadow-[0_10px_24px_rgb(63_127_241_/_0.28)] hover:brightness-105 rounded-[20px] h-14 px-6 text-base',
        secondary:
          'bg-primary-soft text-primary rounded-[20px] h-12 px-5 hover:bg-[#cfe0ff]',
        ghost: 'bg-transparent text-muted hover:bg-white/50 rounded-2xl h-11 px-4',
        danger: 'bg-danger text-danger-text rounded-[20px] h-12 px-5',
        outline:
          'bg-white/60 border border-white/80 text-text rounded-[20px] h-12 px-5 hover:bg-white/80',
      },
      size: {
        default: '',
        icon: 'h-11 w-11 rounded-2xl p-0',
        sm: 'h-10 px-4 text-sm rounded-2xl',
      },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, children, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {children}
    </button>
  )
}
