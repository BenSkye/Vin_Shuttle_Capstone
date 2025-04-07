import { cn } from '@/libs/utils'

export const Input = ({ label, error, ...props }) => {
  return (
    <div className="space-y-1">
      {label && <label className="text-text-secondary text-sm font-medium">{label}</label>}
      <input
        className={cn(
          'w-full rounded-lg border border-gray-200 px-3 py-2',
          'focus:ring-primary/20 focus:border-primary focus:outline-none focus:ring-2',
          'placeholder:text-text-light',
          error && 'border-error focus:border-error focus:ring-error/20'
        )}
        {...props}
      />
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  )
}
