// import Image from "next/image";
import { useState } from "react";

interface TableSearchProps {
    onSearch: (query: string) => void;
}

const TableSearch = ({ onSearch }: TableSearchProps) => {
    const [searchQuery, setSearchQuery] = useState("");

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        onSearch(value);
    };

    return (
        <div className="w-full md:w-auto flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2">
            {/* <Image src="/search.png" alt="" width={14} height={14} /> */}
            <input
                type="text"
                placeholder="Search..."
                className="w-[200px] p-2 bg-transparent outline-none"
                value={searchQuery}
                onChange={handleInputChange}
            />
        </div>
    );
};

export default TableSearch;