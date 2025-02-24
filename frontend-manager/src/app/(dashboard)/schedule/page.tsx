'use client';

import React, { useState } from 'react';
import { ScheduleCalendar } from '@/components/ScheduleCalendar';
import { Modal, Input, Form, Button } from 'antd';
import { Activity } from '@/interfaces/index';

const SchedulePage = () => {
    const [activities, setActivities] = useState([
        {
            id: '1',
            title: 'Team Meeting',
            description: 'Weekly team sync',
            startTime: '09:00',
            endTime: '10:00',
            day: 1, // Monday
            color: 'bg-blue-100 hover:bg-blue-200'
        },
        {
            id: '2',
            title: 'Client Call',
            description: 'Project review with client',
            startTime: '14:00',
            endTime: '15:00',
            day: 3, // Wednesday
            color: 'bg-green-100 hover:bg-green-200'
        },
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedDay, setSelectedDay] = useState(0);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const [form] = Form.useForm();

    const handleActivityClick = (activity: Activity) => {
        setSelectedActivity(activity);
        form.setFieldsValue({
            title: activity.title,
            description: activity.description || '',
            endTime: activity.endTime
        });
        setIsModalOpen(true);
    };

    const handleSlotClick = (time: string, day: number) => {
        setSelectedActivity(null);
        setSelectedTime(time);
        setSelectedDay(day);
        setIsModalOpen(true);
        form.resetFields();
    };

    const handleModalOk = () => {
        form.validateFields().then(values => {
            if (selectedActivity) {
                // Update existing activity
                setActivities(prev =>
                    prev.map(act =>
                        act.id === selectedActivity.id
                            ? { ...act, ...values }
                            : act
                    )
                );
            } else {


                // Add new activity
                const newActivity = {
                    id: (activities.length + 1).toString(),
                    title: values.title,
                    description: values.description,
                    startTime: selectedTime,
                    endTime: values.endTime,
                    day: selectedDay,
                    color: 'bg-yellow-100 hover:bg-yellow-200'
                };
                setActivities([...activities, newActivity]);
            }
            setIsModalOpen(false);
            form.resetFields();
        });
    };

    const handleDelete = () => {
        if (selectedActivity) {
            setActivities(prev => prev.filter(act => act.id !== selectedActivity.id));
            setIsModalOpen(false);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Weekly Schedule</h1>
            <ScheduleCalendar
                activities={activities}
                onActivityClick={handleActivityClick}
                onSlotClick={handleSlotClick}
            />

            {/* Modal for Adding/Editing Activity */}
            <Modal
                title={selectedActivity ? 'Edit Activity' : 'Add Activity'}
                open={isModalOpen}
                onOk={handleModalOk}
                onCancel={() => setIsModalOpen(false)}
                okText={selectedActivity ? 'Update' : 'Add'}
                cancelText="Cancel"
                footer={[
                    <Button key="cancel" onClick={() => setIsModalOpen(false)}>
                        Cancel
                    </Button>,
                    selectedActivity && (
                        <Button key="delete" danger onClick={handleDelete}>
                            Delete
                        </Button>
                    ),
                    <Button key="submit" type="primary" onClick={handleModalOk}>
                        {selectedActivity ? 'Update' : 'Add'}
                    </Button>
                ]}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="title"
                        label="Tên Tài Xế"
                        rules={[{ required: true, message: 'Please enter a title' }]}
                    >
                        <Input placeholder="Enter activity title" />
                    </Form.Item>



                </Form>
            </Modal>
        </div>
    );
};

export default SchedulePage;
