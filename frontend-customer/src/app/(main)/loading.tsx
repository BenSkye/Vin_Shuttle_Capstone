import { Spin } from 'antd'

export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <h1>Loading...</h1>
      <Spin size="large" />
    </div>
  )
}
//yessir