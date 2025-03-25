import { ReactNode } from 'react'

import Link from 'next/link'

interface ServiceCardProps {
  id: string
  title: string
  description: string
  icon: ReactNode
  href: string
  isSelected: boolean
  onSelect: (id: string) => void
}

const ServiceCard = ({
  id,
  title,
  description,
  icon,
  href,
  isSelected,
  onSelect,
}: ServiceCardProps) => {
  return (
    <Link
      href={href}
      className={`group rounded-xl bg-white p-6 shadow-md transition-all duration-300 hover:shadow-lg ${isSelected ? 'ring-2 ring-green-500' : ''}`}
      onClick={() => onSelect(id)}
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 transform transition-transform duration-300 group-hover:scale-110">
          {icon}
        </div>
        <h3 className="mb-2 text-xl font-semibold">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </Link>
  )
}

export default ServiceCard
