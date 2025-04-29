"use client";
import React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getExpandedRowModel,
    useReactTable, ExpandedState, Row,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {Input} from "@/components/ui/input"
import { ChevronDown, ChevronRight } from "lucide-react"
import UserPermissions from "@/components/dashboard/UserPermissions"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    renderSubComponent?: (props: { row: Row<TData> }) => React.ReactElement
}

export function DataTable<TData, TValue>({
                                             columns,
                                             data,
                                             renderSubComponent,
                                         }: DataTableProps<TData, TValue>) {

    const [sorting,setSorting] = React.useState<SortingState>([]);
    const [columnFilters,setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [expanded, setExpanded] = React.useState<ExpandedState>({});

    const table = useReactTable({
        data,
        columns,
        onSortingChange:setSorting,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onExpandedChange:setExpanded,
        getExpandedRowModel: getExpandedRowModel(),
        state:{
            sorting,
            columnFilters,
            expanded
        }
    })

    const renderExpandIcon = (isExpanded: boolean) => {
        return isExpanded ? (
            <ChevronDown className="h-4 w-4" />
        ) : (
            <ChevronRight className="h-4 w-4" />
        );
    };

    return (
        <div className="w-full flex flex-col">
        <div className="flex items-center justify-between py-4">
            <Input placeholder="Filter by name..." value={table.getColumn("name")?.getFilterValue() as string} onChange={(event) => {
                table.getColumn("name")?.setFilterValue(event.target.value)
            }}
            className="max-w-2xs"
            />
        </div>
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            <TableHead className="w-10"></TableHead>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <React.Fragment key={row.id}>
                                <TableRow
                                    className={expanded[row.id] ? "bg-gray-50" : ""}
                                    onClick={() => {
                                        setExpanded((prev) => ({
                                            ...prev,
                                            [row.id]: !prev[row.id],
                                        }));
                                    }}
                                    style={{ cursor: 'pointer' }}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    <TableCell className="w-10">
                                        {renderExpandIcon(!!expanded[row.id])}
                                    </TableCell>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                                {expanded[row.id] && (
                                    <TableRow>
                                        <TableCell colSpan={row.getVisibleCells().length + 1} className="p-0">
                                            <div className="p-4 bg-gray-50">
                                                {renderSubComponent ? (
                                                    renderSubComponent({ row })
                                                ) : (
                                                    <div className="text-sm">
                                                        <UserPermissions userId={(row.original as any).id} />
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </React.Fragment>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
        </div>
    )
}