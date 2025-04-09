'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CreateDriverScheduleProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const DAYS_OF_WEEK = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
];

export const CreateDriverSchedule = ({ isOpen, onClose, onSuccess }: CreateDriverScheduleProps) => {
    const [formData, setFormData] = useState({
        driverName: '',
        busRoute: '',
        shiftStartTime: '',
        shiftEndTime: '',
        workingDays: [] as string[],
        effectiveDate: '',
        expiryDate: '',
        status: 'active'
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/api/driver-schedules', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to create schedule');

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error creating driver schedule:', error);
            alert('Failed to create schedule');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field: string, value: string | string[]) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const toggleWorkingDay = (day: string) => {
        const currentDays = formData.workingDays;
        const newDays = currentDays.includes(day)
            ? currentDays.filter(d => d !== day)
            : [...currentDays, day];
        handleChange('workingDays', newDays);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Driver Schedule</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="driverName">Driver Name</Label>
                        <Input
                            id="driverName"
                            value={formData.driverName}
                            onChange={(e) => handleChange('driverName', e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="busRoute">Bus Route</Label>
                        <Input
                            id="busRoute"
                            value={formData.busRoute}
                            onChange={(e) => handleChange('busRoute', e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="shiftStartTime">Shift Start Time</Label>
                        <Input
                            id="shiftStartTime"
                            type="time"
                            value={formData.shiftStartTime}
                            onChange={(e) => handleChange('shiftStartTime', e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="shiftEndTime">Shift End Time</Label>
                        <Input
                            id="shiftEndTime"
                            type="time"
                            value={formData.shiftEndTime}
                            onChange={(e) => handleChange('shiftEndTime', e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Working Days</Label>
                        <div className="flex flex-wrap gap-2">
                            {DAYS_OF_WEEK.map((day) => (
                                <Button
                                    key={day}
                                    type="button"
                                    variant={formData.workingDays.includes(day) ? "default" : "outline"}
                                    onClick={() => toggleWorkingDay(day)}
                                    className="flex-1 min-w-[100px]"
                                >
                                    {day}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="effectiveDate">Effective Date</Label>
                        <Input
                            id="effectiveDate"
                            type="date"
                            value={formData.effectiveDate}
                            onChange={(e) => handleChange('effectiveDate', e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                            id="expiryDate"
                            type="date"
                            value={formData.expiryDate}
                            onChange={(e) => handleChange('expiryDate', e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value: string) => handleChange('status', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create Schedule'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}; 