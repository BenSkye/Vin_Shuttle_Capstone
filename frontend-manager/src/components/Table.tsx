import React from "react";
import { Column } from "@/interfaces/index";


interface TableProps<T> {
    columns: Column<T>[];
    renderRow: (item: T) => React.ReactNode;
    data: T[];
}

const Table = <T,>({ columns, renderRow, data }: TableProps<T>) => {
    return (
        <table className="w-full mt-4 border-collapse">
            <thead>
                <tr className="bg-gray-100 text-left text-gray-600 text-sm">
                    {columns.map((col) => (
                        <th key={col.accessor as string} className={`px-4 py-2 ${col.className || ''}`}>
                            {col.header}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((item, index) => (
                    <React.Fragment key={`row-${index}`}>
                        {renderRow(item)}
                    </React.Fragment>
                ))}
            </tbody>
        </table>
    );
};
export default Table;
