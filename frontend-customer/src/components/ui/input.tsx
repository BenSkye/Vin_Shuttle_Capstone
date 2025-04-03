import { cn } from '@/libs/utils'

export const Input = ({ label, error, ...props }) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full px-3 py-2 rounded-lg border border-gray-200',
          'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
          'placeholder:text-text-light',
          error && 'border-error focus:ring-error/20 focus:border-error'
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
    </div>
  )
}