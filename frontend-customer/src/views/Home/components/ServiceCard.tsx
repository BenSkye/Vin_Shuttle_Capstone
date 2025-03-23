import Link from 'next/link';
import { ReactNode } from 'react';

interface ServiceCardProps {
    id: string;
    title: string;
    description: string;
    icon: ReactNode;
    href: string;
    isSelected: boolean;
    onSelect: (id: string) => void;
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
            className={`group p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 
        ${isSelected ? 'ring-2 ring-green-500' : ''}`}
            onClick={() => onSelect(id)}
        >
            <div className="flex flex-col items-center text-center">
                <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-gray-600">{description}</p>
            </div>
        </Link>
    );
};

export default ServiceCard; 