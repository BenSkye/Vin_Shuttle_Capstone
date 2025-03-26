import { Routes } from '@/constants/routers'
import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  size?: 'small' | 'medium' | 'large'
  showText?: boolean
  className?: string
}

export const Logo = ({ size = 'medium', showText = true, className = '' }: LogoProps) => {
  const sizes = {
    small: { width: 32, height: 32, textSize: 'text-xl' },
    medium: { width: 40, height: 40, textSize: 'text-2xl' },
    large: { width: 48, height: 48, textSize: 'text-3xl' },
  }

  const { width, height, textSize } = sizes[size]

  return (
    <Link
      href={Routes.HOME}
      className={`flex items-center gap-3 transition-opacity hover:opacity-90 ${className}`}
      aria-label="VinShuttle Home"
    >
      <div className="relative">
        <Image
          src="/images/bus.gif"
          alt="VinShuttle"
          width={width}
          height={height}
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <span className={`${textSize} whitespace-nowrap font-bold text-gray-900`}>VinShuttle</span>
      )}
    </Link>
  )
}
