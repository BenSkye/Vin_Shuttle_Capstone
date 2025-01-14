import React, { useState } from 'react';

interface DestinationFormProps {
    onDestinationSet: (address: string) => void;
}

export default function DestinationForm({ onDestinationSet }: DestinationFormProps) {
    const [destination, setDestination] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onDestinationSet(destination);
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2">
            <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Enter destination address"
                className="flex-grow px-4 py-2 border rounded "
            />
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
                Set Destination
            </button>
        </form>
    );
}

