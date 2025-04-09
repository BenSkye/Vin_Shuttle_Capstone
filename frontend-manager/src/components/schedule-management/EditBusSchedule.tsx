'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BusSchedule {
    id: string;
    busRoute: string;
    vehicles: string[];
    drivers: string[];
    tripsPerDay: number;
    dailyStartTime: string;
    dailyEndTime: string;
    effectiveDate: string;
    expiryDate: string;
    status: string;
}

interface EditBusScheduleProps {
    schedule: BusSchedule;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export const EditBusSchedule = ({ schedule, isOpen, onClose, onUpdate }: EditBusScheduleProps) => {
    const [formData, setFormData] = useState<BusSchedule>(schedule);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(`/api/bus-schedules/${schedule.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to update schedule');

            onUpdate();
            onClose();
        } catch (error) {
            console.error('Error updating bus schedule:', error);
            alert('Failed to update schedule');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field: keyof BusSchedule, value: string | number | string[]) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Bus Schedule</DialogTitle>
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
                            value={formData.tripsPerDay}
                            onChange={(e) => handleChange('tripsPerDay', parseInt(e.target.value))}
                            required
                            min={1}
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
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}; 