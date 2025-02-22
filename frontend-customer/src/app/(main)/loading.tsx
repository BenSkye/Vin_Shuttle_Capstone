import { Spin } from 'antd'

export default function Loading() {
    return (
        <div className="flex justify-center items-center h-screen">
            <h1>Loading...</h1>
            <Spin size="large" />
        </div>
    )
}