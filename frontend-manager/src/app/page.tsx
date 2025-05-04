import UserCard from '@/components/UserCard'

import EventCalendar from '@/components/EventCalendar'

import Menu from '@/components/Menu'
import Link from 'next/link'
import Image from 'next/image'
import NavBar from '@/components/NavBar'
// import CountChart from '@/components/CountChart'
import AttendanceChart from '@/components/AttendanceChart'
// import FinanceChart from '@/components/FinanceChart'

export default function Home() {

    //yessir
    return (
        <div className="h-screen flex">
            <div className='w-[14%] md:w-[8%] lg:w[16%] xl:w-[14%]  p-4'>
                <Link href='/' className='flex items-center justify-center lg:justify-start gap-2'>
                    <Image src='/favicon.svg' alt='logo' width={32} height={32} />
                    <span className='hidden lg:block font-bold'>Vinshuttle</span>
                </Link>
                <Menu />

            </div>
            <div className="w-[86%] md:w-[92%] lg:w[84%] xl:w-[86%] bg-[#F7F8FA] overflow-scroll">
                <NavBar />
                <div className="p-4 flex gap-4 flex-col md:flex-row">
                    {/* LEFT */}
                    <div className="w-full lg:w-2/3 flex flex-col gap-8">
                        {/* UserCard */}
                        <div className="flex gap-4 justify-between flex-wrap">
                            <UserCard type="Khách hàng" />
                            <UserCard type="Tài xế" />

                        </div>

                        {/* MIDDLE CHART */}
                        <div className="">

                            {/* <div className="w-full lg:w-1/3 h-[450px]">
                                <CountChart />

                            </div> */}
                            {/* ATENDANCE CHART */}
                            <div className="">
                                <AttendanceChart />
                            </div>
                        </div>
                        {/* BOTTOM CHART */}
                        <div className="w-full h-[500px]">
                            {/* <FinanceChart /> */}
                        </div>

                    </div>
                    {/* RIGHT */}
                    <div className="w-full lg:w-1/3 flex flex-col gap-8">
                        <EventCalendar />

                    </div>
                </div>
            </div>
        </div>
    )
}