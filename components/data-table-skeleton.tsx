import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

export function DataTableSkeleton() {
  return (
    <div className="w-full pointer-events-none">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]"><Skeleton className="h-4 w-[80px]" /></TableHead>
              <TableHead><Skeleton className="h-4 w-[140px]" /></TableHead>
              <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
              <TableHead><Skeleton className="h-4 w-[120px]" /></TableHead>
              <TableHead className="text-right"><Skeleton className="h-4 w-[80px] ml-auto" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium"><Skeleton className="h-4 w-[80px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[140px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-4 w-[80px] ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Skeleton className="h-8 w-[100px]" />
        <Skeleton className="h-8 w-[70px]" />
      </div>
    </div>
  )
}
