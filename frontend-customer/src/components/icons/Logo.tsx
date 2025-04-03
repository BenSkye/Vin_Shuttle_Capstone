import { Routes } from '@/constants/routers'
import Link from 'next/link'

interface LogoProps {
  size?: 'small' | 'medium' | 'large'
  showText?: boolean
  className?: string
}

export const Logo = ({ size = 'medium', showText = true, className = '' }: LogoProps) => {
  const sizes = {
    small: { width: 32, height: 32, textSize: 'text-xl', iconSize: 'w-8 h-8' },
    medium: { width: 40, height: 40, textSize: 'text-2xl', iconSize: 'w-10 h-10' },
    large: { width: 48, height: 48, textSize: 'text-3xl', iconSize: 'w-12 h-12' },
  }

  const { textSize, iconSize } = sizes[size]

  return (
    <Link
      href={Routes.HOME}
      className={`group relative flex items-center gap-3 rounded-xl p-2 transition-all duration-300 before:absolute before:inset-0 before:-z-10 before:rounded-xl before:bg-gradient-to-r before:from-primary-50 before:to-accent-50 before:opacity-0 before:transition-opacity hover:before:opacity-100 ${className}`}
      aria-label="VinShuttle Home"
    >
      <div className={`relative ${iconSize}`}>
        <svg
          viewBox="0 0 512 512"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full transition-all duration-300 group-hover:drop-shadow-lg"
        >
          <path
            d="M481,101h-20V41c0-22.056-17.944-40-40-40H91C68.944,1,51,18.944,51,41v60H31c-16.542,0-30,13.458-30,30v40 c0,16.542,13.458,30,30,30h20v210c0,22.056,17.944,40,40,40v40c0,11.028,8.972,20,20,20h40c11.028,0,20-8.972,20-20v-40h170v40 c0,11.028,8.972,20,20,20h40c11.028,0,20-8.972,20-20v-40c22.056,0,40-17.944,40-40V201h20c16.542,0,30-13.458,30-30v-40 C511,114.458,497.542,101,481,101z"
            className="fill-none stroke-secondary-900/20 stroke-[16] translate-y-2"
          />
          <path
            d="M481,101h-20V41c0-22.056-17.944-40-40-40H91C68.944,1,51,18.944,51,41v60H31c-16.542,0-30,13.458-30,30v40 c0,16.542,13.458,30,30,30h20v210c0,22.056,17.944,40,40,40v40c0,11.028,8.972,20,20,20h40c11.028,0,20-8.972,20-20v-40h170v40 c0,11.028,8.972,20,20,20h40c11.028,0,20-8.972,20-20v-40c22.056,0,40-17.944,40-40V201h20c16.542,0,30-13.458,30-30v-40 C511,114.458,497.542,101,481,101z M71,101c24.429,0,355.227,0,370,0c0,41.114,0,144.491,0,190H71C71,271.005,71,123.301,71,101z"
            className="fill-primary-500 transition-colors duration-300 group-hover:fill-primary-600"
          />
          <path
            d="M306,81H206V61h100V81z M91,21h330c11.028,0,20,8.972,20,20v40H326V51c0-5.522-4.477-10-10-10H196c-5.523,0-10,4.478-10,10v30H71 V41C71,29.972,79.972,21,91,21z"
            className="fill-primary-100 stroke-secondary-900 stroke-[4] transition-colors duration-300 group-hover:fill-primary-200"
          />
          <path
            d="M131,331c-22.056,0-40,17.944-40,40s17.944,40,40,40s40-17.944,40-40S153.056,331,131,331z M381,331c-22.056,0-40,17.944-40,40s17.944,40,40,40c22.056,0,40-17.944,40-40S403.056,331,381,331z"
            className="fill-secondary-900 stroke-secondary-900 stroke-[4] transition-colors duration-300"
          />
          <path
            d="M311,341H201c-5.523,0-10,4.478-10,10v40c0,5.522,4.477,10,10,10h110c5.523,0,10-4.478,10-10v-40 C321,345.478,316.523,341,311,341z M301,381h-90v-20h90V381z"
            className="fill-primary-500 transition-colors duration-300 group-hover:fill-primary-600"
          />
          <path
            d="M321,161h-46.338l14.913-24.855C293.569,129.49,288.764,121,281,121h-50c-3.788,0-7.251,2.14-8.944,5.528l-40,80 C178.732,213.176,183.582,221,191,221h35.23l-14.514,36.286c-1.727,4.316-0.251,9.254,3.562,11.915 c3.833,2.674,8.975,2.325,12.412-0.769l100-90C334.494,172.309,330.132,161,321,161z"
            className="fill-accent-500 transition-colors duration-300 group-hover:fill-accent-600"
          />
        </svg>
      </div>
      {showText && (
        <span
          className={`${textSize} whitespace-nowrap font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-500 transition-all duration-300 group-hover:from-primary-600 group-hover:to-accent-600`}
        >
          VinShuttle
        </span>
      )}
    </Link>
  )
}
