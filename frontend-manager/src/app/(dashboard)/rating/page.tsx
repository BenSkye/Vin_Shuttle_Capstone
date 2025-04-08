"use client";

import React, { useState } from "react";

const reviews = [
    {
        rating: 5,
        text: "Dịch vụ rất tốt, tài xế thân thiện",
        date: "15/04/2023",
        helpful: 4,
        status: "Chưa trả lời",
    },
    {
        rating: 4,
        text: "Cuốc xe khá thoải mái, chỉ tiếc là đến trễ 5 phút",
        date: "10/04/2023",
        helpful: 2,
        status: "Chưa trả lời",
    },
    {
        rating: 5,
        text: "Tuyệt vời, chắc chắn sẽ sử dụng lại",
        date: "05/04/2023",
        helpful: 7,
        status: "Đã trả lời",
    },
    {
        rating: 3,
        text: "Xe sạch sẽ nhưng tài xế không nhiệt tình",
        date: "01/04/2023",
        helpful: 1,
        status: "Đã trả lời",
    },
    {
        rating: 5,
        text: "Tài xế rất chuyên nghiệp và thân thiện",
        date: "28/03/2023",
        helpful: 5,
        status: "Chưa trả lời",
    },
];

const RatingPage: React.FC = () => {
    const [sortOrder, setSortOrder] = useState<string>("newest");
    const [filterStatus, setFilterStatus] = useState<string>("all");

    // Filter reviews based on status
    const filteredReviews = filterStatus === "all"
        ? reviews
        : reviews.filter(review =>
            filterStatus === "replied"
                ? review.status === "Đã trả lời"
                : review.status === "Chưa trả lời"
        );

    // Sort reviews based on date or rating
    const sortedReviews = [...filteredReviews].sort((a, b) => {
        if (sortOrder === "newest") {
            return new Date(b.date.split('/').reverse().join('-')) > new Date(a.date.split('/').reverse().join('-')) ? 1 : -1;
        } else if (sortOrder === "oldest") {
            return new Date(a.date.split('/').reverse().join('-')) > new Date(b.date.split('/').reverse().join('-')) ? 1 : -1;
        } else if (sortOrder === "highest") {
            return b.rating - a.rating;
        } else {
            return a.rating - b.rating;
        }
    });

    // Calculate statistics
    const totalReviews = reviews.length;
    const pendingReviews = reviews.filter(r => r.status === "Chưa trả lời").length;
    const averageRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(2);

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
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">Tất cả</option>
                                <option value="pending">Chưa trả lời</option>
                                <option value="replied">Đã trả lời</option>
                            </select>
                        </div>
                        <button className="text-sm text-blue-600 hover:underline">
                            Tải xuống CSV
                        </button>
                    </div>
                </div>

                <div>
                    <div className="grid grid-cols-1 sm:grid-cols-5 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600">
                        <div className="col-span-2">Đánh giá</div>
                        <div>Ngày</div>
                        <div>Hữu ích</div>
                        <div>Trạng thái</div>
                    </div>

                    {sortedReviews.length > 0 ? (
                        sortedReviews.map((review, idx) => (
                            <div
                                key={idx}
                                className="grid grid-cols-1 sm:grid-cols-5 items-start sm:items-center px-4 py-3 border-t text-sm gap-2 sm:gap-0"
                            >
                                <div className="col-span-2">
                                    <div className="flex items-center space-x-1 text-yellow-500">
                                        {"★".repeat(review.rating)}
                                        {"☆".repeat(5 - review.rating)}
                                    </div>
                                    <div className="text-gray-800 mt-1">{review.text}</div>
                                </div>
                                <div className="text-gray-600">{review.date}</div>
                                <div className="flex items-center">
                                    <span className="text-gray-600">{review.helpful}</span>
                                    <button className="ml-2 text-blue-500 hover:text-blue-700">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                        </svg>
                                    </button>
                                </div>
                                <div>
                                    <span className={`text-xs px-2 py-1 rounded ${review.status === "Chưa trả lời"
                                        ? "bg-red-100 text-red-600"
                                        : "bg-green-100 text-green-600"
                                        } font-semibold`}>
                                        {review.status}
                                    </span>
                                    {review.status === "Chưa trả lời" && (
                                        <button className="ml-2 text-blue-600 hover:underline text-xs">
                                            Trả lời
                                        </button>
                                    )}
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
