'use client'

import { useState } from 'react'

import { Button, DatePicker, Form, Input, Radio, TimePicker } from 'antd'

const { RangePicker } = DatePicker

const RideBookingForm = () => {
  const [form] = Form.useForm()
  const [serviceType, setServiceType] = useState('privateRental')

  const onFinish = (values: unknown) => {
    console.log('Success:', values)
  }

  return (
    <Form
      form={form}
      name="ride-booking"
      onFinish={onFinish}
      layout="vertical"
      className="rounded bg-white p-4 shadow"
    >
      <Form.Item name="serviceType" label="Service Type">
        <Radio.Group onChange={(e) => setServiceType(e.target.value)} value={serviceType}>
          <Radio.Button value="privateRental">Private Rental</Radio.Button>
          <Radio.Button value="sharedRide">Shared Ride</Radio.Button>
        </Radio.Group>
      </Form.Item>

      {serviceType === 'privateRental' && (
        <>
          <Form.Item name="rentalType" label="Rental Type">
            <Radio.Group>
              <Radio.Button value="hourly">Hourly Rental</Radio.Button>
              <Radio.Button value="route">Route-Based Rental</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="duration" label="Duration">
            <RangePicker showTime />
          </Form.Item>
        </>
      )}

      {serviceType === 'sharedRide' && (
        <>
          <Form.Item name="rideType" label="Ride Type">
            <Radio.Group>
              <Radio.Button value="fixed">Fixed Route</Radio.Button>
              <Radio.Button value="flexible">Flexible Route</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="departureTime" label="Departure Time">
            <TimePicker />
          </Form.Item>
        </>
      )}

      <Form.Item name="pickup" label="Pickup Location" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="dropoff" label="Drop-off Location" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" className="w-full">
          Book Ride
        </Button>
      </Form.Item>
    </Form>
  )
}

export default RideBookingForm
