import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import api from "@/services/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateQuotation({ open, onClose, onCreated }: Props) {
  const [quotationNumber, setQuotationNumber] = useState("");
  const [company, setCompany] = useState("");
  const [clients, setClients] = useState<any[]>([]);
  const [validUntil, setValidUntil] = useState("");
  const [subtotal, setSubtotal] = useState("");
  const [currency, setCurrency] = useState("THB");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const subtotalNum = parseFloat(subtotal) || 0;
  const taxAmount = subtotalNum * 0.07;
  const totalAmount = subtotalNum + taxAmount;

  // 🧠 Fetch clients when modal opens
  useEffect(() => {
    if (open) {
      api
        .get("/client")
        .then((res) => setClients(res.data))
        .catch((err) => console.error("Error fetching clients:", err));
    }
  }, [open]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!quotationNumber || !company || !validUntil || !subtotal) {
      alert("Please fill in all required fields.");
      return;
    }

    // Find matching client
    const matchedClient = clients.find(
      (c) => c.company_name.toLowerCase() === company.toLowerCase()
    );

    if (!matchedClient) {
      alert("Client not found. Please use a valid company name.");
      return;
    }

    // ✅ Get stored user ID
    const createdBy = parseInt(localStorage.getItem("UserID") || "0");
    if (!createdBy) {
      alert("User ID missing. Please log in again.");
      return;
    }

    // ✅ Get token from localStorage
    const token = localStorage.getItem("AuthToken");
    if (!token) {
      alert("Missing token. Please log in again.");
      return;
    }

    setLoading(true);

    try {
      // ✅ Explicitly attach Authorization header
      await api.post(
        "/quotation",
        {
          quotation_number: quotationNumber,
          client_id: matchedClient.client_id,
          created_by: createdBy,
          valid_until: new Date(validUntil).toISOString(),
          subtotal: subtotalNum.toFixed(2),
          tax_amount: taxAmount.toFixed(2),
          total_amount: totalAmount.toFixed(2),
          currency,
          notes,
        },
        {
          headers: {
            Authorization: `Bearer ${token.trim()}`,
            
          },
        }
      );

      alert("Quotation created successfully!");
      onClose();
      onCreated();
    } catch (err: any) {
      console.error("❌ API error:", err);
      if (err.response?.status === 401) {
        alert("Unauthorized. Please log in again.");
      } else {
        alert(`Error creating quotation: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogOverlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
      <DialogContent className="bg-white p-6 rounded-xl shadow-2xl w-[420px] z-50">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Create New Quotation
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Fill in the details to create a new quotation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreate} className="space-y-4 mt-3">
          <div>
            <Label>Quotation Number</Label>
            <Input
              placeholder="Q-2025-001"
              value={quotationNumber}
              onChange={(e) => setQuotationNumber(e.target.value)}
              required
            />
          </div>

          <div>
            <Label>Client Company</Label>
            <Input
              list="client-list"
              placeholder="Enter company name"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
            />
            <datalist id="client-list">
              {clients.map((c) => (
                <option key={c.client_id} value={c.company_name} />
              ))}
            </datalist>
          </div>

          <div>
            <Label>Valid Until</Label>
            <Input
              type="datetime-local"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              required
            />
          </div>

          <div>
            <Label>Subtotal</Label>
            <Input
              type="number"
              placeholder="Enter subtotal amount"
              value={subtotal}
              onChange={(e) => setSubtotal(e.target.value)}
              required
            />
            <p className="text-sm text-gray-700 mt-1">
              Tax (7%):{" "}
              <span className="font-semibold">
                {taxAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
              <br />
              Total:{" "}
              <span className="font-semibold">
                {totalAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </p>
          </div>

          <div>
            <Label>Currency</Label>
            <Input
              placeholder="THB"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              required
            />
          </div>

          <div>
            <Label>Notes</Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Quotation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
