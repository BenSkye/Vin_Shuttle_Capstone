import { useState, useEffect } from 'react';
import { Input, Button, Spin, Card, Divider, Alert } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import {
    EnvironmentOutlined,
    AimOutlined,
    LoadingOutlined,
    SearchOutlined,
    ClockCircleOutlined,
    StarOutlined
} from '@ant-design/icons';
import Image from 'next/image';
interface LocationSelectionProps {
    startPoint: any;
    onLocationChange: (location: any) => void;
    loading: boolean;
    detectUserLocation: () => void;
}

interface SavedLocation {
    id: string;
    name: string;
    address: string;
    type: 'home' | 'work' | 'favorite';
}
const LocationSelection = ({
    startPoint,
    onLocationChange,
    loading,
    detectUserLocation,
}: LocationSelectionProps) => {
    const [searchValue, setSearchValue] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Mock saved locations (replace with actual data from backend)
    const savedLocations: SavedLocation[] = [
        {
            id: '1',
            name: 'Nhà',
            address: 'S1.03, Vinhomes Grand Park, Quận 9',
            type: 'home'
        },
        {
            id: '2',
            name: 'Công ty',
            address: 'S2.05, Vinhomes Grand Park, Quận 9',
            type: 'work'
        },
        {
            id: '3',
            name: 'Công viên',
            address: 'Central Park, Vinhomes Grand Park, Quận 9',
            type: 'favorite'
        }
    ];

    const handleSearch = async (value: string) => {
        setSearchValue(value);
        if (value.length < 2) {
            setSearchResults([]);
            return;
        }
        setSearchLoading(true);
        try {
            // Mock API call - replace with actual API call
            const results = await mockSearchLocations(value);
            setSearchResults(results);
            setError(null);
        } catch (err) {
            setError('Không thể tìm kiếm địa điểm. Vui lòng thử lại.');
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleLocationSelect = (location: any) => {
        onLocationChange(location);
        setSearchValue(location.address);
        setSearchResults([]);
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Location Search Section */}
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="space-y-4">
                    {/* Search Input */}
                    <div className="relative">
                        <Input
                            size="large"
                            placeholder="Nhập địa điểm đón..."
                            value={searchValue}
                            onChange={(e) => handleSearch(e.target.value)}
                            prefix={<EnvironmentOutlined className="text-blue-500" />}
                            className="w-full rounded-lg"
                            suffix={searchLoading && <LoadingOutlined spin />}
                        />

                        {/* Current Location Button */}
                        <Button
                            type="primary"
                            icon={<AimOutlined />}
                            onClick={detectUserLocation}
                            loading={loading}
                            className="absolute right-0 top-0 h-full rounded-r-lg"
                        >
                            Vị trí hiện tại
                        </Button>
                    </div>

                    {/* Error Message */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <Alert
                                    type="error"
                                    message={error}
                                    closable
                                    onClose={() => setError(null)}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Search Results */}
                    <AnimatePresence>
                        {searchResults.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="mt-2 space-y-2"
                            >
                                {searchResults.map((location: any) => (
                                    <div
                                        key={location.id}
                                        onClick={() => handleLocationSelect(location)}
                                        className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200"
                                    >
                                        <div className="flex items-start">
                                            <EnvironmentOutlined className="text-blue-500 mt-1 mr-3" />
                                            <div>
                                                <p className="font-medium text-gray-800">{location.name}</p>
                                                <p className="text-sm text-gray-500">{location.address}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </Card>

            {/* Saved Locations Section */}
            <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Địa điểm đã lưu</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedLocations.map((location) => (
                        <motion.div
                            key={location.id}
                            whileHover={{ scale: 1.02 }}
                            className="bg-white rounded-lg shadow-md p-4 cursor-pointer"
                            onClick={() => handleLocationSelect(location)}
                        >
                            <div className="flex items-start">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                    {location.type === 'home' && <HomeIcon />}
                                    {location.type === 'work' && <WorkIcon />}
                                    {location.type === 'favorite' && <StarOutlined className="text-blue-500" />}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">{location.name}</p>
                                    <p className="text-sm text-gray-500">{location.address}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Recent Locations Section */}
            <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Địa điểm gần đây</h3>
                <div className="space-y-3">
                    {recentLocations.map((location) => (
                        <motion.div
                            key={location.id}
                            whileHover={{ x: 5 }}
                            className="flex items-center p-3 bg-white rounded-lg shadow-sm cursor-pointer"
                            onClick={() => handleLocationSelect(location)}
                        >
                            <ClockCircleOutlined className="text-gray-400 mr-3" />
                            <div>
                                <p className="font-medium text-gray-800">{location.name}</p>
                                <p className="text-sm text-gray-500">{location.address}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Mock data and functions
const recentLocations = [
    {
        id: '1',
        name: 'Trung tâm thương mại Vincom',
        address: 'Vinhomes Grand Park, Quận 9'
    },
    {
        id: '2',
        name: 'Công viên ánh sáng',
        address: 'Vinhomes Grand Park, Quận 9'
    }
];

const mockSearchLocations = async (query: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock results
    return [
        {
            id: '1',
            name: 'Vinhomes Grand Park S1',
            address: 'Phường Long Thạnh Mỹ, Quận 9'
        },
        {
            id: '2',
            name: 'Vinhomes Grand Park S2',
            address: 'Phường Long Thạnh Mỹ, Quận 9'
        }
    ];
};

// Custom Icons
const HomeIcon = () => (
    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const WorkIcon = () => (
    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

export default LocationSelection;