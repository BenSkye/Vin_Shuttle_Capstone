'use client';
import { useState, useEffect } from "react";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { role } from "@/libs/data";
import Image from "next/image";
import Link from "next/link";
import { Column } from '@/interfaces/index';
import { Driver } from "@/interfaces/index";
import { getDriver } from "@/services/api/user";

const columns: Column<Driver>[] = [
    {
        header: "Name",
        accessor: "name",
    },
    {
        header: "Phone",
        accessor: "phone",
        className: "hidden md:table-cell",
    },
    {
        header: "Action",
        accessor: "action",
    },
];

const DriverPage = () => {
    const [drivers, setDrivers] = useState<Driver[]>([]);

    useEffect(() => {
        const fetchDrivers = async () => {
            try {
                const response = await getDriver();
                console.log("Full API Response:", response);
                setDrivers(response);
            } catch (error) {
                console.error("Error fetching drivers:", error);
            }
        };

        fetchDrivers();
    }, []);

    const renderRow = (item: Driver) => (
        <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-gray-100">
            {/* Name Column */}
            <td className="flex items-center gap-4 p-4">
                {item.photo ? (
                    <Image
                        src={item.photo}
                        alt="Driver Photo"
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                )}
                <div className="flex flex-col">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-xs text-gray-500">{item.email}</p>
                </div>
            </td>

            {/* Phone Column */}
            <td className="hidden md:table-cell px-4 py-2">{item.phone}</td>

            {/* Action Column */}
            <td className="px-4 py-2">
                <div className="flex items-center gap-2">
                    <Link href={`/drivers/${item._id}`}>
                        <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
                            <Image src="/icons/view.png" alt="View" width={16} height={16} />
                        </button>
                    </Link>
                    {role === "admin" && (
                        <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaPurple">
                            <Image src="/icons/delete.png" alt="Delete" width={16} height={16} />
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );

    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            {/* TOP */}
            <div className="flex items-center justify-between">
                <h1 className="hidden md:block text-lg font-semibold">Danh Sách Tài Xế</h1>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <TableSearch />
                    <div className="flex items-center gap-4 self-end">
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                            <Image src="/icons/filter.svg" alt="Filter" width={14} height={14} />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                            <Image src="/icons/sort.svg" alt="Sort" width={14} height={14} />
                        </button>
                    </div>
                </div>
            </div>
            {/* LIST */}
            <Table columns={columns} renderRow={renderRow} data={drivers} />
            {/* PAGINATION */}
            <Pagination />
        </div>
    );
};

export default DriverPage;
