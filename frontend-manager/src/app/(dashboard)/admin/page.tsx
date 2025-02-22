import UserCard from "@/components/UserCard"
import CountChart from "@/components/CountChart"
import AttendanceChart from "@/components/AttendanceChart"

const AdminPage = () => {
    return (
        <div className="p-4 flex gap-4 flex-col md:flex-row">
            {/* LEFT */}
            <div className="w-full lg:w-2/3 flex flex-col gap-8">
                {/* UserCard */}
                <div className="flex gap-4 justify-between flex-wrap">
                    <UserCard type="customers" />
                    <UserCard type="drivers" />
                    <UserCard type="vehicles" />
                    <UserCard type="routes" />
                </div>

                {/* MIDDLE CHART */}
                <div className="flex gap-4 flex-col lg:flex-row">
                    {/* COUNT CHART */}
                    <div className="w-full lg:w-1/3 h-[450px]">
                        <CountChart />
                    </div>
                    {/* ATENDANCE CHART */}
                    <div className="w-full lg:w-2/3 h-[450px]">
                        <AttendanceChart />
                    </div>
                </div>
                {/* BOTTOM CHART */}
                <div className="w-full h-[500px]"></div>

            </div>
            {/* RIGHT */}
            <div className="w-full lg:w-1/3">r</div>
        </div>
    )
}
export default AdminPage