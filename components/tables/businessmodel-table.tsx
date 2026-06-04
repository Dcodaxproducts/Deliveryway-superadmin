"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { modelData } from "@/constants/models";

export default function BusinessModelTable() {
  return (
    <div className="bg-white p-[24px] rounded-[14px] shadow-sm border border-gray-100">
      <h3 className="text-xl font-semibold text-dark mb-[16px]">Business Model Comparison</h3>
      <Table>
        <TableHeader className="border-b border-gray-200">
          <TableRow className="border-none hover:bg-transparent">
            <TableHead className="font-semibold text-dark h-[46px]">Model Type</TableHead>
            <TableHead className="font-semibold text-dark">Base Fee</TableHead>
            <TableHead className="font-semibold text-dark">Commission</TableHead>
            <TableHead className="font-semibold text-dark">Best For</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {modelData.map((row, i) => (
            <TableRow key={i} className="border-gray-200 hover:bg-transparent h-[46px]">
              <TableCell className="text-dark">{row.type}</TableCell>
              <TableCell className={row.isFeeHighlight || row.isFullHighlight ? "text-primary font-semibold" : "text-gray"}>
                {row.fee}
              </TableCell>
              <TableCell className={row.isHighlight || row.isFullHighlight ? "text-primary font-semibold" : "text-gray"}>
                {row.comm}
              </TableCell>
              <TableCell className="text-gray">{row.best}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}