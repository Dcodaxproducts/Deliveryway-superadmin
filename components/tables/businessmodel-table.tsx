"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { modelData } from "@/constants/models";
import { useTranslations } from "next-intl";

export default function BusinessModelTable() {
  const models = useTranslations("models");

  return (
    <div className="bg-white p-[24px] rounded-[14px] shadow-sm border border-gray-100">
      <h3 className="text-xl font-semibold text-dark mb-[16px]">{models("businessModelComparison")}</h3>
      <Table>
        <TableHeader className="border-b border-gray-200">
          <TableRow className="border-none hover:bg-transparent">
            <TableHead className="font-semibold text-dark h-[46px]">{models("modelType")}</TableHead>
            <TableHead className="font-semibold text-dark">{models("baseFee")}</TableHead>
            <TableHead className="font-semibold text-dark">{models("commission")}</TableHead>
            <TableHead className="font-semibold text-dark">{models("bestFor")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {modelData.map((row, i) => (
            <TableRow key={i} className="border-gray-200 hover:bg-transparent h-[46px]">
              <TableCell className="text-dark">{models(`types.${row.typeKey}`)}</TableCell>
              <TableCell className={row.isFeeHighlight || row.isFullHighlight ? "text-primary font-semibold" : "text-gray"}>
                {row.fee}
              </TableCell>
              <TableCell className={row.isHighlight || row.isFullHighlight ? "text-primary font-semibold" : "text-gray"}>
                {row.commKey ? models(`commissions.${row.commKey}`) : row.comm}
              </TableCell>
              <TableCell className="text-gray">{models(`best.${row.bestKey}`)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
