import { useEffect, useState } from "react";
import type { Quotation } from "@/models/model";
import api from "@/services/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import bg2 from "@/assets/bg2.png";
import { useNavigate } from "react-router-dom";
import CreateQuotation from "@/components/CreateQuotation";
import { logout } from "@/services/logoutService"
export default function QuotationPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [filtered, setFiltered] = useState<Quotation[]>([]);
  const [filters, setFilters] = useState({
    company: "",
    email: "",
    startDate: "",
    endDate: "",
  });
  const navigate = useNavigate();
  // const location = useLocation();

  // Fetch quotations
  const fetchQuotations = async () => {
    try {
      // Fetch quotations + clients at the same time
      const [quotationRes, clientRes] = await Promise.all([
        api.get("/quotation"),
        api.get("/client"),
      ]);

      const quotations = quotationRes.data;
      const clients = clientRes.data;

      // Create a lookup map for quick access by client_id
      const clientMap = new Map<number, any>();
      clients.forEach((c: any) => clientMap.set(c.client_id, c));

      // Merge client data into each quotation
      const merged = quotations.map((q: any) => ({
        ...q,
        client: clientMap.get(q.client_id), // attach matching client object
      }));

      console.log("Merged quotations:", merged); // 👈 for debugging

      setQuotations(merged);
      setFiltered(merged);
    } catch (err) {
      console.error("Failed to fetch quotations or clients:", err);
    }
  };
  const refreshQuotations = () => fetchQuotations();
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short", // gives Jan, Feb, Mar...
      day: "numeric",
    });
  };
  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
  e.preventDefault();
  const { company, email, startDate, endDate } = filters;
  
  // Navigate is often done after filtering, but kept here as per your original code.
  // navigate("/quotation/search"); 

  const result = quotations.filter((q) => {
    const companyName = q.client?.company_name || "";
    const clientEmail = q.client?.email || "";
    const issueDate = q.created_at ? new Date(q.created_at) : null;
    const validUntilDate = q.valid_until ? new Date(q.valid_until) : null;

    const matchCompany =
      !company || companyName.toLowerCase().includes(company.toLowerCase());
    const matchEmail =
      !email || clientEmail.toLowerCase().includes(email.toLowerCase());
    
    // --- START Old Logic Implementation ---
    const matchStart = 
      !startDate || (issueDate && issueDate >= new Date(startDate));

    let matchEnd = true;
    let matchValidUntil = true;
    if (endDate) {
      const adjustedEndDate = new Date(endDate);
      adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);

      // 1. Check Issue Date against End Date
      if (issueDate) {
          matchEnd = issueDate < adjustedEndDate;
      } else {
          matchEnd = false; 
      }
      
      // 2. NEW: Check Valid Until Date against End Date
      if (validUntilDate) {
          matchValidUntil = validUntilDate < adjustedEndDate;
      }
      // If validUntilDate is null, it typically passes, or you can set it to false
      // for strict filtering. Assuming it should only be filtered if it exists.
    }

    // Now, return true only if ALL date conditions are met
    return matchCompany && matchEmail && matchStart && matchEnd && matchValidUntil;
  });

  // If you only want to filter, remove the navigate call above and keep this:
  navigate("/quotation"); // or keep it on the current page

  setFiltered(result);
};


  return (
    <div>
      {/* Header */}
      <header>
        <nav className="flex items-center justify-between p-4 text-xs font-bold">
          <div>
            <a href="/">Home</a>
          </div>
          <div className="space-x-6">
            <a href="/invoice">Invoice</a>
            <a href="/quotation">Quotation</a>
            <a href="/aboutus">About Us</a>
          </div>
        <a onClick={logout} className=" hover:font-bold cursor-pointer">Log out →</a>        
        </nav>

        <div className="relative w-full h-60 opacity-90">
          <img
            src={bg2}
            alt="banner"
            className="absolute inset-0 w-full h-full object-cover brightness-50"
          />
          <h1 className="absolute inset-0 flex items-center justify-center text-white text-3xl font-bold">
            Quotation Management System
          </h1>
        </div>
      </header>

      {/* Search Form */}

      <div className="mt-10 mx-5 shadow p-5 rounded-xl ">
        <form
          onSubmit={handleSearch}
          className="flex flex-wrap items-center gap-3 text-sm"
        >
          <label>Search:</label>

          <Input
            type="text"
            placeholder="Company Name"
            value={filters.company}
            onChange={(e) =>
              setFilters({ ...filters, company: e.target.value })
            }
            className="w-40"
          />

          <Input
            type="email"
            placeholder="Client Email"
            value={filters.email}
            onChange={(e) =>
              setFilters({ ...filters, email: e.target.value })
            }
            className="w-44"
          />

          <label>Start Date:</label>
          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
            className="w-36"
          />

          <label>End Date:</label>
          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
            className="w-36"
          />

          <Button
            type="submit"
            className="bg-[rgb(13,84,144)] text-white hover:bg-[rgb(10,70,120)]"
          >
            Search
          </Button>
          <Button
            type="button"
            onClick={() => {
              // Reset filters to empty
              setFilters({ company: "", email: "", startDate: "", endDate: "" });
              // Restore full list
              setFiltered(quotations);
              // Navigate back to main quotation page
              navigate("/quotation");
            }}
            className="bg-gray-300 text-black hover:bg-gray-400"
          >
            Reset
          </Button>

        </form>
      </div>
      {/* Table */}
      <div className=" rounded-xl shadow-xl p-6 mx-8 mt-3">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Quotations</h2>
            <p className="text-sm text-gray-600">
              A list of all quotations in your account.
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="text-white px-3 py-1 bg-[rgb(13,84,144)] rounded-md"
          >
            + Create Quotation
          </Button>

          <CreateQuotation
            open={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onCreated={refreshQuotations}
          />

        </div>

        <table className="w-full mt-5 border-collapse border-gray-200 text-sm">
          <thead className="bg-gray-100 ">
            <tr>
              <th className="p-2 text-left">Quotation#</th>
              <th className="p-2 text-left">Create Date</th>
              <th className="p-2 text-left">Valid Until</th>
              <th className="p-2 text-left">Company</th>
              <th className="p-2 text-left">Staff</th>
              <th className="p-2 text-left ">Amount</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-5 text-gray-500 italic">
                  No quotations found.
                </td>
              </tr>
            ) : (
              filtered.map((q) => (
                <tr key={q.quotation_id} className="hover:bg-gray-50 border-b border-gray-200 ">
                  <td className=" p-3 text-left ">{q.quotation_number}</td>
                  <td className=" p-3 text-left">{formatDate(q.created_at)}</td>
                  <td className=" p-3 text-left">{formatDate(q.valid_until)}</td>
                  <td className=" p-3 text-left">{q.client?.company_name || "-"}</td>
                  <td className=" p-3 text-left">{q.client?.contact_person || "-"}</td>
                  <td className=" p-3 text-left">
                    {q.currency} {q.total_amount}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <footer className="mt-32 flex items-center justify-center text-sm bg-[rgb(13,84,144)] text-white w-full p-3">
        <p>Use for Tailwind Demo © Faculty of ICT, Mahidol University</p>
      </footer>
    </div>
  );
}
