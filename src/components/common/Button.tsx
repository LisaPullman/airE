import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'playful'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
}

const variantClassMap: Record<ButtonVariant, string> = {
  primary: 'bg-aviation-light text-white hover:bg-aviation-blue shadow-clay hover:shadow-clay-lg active:translate-x-[2px] active:translate-y-[2px] active:shadow-none',
  secondary: 'bg-white text-aviation-dark border-3 border-gray-200 hover:border-aviation-sky hover:bg-blue-50 shadow-clay hover:shadow-clay-lg active:translate-x-[2px] active:translate-y-[2px] active:shadow-none',
  success: 'bg-success text-white hover:bg-green-600 shadow-clay hover:shadow-clay-lg active:translate-x-[2px] active:translate-y-[2px] active:shadow-none',
  warning: 'bg-warning text-white hover:bg-amber-600 shadow-clay hover:shadow-clay-lg active:translate-x-[2px] active:translate-y-[2px] active:shadow-none',
  danger: 'bg-danger text-white hover:bg-red-700 shadow-clay hover:shadow-clay-lg active:translate-x-[2px] active:translate-y-[2px] active:shadow-none',
  playful: 'bg-gradient-to-r from-playful-pink to-playful-peach text-white hover:from-pink-400 hover:to-orange-300 shadow-clay hover:shadow-clay-lg active:translate-x-[2px] active:translate-y-[2px] active:shadow-none',
}

const sizeClassMap: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm rounded-xl',
  md: 'px-5 py-2.5 text-base rounded-2xl',
  lg: 'px-7 py-3.5 text-lg rounded-2xl',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        font-display font-semibold
        transition-all duration-200 ease-out
        cursor-pointer
        ${variantClassMap[variant]}
        ${sizeClassMap[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="w-5 h-5">{icon}</span>}
      {children}
    </button>
  )
}
