'use client';
import { useState, useEffect } from "react";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";

import Image from "next/image";

import { Column } from '@/interfaces/index';
import { Driver, DriverFilters } from "@/interfaces/index";
import { createDriver, filterDriver } from "@/services/api/driver";
import Link from "next/link";
import { Button, Form, Input, message, Modal, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { RcFile, UploadChangeParam, UploadFile } from "antd/es/upload";

const columns: Column<Driver>[] = [
    {
        header: "Tên",
        accessor: "name",
    },
    {
        header: "Điện thoại",
        accessor: "phone",
        className: "hidden md:table-cell",
    },
    {
        header: "Ngày tạo",
        accessor: "createdAt",
        className: "hidden md:table-cell",
    },

];

const DriverPage = () => {
    const [form] = Form.useForm();
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    // const [newDriver, setNewDriver] = useState({
    //     name: '',
    //     phone: '',
    //     email: '',
    //     password: ''
    // });
    const [filterParams, setFilterParams] = useState<DriverFilters>({
        sortOrder: 'desc',
        orderBy: 'createdAt',
        role: 'driver',
        name: '',
        phone: '',
        email: '',
    });
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    // const [imageFile, setImageFile] = useState<File | null>(null);
    // const [imagePreview, setImagePreview] = useState<string | null>(null);
    // const fileInputRef = useRef<HTMLInputElement>(null);
    const itemsPerPage = 5;

    const totalPages = Math.ceil(drivers.length / itemsPerPage);

    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async (filters: DriverFilters = { sortOrder: 'desc', role: 'driver', orderBy: 'createdAt' }) => {
        try {
            console.log("Fetching drivers with filters:", filters);
            const response = await filterDriver(filters);
            console.log("Filtered Drivers Response:", response);

            // Sort drivers according to the specified sort order
            const sortedDrivers = sortDriversByDate(response, filters.sortOrder);
            setDrivers(sortedDrivers);
        } catch (error) {
            console.error("Error fetching drivers:", error);
        }
    };

    // Function to sort drivers by createdAt date based on sortOrder
    const sortDriversByDate = (driversList: Driver[], sortOrder: string = 'desc'): Driver[] => {
        return [...driversList].sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

            // Sort ascending (oldest first) or descending (newest first) based on sortOrder
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const paginatedDrivers = drivers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    // const handleCloseModal = () => {
    //     setIsModalOpen(false);
    //     setNewDriver({
    //         name: '',
    //         phone: '',
    //         email: '',
    //         password: ''
    //     });
    //     setImageFile(null);
    //     setImagePreview(null);
    // };

    const handleOpenFilterModal = () => {
        setIsFilterModalOpen(true);
    };

    const handleCloseFilterModal = () => {
        setIsFilterModalOpen(false);
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilterParams(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleApplyFilter = () => {
        console.log("Applying filters with params:", filterParams);
        fetchDrivers(filterParams);
        handleCloseFilterModal();
        setCurrentPage(1); // Reset to first page when applying filters
    };

    const handleResetFilter = () => {
        const defaultFilters = {
            sortOrder: 'desc',
            orderBy: 'createdAt',
            role: 'driver',
            name: '',
            phone: '',
            email: '',
        };
        console.log("Resetting filters to defaults:", defaultFilters);
        setFilterParams(defaultFilters);
        fetchDrivers(defaultFilters);
        handleCloseFilterModal();
        setCurrentPage(1);
    };

    const handleSearch = (query: string) => {
        if (query.trim()) {
            // If there's a search query, update the name filter and apply it
            const searchFilters = {
                ...filterParams,
                name: query,
            };
            console.log("Searching with filters:", searchFilters);
            fetchDrivers(searchFilters);
        } else {
            // If search is cleared, reset to current filters without the name
            const { name, ...restFilters } = filterParams;
            console.log("Cleared search, using filters:", name, restFilters);
            fetchDrivers(restFilters);
        }
        setCurrentPage(1);
    };

    const handleSortOrderChange = () => {
        const newSortOrder = filterParams.sortOrder === 'asc' ? 'desc' : 'asc';
        const updatedFilters = {
            ...filterParams,
            sortOrder: newSortOrder
        };
        console.log("Changed sort order to:", newSortOrder, "Updated filters:", updatedFilters);
        setFilterParams(updatedFilters);
        fetchDrivers(updatedFilters);
    };

    // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const { name, value } = e.target;
    //     setNewDriver(prev => ({
    //         ...prev,
    //         [name]: value
    //     }));
    // };

    // const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const file = e.target.files?.[0];
    //     if (file) {
    //         setImageFile(file);
    //         const reader = new FileReader();
    //         reader.onloadend = () => {
    //             setImagePreview(reader.result as string);
    //         };
    //         reader.readAsDataURL(file);
    //     }
    // };

    // const handleImageClick = () => {
    //     fileInputRef.current?.click();
    // };

    // const handleRemoveImage = (e: React.MouseEvent) => {
    //     e.stopPropagation();
    //     setImageFile(null);
    //     setImagePreview(null);
    //     if (fileInputRef.current) {
    //         fileInputRef.current.value = '';
    //     }
    // };

    const handleChange = (info: UploadChangeParam<UploadFile>) => {
        let fileList = [...info.fileList];
        fileList = fileList.slice(-1); // Chỉ cho phép 1 file
        setFileList(fileList);
    };


    const handleRemove = () => {
        setFileList([]);
        return true;
    };
    const beforeUpload = (file: RcFile) => {
        console.log("File before upload:", file);
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('Chỉ được tải lên file ảnh!');
            return Upload.LIST_IGNORE;
        }
        return false;
    };

    interface DriverFormValues {
        name: string;
        phone: string;
        email: string;
        password: string;
    }

    const handleAddDriver = async (values: DriverFormValues) => {
        try {
            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('phone', values.phone);
            formData.append('email', values.email);
            formData.append('password', values.password);
            formData.append('role', 'driver');

            if (fileList.length > 0 && fileList[0].originFileObj) {
                formData.append('avatar', fileList[0].originFileObj as RcFile);
            }

            const response = await createDriver(
                values.name,
                values.phone,
                values.email,
                values.password,
                fileList.length > 0 ? fileList[0].originFileObj : "",
                "driver"
            );

            if (response && response._id) {
                message.success('Thêm tài xế thành công');
                fetchDrivers(filterParams);
                setIsModalOpen(false);
                form.resetFields();
                setFileList([]);
            }
        } catch (error) {
            console.error("Error adding driver:", error);
            message.error('Thêm tài xế thất bại');
        }
    };

    const renderRow = (item: Driver) => (
        <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-gray-100">
            {/* Name Column */}
            <td className="flex items-center gap-4 p-4">
                {item.avatar ? (
                    <Image
                        src={item.avatar}
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

            {/* Created At Column */}
            <td className="hidden md:table-cell px-4 py-2">
                {item.createdAt ? formatDate(item.createdAt) : 'N/A'}
            </td>

            {/* Action Column */}
            <td className="px-4 py-2">
                <div className="flex items-center gap-2">
                    <Link href={`/drivers/${item._id}`}>
                        <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
                            <Image src="/icons/view.png" alt="View" width={16} height={16} />
                        </button>
                    </Link>

                    {/* <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaPurple">
                        <Image src="/icons/delete.png" alt="Delete" width={16} height={16} />
                    </button> */}

                </div>
            </td>
        </tr>
    );

    const formatDate = (dateString: string): string => {
        try {
            const date = new Date(dateString);

            // Check if date is valid
            if (isNaN(date.getTime())) {
                return 'Invalid date';
            }

            return date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error("Error formatting date:", error);
            return 'Invalid date';
        }
    };

    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            {/* TOP */}
            <div className="flex items-center justify-between">
                <h1 className="hidden md:block text-lg font-semibold">Danh Sách Tài Xế</h1>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <TableSearch onSearch={handleSearch} />
                    <div className="flex items-center gap-4 self-end">
                        <button
                            className="w-10 h-10 flex items-center justify-center rounded-full
                                bg-gradient-to-r from-emerald-400 to-emerald-500
                                hover:from-emerald-500 hover:to-emerald-600
                                text-white shadow-lg hover:shadow-emerald-200/50
                                transform hover:scale-105 active:scale-95
                                transition-all duration-200 ease-in-out
                                focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                            onClick={handleOpenModal}
                            aria-label="Add new driver"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && handleOpenModal()}
                        >
                            <span className="text-xl font-semibold leading-none select-none">+</span>
                        </button>
                        <button
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow"
                            onClick={handleOpenFilterModal}
                            aria-label="Filter drivers"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && handleOpenFilterModal()}
                        >
                            <Image src="/icons/filter.svg" alt="Filter" width={14} height={14} />
                        </button>
                        <button
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow"
                            onClick={handleSortOrderChange}
                            aria-label="Sort drivers"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && handleSortOrderChange()}
                        >
                            <Image src="/icons/sort.svg" alt="Sort" width={14} height={14} />
                        </button>
                    </div>
                </div>
            </div>
            {/* LIST */}
            <Table columns={columns} renderRow={renderRow} data={paginatedDrivers} />
            {/* PAGINATION */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />

            {/* Add Driver Modal */}
            <Modal
                title="Thêm Tài Xế Mới"
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                    setFileList([]);
                }}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAddDriver}
                >
                    <Form.Item
                        label="Ảnh đại diện"
                    >
                        <Upload
                            listType="picture-card"
                            fileList={fileList}
                            beforeUpload={beforeUpload}
                            onChange={handleChange}
                            onRemove={handleRemove}
                            maxCount={1}
                            accept="image/*"
                        >
                            {fileList.length >= 1 ? null : (
                                <div>
                                    <UploadOutlined />
                                    <div style={{ marginTop: 8 }}>Tải lên</div>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>

                    <Form.Item
                        label="Họ và tên"
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                    >
                        <Input placeholder="Nhập họ và tên" />
                    </Form.Item>

                    <Form.Item
                        label="Số điện thoại"
                        name="phone"
                        rules={[
                            { required: true, message: 'Vui lòng nhập số điện thoại!' },
                            { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
                        ]}
                    >
                        <Input placeholder="Nhập số điện thoại"
                            onKeyPress={(event) => {
                                if (!/[0-9]/.test(event.key)) {
                                    event.preventDefault();
                                }
                            }} />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' }
                        ]}
                    >
                        <Input placeholder="Nhập email" />
                    </Form.Item>

                    <Form.Item
                        label="Mật khẩu"
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    >
                        <Input.Password placeholder="Nhập mật khẩu" />
                    </Form.Item>

                    <Form.Item className="flex justify-end gap-4 mt-8">
                        <Button onClick={() => {
                            setIsModalOpen(false);
                            form.resetFields();
                            setFileList([]);
                        }}>
                            Hủy
                        </Button>
                        <Button type="primary" htmlType="submit">
                            Thêm tài xế
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Filter Modal */}
            {isFilterModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md transform transition-all">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Lọc Tài Xế</h2>
                            <button
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                onClick={handleCloseFilterModal}
                                aria-label="Close filter modal"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && handleCloseFilterModal()}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên tài xế
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={filterParams.name}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    placeholder="Nhập tên tài xế"
                                />
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                    Số điện thoại
                                </label>
                                <input
                                    type="text"
                                    id="phone"
                                    name="phone"
                                    value={filterParams.phone}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    placeholder="Nhập số điện thoại"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="text"
                                    id="email"
                                    name="email"
                                    value={filterParams.email}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    placeholder="Nhập email"
                                />
                            </div>

                            <div>
                                <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-2">
                                    Sắp xếp
                                </label>
                                <select
                                    id="sortOrder"
                                    name="sortOrder"
                                    value={filterParams.sortOrder}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                >
                                    <option value="desc">Mới nhất trước</option>
                                    <option value="asc">Cũ nhất trước</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleResetFilter}
                                    className="px-6 py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all font-medium"
                                >
                                    Đặt lại
                                </button>
                                <button
                                    type="button"
                                    onClick={handleApplyFilter}
                                    className="px-6 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all font-medium"
                                >
                                    Áp dụng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DriverPage;
