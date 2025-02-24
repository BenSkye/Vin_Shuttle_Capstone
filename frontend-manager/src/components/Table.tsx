import React from "react";
import { Column } from "@/interfaces/index";


interface TableProps<T> {
    columns: Column<T>[];
    renderRow: (item: T) => React.ReactNode;
    data: T[];
}

const Table = <T,>({ columns, renderRow, data }: TableProps<T>) => {
    return (
        <table className="w-full mt-4">
            <thead>
                <tr className="text-left text-gray-500 text-sm">
                    {columns.map((col) => (
                        <th key={col.accessor as string} className={col.className}>
                            {col.header}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>{data.map((item) => renderRow(item))}</tbody>
        </table>
    );
};

export default Table;
