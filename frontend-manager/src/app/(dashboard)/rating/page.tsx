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
    const [loading, setLoading] = useState<boolean>(true);
    const [sortOrder, setSortOrder] = useState<string>("newest");
    const [serviceType, setServiceType] = useState<string>("all");
    const [filterFeedback, setFilterFeedback] = useState<string>("all");

    useEffect(() => {
        fetchRatings();
    }, [serviceType]);

    const fetchRatings = async () => {
        try {
            setLoading(true);
            const query: RatingQuery = {};

            if (serviceType !== "all") {
                query.serviceType = serviceType as 'booking_hour' | 'booking_scenic_route' | 'booking_share' | 'booking_destination';
            }

            const data = await getAllRating(query);
            setRatings(data);
        } catch (error) {
            console.error("Error fetching ratings:", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter reviews based on feedback
    const filteredReviews = filterFeedback === "all"
        ? ratings
        : ratings.filter(review =>
            filterFeedback === "replied"
                ? review.feedback.trim() !== ""
                : review.feedback.trim() === ""
        );

    // Sort reviews based on date or rating
    const sortedReviews = [...filteredReviews].sort((a, b) => {
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

    // Calculate statistics
    const totalReviews = ratings.length;
    const pendingReviews = ratings.filter(r => r.feedback.trim() === "").length;
    const averageRating = totalReviews > 0
        ? (ratings.reduce((sum, r) => sum + r.rate, 0) / totalReviews).toFixed(2)
        : "0.00";

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    // Map serviceType to display text
    const getServiceTypeDisplay = (type?: string) => {
        switch (type) {
            case 'booking_hour': return 'Đặt xe theo giờ';
            case 'booking_scenic_route': return 'Đặt xe tham quan';
            case 'booking_share': return 'Đặt xe đi chung';
            case 'booking_destination': return 'Đặt xe điểm đến';
            default: return 'Không xác định';
        }
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
                                <option value="all">Tất cả phản hồi</option>
                                <option value="replied">Đã trả lời</option>
                                <option value="pending">Chưa trả lời</option>
                            </select>
                        </div>
                        {/* <button className="text-sm text-blue-600 hover:underline">
                            Tải xuống CSV
                        </button> */}
                    </div>
                </div>

                <div>
                    <div className="grid grid-cols-1 sm:grid-cols-6 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600">
                        <div className="col-span-2">Đánh giá</div>
                        <div>Ngày</div>
                        <div>ID Khách hàng</div>
                        <div>Loại dịch vụ</div>
                        <div>Trạng thái</div>
                    </div>

                    {loading ? (
                        <div className="px-4 py-6 text-center text-gray-500">
                            Đang tải dữ liệu...
                        </div>
                    ) : sortedReviews.length > 0 ? (
                        sortedReviews.map((review) => (
                            <div
                                key={review._id}
                                className="grid grid-cols-1 sm:grid-cols-6 items-start sm:items-center px-4 py-3 border-t text-sm gap-2 sm:gap-0"
                            >
                                <div className="col-span-2">
                                    <div className="flex items-center space-x-1 text-yellow-500">
                                        {"★".repeat(review.rate)}
                                        {"☆".repeat(5 - review.rate)}
                                    </div>
                                    <div className="text-gray-800 mt-1">
                                        {review.feedback ? review.feedback : "Không có phản hồi"}
                                    </div>
                                </div>
                                <div className="text-gray-600">{formatDate(review.createdAt)}</div>
                                <div className="text-gray-600 truncate">{review.customerId}</div>
                                <div className="text-gray-600">{getServiceTypeDisplay(review.serviceType)}</div>
                                <div>
                                    <span className={`text-xs px-2 py-1 rounded ${review.feedback.trim() === ""
                                        ? "bg-red-100 text-red-600"
                                        : "bg-green-100 text-green-600"
                                        } font-semibold`}>
                                        {review.feedback.trim() === "" ? "Chưa phản hồi" : "Đã phản hồi"}
                                    </span>
                                    {/* {review.feedback.trim() === "" && (
                                        <button className="ml-2 text-blue-600 hover:underline text-xs">
                                            Trả lời
                                        </button>
                                    )} */}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="px-4 py-6 text-center text-gray-500">
                            Không tìm thấy đánh giá nào
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RatingPage;
