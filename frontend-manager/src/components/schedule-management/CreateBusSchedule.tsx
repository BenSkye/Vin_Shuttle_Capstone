'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CreateBusScheduleProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateBusSchedule = ({ isOpen, onClose, onSuccess }: CreateBusScheduleProps) => {
    const [formData, setFormData] = useState({
        busRoute: '',
        tripsPerDay: 1,
        dailyStartTime: '',
        dailyEndTime: '',
        effectiveDate: '',
        expiryDate: '',
        status: 'active'
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/api/bus-schedules', {
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
            console.error('Error creating bus schedule:', error);
            alert('Failed to create schedule');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field: string, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Bus Schedule</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                        <Label htmlFor="tripsPerDay">Trips Per Day</Label>
                        <Input
                            id="tripsPerDay"
                            type="number"
                            min={1}
                            value={formData.tripsPerDay}
                            onChange={(e) => handleChange('tripsPerDay', parseInt(e.target.value))}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dailyStartTime">Daily Start Time</Label>
                        <Input
                            id="dailyStartTime"
                            type="time"
                            value={formData.dailyStartTime}
                            onChange={(e) => handleChange('dailyStartTime', e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dailyEndTime">Daily End Time</Label>
                        <Input
                            id="dailyEndTime"
                            type="time"
                            value={formData.dailyEndTime}
                            onChange={(e) => handleChange('dailyEndTime', e.target.value)}
                            required
                        />
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
                            onValueChange={(value) => handleChange('status', value)}
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