"use client";

import React, { useState, useEffect } from "react";
import { getAllRating, RatingQuery } from "@/services/api/rating";

interface Rating {
    _id: string;
    tripId: string;
    driverId: string;
    customerId: string;
    rate: number;
    feedback: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    serviceType?: string;
}

const RatingPage: React.FC = () => {
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [filteredRatings, setFilteredRatings] = useState<Rating[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [sortOrder, setSortOrder] = useState<string>("newest");
    const [serviceType, setServiceType] = useState<string>("all");
    const [filterFeedback, setFilterFeedback] = useState<string>("all");
    const [searchCustomerId, setSearchCustomerId] = useState<string>("");
    const [searchDriverId, setSearchDriverId] = useState<string>("");
    // Pagination states
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage] = useState<number>(10);

    useEffect(() => {
        console.log('Effect triggered with serviceType:', serviceType);
        fetchRatings();
    }, [serviceType]);

    useEffect(() => {
        // Apply filtering and sorting whenever the filter parameters change
        applyFiltersAndSort();
    }, [ratings, filterFeedback, sortOrder]);

    const fetchRatings = async () => {
        try {
            setLoading(true);
            const query: RatingQuery = {};

            if (serviceType !== "all") {
                query.serviceType = serviceType as 'booking_hour' | 'booking_scenic_route' | 'booking_share' | 'booking_destination';
            }

            if (searchCustomerId.trim()) {
                query.customerId = searchCustomerId.trim();
            }

            if (searchDriverId.trim()) {
                query.driverId = searchDriverId.trim();
            }

            console.log('Fetching ratings with query:', query);
            const data = await getAllRating(query);
            console.log('Ratings data received:', data);
            setRatings(data);

            // Apply filters to the newly fetched data
            applyFiltersAndSort(data);

            // Reset to first page when new data is fetched
            setCurrentPage(1);
        } catch (error) {
            console.error("Error fetching ratings:", error);
        } finally {
            setLoading(false);
        }
    };

    const applyFiltersAndSort = (data: Rating[] = ratings) => {
        // Filter reviews based on feedback
        let result = filterFeedback === "all"
            ? data
            : data.filter(review =>
                filterFeedback === "replied"
                    ? review.feedback.trim() !== ""
                    : review.feedback.trim() === ""
            );

        // Sort reviews based on date or rating
        result = [...result].sort((a, b) => {
            if (sortOrder === "newest") {
                return new Date(b.createdAt) > new Date(a.createdAt) ? 1 : -1;
            } else if (sortOrder === "oldest") {
                return new Date(a.createdAt) > new Date(b.createdAt) ? 1 : -1;
            } else if (sortOrder === "highest") {
                return b.rate - a.rate;
            } else {
                return a.rate - b.rate;
            }
        });

        setFilteredRatings(result);
        setCurrentPage(1); // Reset to first page when filters change
    };

    const handleSearch = () => {
        fetchRatings();
    };

    const handleClearSearch = () => {
        setSearchCustomerId("");
        setSearchDriverId("");
        // Only reset to all service types if we have active search filters
        if (searchCustomerId || searchDriverId) {
            setServiceType("all");
        }
        // Fetch with cleared filters
        setTimeout(fetchRatings, 0);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // Get current page items
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredRatings.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredRatings.length / itemsPerPage);

    // Change page
    const handlePageChange = (pageNumber: number) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
    };

    // Log pagination info
    useEffect(() => {
        console.log('Pagination:', {
            currentPage,
            totalPages,
            itemsPerPage,
            totalItems: filteredRatings.length,
            displayedItems: currentItems.length
        });
    }, [currentPage, filteredRatings, currentItems.length]);

    // Calculate statistics
    const totalReviews = ratings.length;
    const pendingReviews = ratings.filter(r => r.feedback.trim() === "").length;
    const averageRating = totalReviews > 0
        ? (ratings.reduce((sum, r) => sum + r.rate, 0) / totalReviews).toFixed(2)
        : "0.00";

    // Log statistics
    useEffect(() => {
        console.log('Statistics:', {
            totalReviews,
            pendingReviews,
            averageRating
        });
    }, [totalReviews, pendingReviews, averageRating]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };





    useEffect(() => {
        console.log('Sort order changed:', sortOrder);
    }, [sortOrder]);

    useEffect(() => {
        console.log('Service type filter changed:', serviceType);
    }, [serviceType]);

    useEffect(() => {
        console.log('Feedback filter changed:', filterFeedback);
    }, [filterFeedback]);

    // Pagination controls component
    const PaginationControls = () => {
        if (totalPages <= 1) return null;

        return (
            <div className="flex items-center justify-center mt-4 mb-6 space-x-2">
                <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Go to first page"
                >
                    «
                </button>
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Go to previous page"
                >
                    ‹
                </button>

                <div className="flex items-center space-x-1">
                    {[...Array(totalPages)].map((_, i) => {
                        // Show limited page numbers with ellipsis
                        if (
                            totalPages <= 7 ||
                            i + 1 === 1 ||
                            i + 1 === totalPages ||
                            (i + 1 >= currentPage - 1 && i + 1 <= currentPage + 1)
                        ) {
                            return (
                                <button
                                    key={i}
                                    onClick={() => handlePageChange(i + 1)}
                                    className={`px-3 py-1 rounded text-sm font-medium ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'border'}`}
                                    aria-label={`Go to page ${i + 1}`}
                                    aria-current={currentPage === i + 1 ? "page" : undefined}
                                >
                                    {i + 1}
                                </button>
                            );
                        } else if (
                            (i + 1 === 2 && currentPage > 3) ||
                            (i + 1 === totalPages - 1 && currentPage < totalPages - 2)
                        ) {
                            return <span key={i} className="px-1">…</span>;
                        }
                        return null;
                    })}
                </div>

                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Go to next page"
                >
                    ›
                </button>
                <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Go to last page"
                >
                    »
                </button>
            </div>
        );
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Đánh Giá Dịch Vụ</h1>
                <p className="text-gray-600 text-sm mt-1">
                    Theo dõi các đánh giá của khách hàng về dịch vụ VinShuttle.{" "}
                    <a href="#" className="text-blue-600 hover:underline">
                        Hướng dẫn quản lý đánh giá
                    </a>
                </p>
            </div>

            {/* Overview */}
            <div className="bg-white rounded-lg shadow-sm mt-6 p-6 grid grid-cols-3 text-center text-gray-700">
                <div>
                    <p className="text-2xl font-semibold">{totalReviews}</p>
                    <p className="text-sm text-gray-500">Tổng số đánh giá</p>
                </div>
                <div>
                    <p className="text-2xl font-semibold">{pendingReviews}</p>
                    <p className="text-sm text-gray-500">Đánh giá chưa trả lời</p>
                </div>
                <div>
                    <p className="text-2xl font-semibold">{averageRating}</p>
                    <p className="text-sm text-gray-500">Điểm đánh giá trung bình</p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm mt-6 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-1/3">
                        <label htmlFor="customerIdSearch" className="block text-sm font-medium text-gray-700 mb-1">
                            Tìm theo ID khách hàng
                        </label>
                        <input
                            id="customerIdSearch"
                            type="text"
                            value={searchCustomerId}
                            onChange={(e) => setSearchCustomerId(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Nhập ID khách hàng"
                            className="w-full border rounded-md px-3 py-2 text-sm"
                        />
                    </div>
                    <div className="w-full sm:w-1/3">
                        <label htmlFor="driverIdSearch" className="block text-sm font-medium text-gray-700 mb-1">
                            Tìm theo ID tài xế
                        </label>
                        <input
                            id="driverIdSearch"
                            type="text"
                            value={searchDriverId}
                            onChange={(e) => setSearchDriverId(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Nhập ID tài xế"
                            className="w-full border rounded-md px-3 py-2 text-sm"
                        />
                    </div>
                    <div className="flex items-end gap-2">
                        <button
                            onClick={handleSearch}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                            Tìm kiếm
                        </button>
                        <button
                            onClick={handleClearSearch}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                            Xóa bộ lọc
                        </button>
                    </div>
                </div>
            </div>

            {/* Reviews Table */}
            <div className="bg-white rounded-lg shadow-sm mt-6 overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 py-3 border-b gap-2">
                    <h2 className="font-medium text-gray-800">Danh Sách Đánh Giá</h2>
                    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center w-full sm:w-auto">
                        <div className="flex gap-2 w-full sm:w-auto">
                            <select
                                className="border rounded px-2 py-1 text-sm"
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                            >
                                <option value="newest">Mới nhất</option>
                                <option value="oldest">Cũ nhất</option>
                                <option value="highest">Điểm cao nhất</option>
                                <option value="lowest">Điểm thấp nhất</option>
                            </select>

                            <select
                                className="border rounded px-2 py-1 text-sm"
                                value={serviceType}
                                onChange={(e) => setServiceType(e.target.value)}
                            >
                                <option value="all">Tất cả</option>
                                <option value="booking_hour">Đặt xe theo giờ</option>
                                <option value="booking_scenic_route">Đặt xe tham quan</option>
                                <option value="booking_share">Đặt xe đi chung</option>
                                <option value="booking_destination">Đặt xe điểm đến</option>
                            </select>

                            <select
                                className="border rounded px-2 py-1 text-sm"
                                value={filterFeedback}
                                onChange={(e) => setFilterFeedback(e.target.value)}
                            >
                                <option value="all">Tất cả feedback</option>
                                <option value="replied">Có feedback</option>
                                <option value="pending">Không có feedback</option>
                            </select>

                        </div>
                        {/* <button className="text-sm text-blue-600 hover:underline">
                            Tải xuống CSV
                        </button> */}
                    </div>
                </div>



                {loading ? (
                    <div className="px-4 py-16 text-center text-gray-500">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-600 mb-2"></div>
                        <p>Đang tải dữ liệu...</p>
                    </div>
                ) : filteredRatings.length > 0 ? (
                    <>
                        {/* Table Header */}
                        <div className="grid grid-cols-1 sm:grid-cols-5 items-center px-4 py-3 border-t bg-gray-50 text-sm font-medium text-gray-700">
                            <div className="col-span-2">Đánh giá</div>
                            <div>Ngày đánh giá</div>
                            <div>ID Khách hàng</div>
                            <div>ID Tài xế</div>
                        </div>

                        {/* Table Rows */}
                        {currentItems.map((review) => (
                            <div
                                key={review._id}
                                className="grid grid-cols-1 sm:grid-cols-5 items-start sm:items-center px-4 py-3 border-t text-sm gap-2 sm:gap-0"
                            >
                                <div className="col-span-2">
                                    <div className="flex items-center space-x-1 text-yellow-500">
                                        {"★".repeat(review.rate)}
                                        {"☆".repeat(5 - review.rate)}
                                    </div>
                                    <div className="text-gray-800 mt-1">
                                        {review.feedback ? review.feedback : "Không feedback"}
                                    </div>
                                </div>
                                <div className="text-gray-600">{formatDate(review.createdAt)}</div>
                                <div className="text-gray-600 truncate">{review.customerId}</div>
                                <div className="text-gray-600 truncate">{review.driverId}</div>
                            </div>
                        ))}
                    </>
                ) : (
                    <div className="px-4 py-6 text-center text-gray-500">
                        Không tìm thấy đánh giá nào
                    </div>
                )}



                {/* Pagination controls */}
                {!loading && filteredRatings.length > 0 && <PaginationControls />}

                {/* Filter status indicator */}
                {!loading && (
                    <div className="px-4 py-2 text-sm text-gray-500 text-center border-t">
                        Hiển thị {filteredRatings.length > 0 ? `${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, filteredRatings.length)} trong số ${filteredRatings.length}` : '0'}
                        {ratings.length !== filteredRatings.length && ` (đã lọc từ ${ratings.length} đánh giá)`} đánh giá
                    </div>
                )}

            </div>
        </div>
    );
};

export default RatingPage;
