import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { transferProducts } from "@/constants/mockLocations";

const TransferRecords = () => {
  return (
    <Card className="p-6 bg-white shadow-md rounded-xl ">
      <h2 className="text-xl font-semibold mb-4">Product Transfer Records</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Image</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead>Product ID</TableHead>
            <TableHead>Transfer From</TableHead>
            <TableHead>Transfer To</TableHead>
            <TableHead>Transferred By</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transferProducts.map((product, index) => (
            <TableRow key={index}>
              <TableCell>
              <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" alt={product.name} />
                  <AvatarFallback>{product.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>{product.id}</TableCell>
              <TableCell>{product.from}</TableCell>
              <TableCell>{product.to}</TableCell>
              <TableCell>{product.user}</TableCell>
              <TableCell>{product.date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default TransferRecords;
