import { Button } from "@/components/ui/button";

interface Props {
  data: any[];
  onDelete: (id: number) => void;
}

export default function QuotationTable({ data, onDelete }: Props) {
  return (
    <table className="w-full border border-gray-200 mt-4 text-left">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-2 border">ID</th>
          <th className="p-2 border">Customer</th>
          <th className="p-2 border">Amount</th>
          <th className="p-2 border">Action</th>
        </tr>
      </thead>
      <tbody>
        {data.map((q) => (
          <tr key={q.id}>
            <td className="p-2 border">{q.id}</td>
            <td className="p-2 border">{q.customer_name}</td>
            <td className="p-2 border">{q.amount}</td>
            <td className="p-2 border">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(q.id)}
              >
                Delete
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
