'use client'

import Image from 'next/image'
import { getCustomer } from '@/services/api/user'
import { getDriver } from '@/services/api/driver'
import { useEffect, useState } from 'react'

type UserCardProps = {
    type: string
}

const UserCard = ({ type }: UserCardProps) => {
    const [count, setCount] = useState<number>(0)

    useEffect(() => {
        const fetchData = async () => {
            if (type === "Khách hàng") {
                const data = await getCustomer()
                setCount(data?.length || 0)
            } else if (type === "Tài xế") {
                const driversData = await getDriver()
                setCount(driversData?.length || 0)
            }
            // Handle other types if needed in the future
        }

        fetchData()
    }, [type])

    return (
        <div className="rounded-2xl odd:bg-lamaPurple even:bg-lamaYellow p-4 flex-1 min-w-[130px]">
            <div className='flex justify-between items-center'>
                <span className='text-[10px] bg-white px-2 py-1 rounded-full text-green'>2024/25</span>
                <Image src="/icons/ellipsis.svg" alt="" width={20} height={20} />
            </div>
            <h1 className='text-2xl font-semibold my-4'>{count.toLocaleString()}</h1>
            <h2 className='capitalize text-sm font-medium text-gray-500'>{type}</h2>
        </div>
    )
}

export default UserCard