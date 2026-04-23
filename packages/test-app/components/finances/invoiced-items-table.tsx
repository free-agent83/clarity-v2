import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatUSD } from "@/lib/utils";
import type { FinanceLineItem } from "@/lib/api/finances";

interface InvoicedItemsTableProps {
  lineItems: FinanceLineItem[];
  title?: string;
}

export function InvoicedItemsTable({
  lineItems,
  title = "Invoiced items",
}: InvoicedItemsTableProps) {
  const vatTotal = lineItems.reduce((sum, li) => sum + li.vatAmount, 0);
  const grandTotal = lineItems.reduce((sum, li) => sum + li.total, 0);

  return (
    <div className="flex flex-col gap-5">
      <h3 className="text-xl font-medium tracking-tight text-foreground">
        {title}
      </h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item description</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Unit price</TableHead>
            <TableHead className="text-right">VAT</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lineItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">
                    {item.description}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {item.descriptionDetail}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">{item.quantity}</TableCell>
              <TableCell className="text-right">
                {formatUSD(item.unitPrice)}
              </TableCell>
              <TableCell className="text-right">
                {formatUSD(item.vatAmount)}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatUSD(item.total)}
              </TableCell>
            </TableRow>
          ))}
          {/* Totals row */}
          <TableRow className="bg-muted font-semibold">
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell className="text-right">{formatUSD(vatTotal)}</TableCell>
            <TableCell className="text-right">
              {formatUSD(grandTotal)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
