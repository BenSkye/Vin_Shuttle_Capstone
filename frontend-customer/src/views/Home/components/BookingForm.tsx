'use client'


import LocationTabs from './LocationTabs';

interface BookingFormProps {
    tripType: 'one-way' | 'roundtrip';
    setTripType: (type: 'one-way' | 'roundtrip') => void;
    passengers: number;
    setPassengers: (count: number) => void;
    selectedDate: string;
    setSelectedDate: (date: string) => void;
}

const BookingForm = ({
    tripType,
    setTripType,
    passengers,
    setPassengers,
    selectedDate,
    setSelectedDate,
}: BookingFormProps) => {
    return (
        <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-lg p-6 text-white">
            <LocationTabs />
            {/* Form Fields */}
            <div className="space-y-4">
                <div>
                    <label className="block text-white mb-2">Điểm đón:</label>
                    <select className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50">
                        <option value="">Chọn điểm đón</option>
                        <option value="center">Khu Origami</option>
                        <option value="airport">Khu RainBow</option>
                    </select>
                </div>

                <div>
                    <label className="block text-white mb-2">Điểm đến:</label>
                    <select className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50">
                        <option value="">Chọn điểm đến</option>
                        <option value="center">Khu Origami</option>
                        <option value="airport">Khu RainBow</option>
                    </select>
                </div>

                <div>
                    <label className="block text-white mb-2">Loại chuyến đi:</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setTripType('one-way')}
                            className={`p-3 rounded-lg flex items-center justify-center gap-2
                                ${tripType === 'one-way'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-white/20 text-white'}`}
                        >
                            Một chiều →
                        </button>
                        <button
                            onClick={() => setTripType('roundtrip')}
                            className={`p-3 rounded-lg flex items-center justify-center gap-2
                                ${tripType === 'roundtrip'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-white/20 text-white'}`}
                        >
                            Khứ hồi ⇄
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-white mb-2">Ngày đi:</label>
                    <input
                        type="date"
                        className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-white mb-2">Số hành khách:</label>
                    <div className="flex items-center border border-white/30 rounded-lg bg-white/20">
                        <button
                            className="p-3 text-white hover:bg-white/10"
                            onClick={() => setPassengers(Math.max(1, passengers - 1))}
                            aria-label="Giảm số hành khách"
                        >
                            -
                        </button>
                        <input
                            type="number"
                            value={passengers}
                            onChange={(e) => setPassengers(Number(e.target.value))}
                            className="w-full text-center bg-transparent text-white border-none focus:ring-0"
                            min="1"
                            aria-label="Số hành khách"
                        />
                        <button
                            className="p-3 text-white hover:bg-white/10"
                            onClick={() => setPassengers(passengers + 1)}
                            aria-label="Tăng số hành khách"
                        >
                            +
                        </button>
                    </div>
                </div>

                <button className="w-full bg-yellow-400 text-gray-900 p-4 rounded-lg font-medium hover:bg-yellow-500 transition-colors">
                    TIẾP TỤC
                </button>
            </div>
        </div>
    );
};

export default BookingForm;