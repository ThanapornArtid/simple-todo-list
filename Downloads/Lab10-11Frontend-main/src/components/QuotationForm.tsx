import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  onSubmit: (data: any) => void;
}

export default function QuotationForm({ onSubmit }: Props) {
  const [customer_name, setCustomerName] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ customer_name, amount: Number(amount) });
    setCustomerName("");
    setAmount("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
      <Input
        placeholder="Customer Name"
        value={customer_name}
        onChange={(e) => setCustomerName(e.target.value)}
        required
      />
      <Input
        placeholder="Amount"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />
      <Button type="submit">Add</Button>
    </form>
  );
}


