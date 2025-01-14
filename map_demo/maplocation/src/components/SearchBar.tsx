import React, { useState } from 'react';

interface SearchBarProps {
    onSearch: (result: { lat: number; lon: number }) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
    const [query, setQuery] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    query
                )}`
            );
            const data = await response.json();
            if (data && data.length > 0) {
                onSearch({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
            } else {
                alert('Location not found');
            }
        } catch (error) {
            console.error('Error searching for location:', error);
            alert('Error searching for location');
        }
    };

    return (
        <form onSubmit={handleSearch} className="flex">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for a location"
                className="flex-grow px-4 py-2 border rounded-l"
            />
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-r">
                Search
            </button>
        </form>
    );
}

