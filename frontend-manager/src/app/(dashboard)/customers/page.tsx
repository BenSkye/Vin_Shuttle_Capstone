'use client';

import { useState, useEffect } from "react";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";

import Image from "next/image";

import { Column } from '@/interfaces/index';
import { Customer } from "@/interfaces/index";
import { getCustomer } from "@/services/api/user";
//yessir
const columns: Column<Customer>[] = [
    { header: "Tên", accessor: "id", className: "hidden md:table-cell" },
    { header: "Số điện thoại", accessor: "name" },
];

const CustomerPage = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // Number of items per page

    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await getCustomer();

            console.log("Full API Response:", response);
            const data = response;
            console.log("Extracted Data:", data);
            if (Array.isArray(data)) {
                setCustomers(data);
                setFilteredCustomers(data);
            } else {
                console.error("API returned unexpected data format:", data);
            }
        } catch (error) {
            console.error("Error fetching customers:", error);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSearch = (query: string) => {
        if (query.trim()) {
            // Filter customers by name, email, or phone
            const filtered = customers.filter(customer =>
                customer.name?.toLowerCase().includes(query.toLowerCase()) ||
                customer.email?.toLowerCase().includes(query.toLowerCase()) ||
                customer.phone?.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredCustomers(filtered);
        } else {
            // If search is cleared, show all customers
            setFilteredCustomers(customers);
        }
        setCurrentPage(1); // Reset to first page when searching
    };

    const paginatedCustomers = filteredCustomers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const renderRow = (item: Customer) => (
        <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
            <td className="flex items-center gap-4 p-4">
                <Image
                    src="/icons/user.png"
                    alt=""
                    width={40}
                    height={40}
                    className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
                />
                <div className="flex flex-col">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-xs text-gray-500">{item.email}</p>
                </div>
            </td>
            <td className="hidden md:table-cell">{item.phone}</td>
            <td>
                <div className="flex items-center gap-2">

                </div>
            </td>
        </tr>
    );

    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            {/* TOP */}
            <div className="flex items-center justify-between">
                <h1 className="hidden md:block text-lg font-semibold">Danh Sách Khách Hàng</h1>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <TableSearch onSearch={handleSearch} />
                    <div className="flex items-center gap-4 self-end">
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                            <Image src="/icons/filter.svg" alt="" width={14} height={14} />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                            <Image src="/icons/sort.svg" alt="" width={14} height={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* TABLE */}
            <Table columns={columns} renderRow={renderRow} data={paginatedCustomers} />

            {/* PAGINATION */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />

            {/* Filter status indicator */}
            <div className="px-4 py-2 text-sm text-gray-500 text-center">
                Hiển thị {filteredCustomers.length > 0 ?
                    `${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, filteredCustomers.length)} trong số ${filteredCustomers.length}` :
                    '0'}
                {customers.length !== filteredCustomers.length && ` (đã lọc từ ${customers.length} khách hàng)`} khách hàng
            </div>
        </div>
    );
};

export default CustomerPage;
