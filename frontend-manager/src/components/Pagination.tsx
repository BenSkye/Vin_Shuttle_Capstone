interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
    const handlePrev = () => {
        if (currentPage > 1) onPageChange(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) onPageChange(currentPage + 1);
    };

    return (
        <div className="p-4 flex items-center justify-between text-gray-500">
            <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Prev
            </button>
            <div className="flex items-center gap-2 text-sm">
                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index + 1}
                        onClick={() => onPageChange(index + 1)}
                        className={`px-2 rounded-sm ${currentPage === index + 1 ? "bg-lamaSky text-white" : ""
                            }`}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
            <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;