export interface Invoice {
  invoice_id: number;
  invoice_number: string;
  client_id: number;
  quotation_number: string;
  issue_date?: string;
  due_date?: string;
  status?: string;
  subtotal?: string;
  tax_amount?: string;
  total_amount?: string;
  amount_paid?: string;
  currency?: string;
  notes?: string;
  created_by: number;
}

export interface Client {
    client_id: number;
    company_name: string; 
    address: string;
    email: string;
    contact_person?: string;

}

export interface Quotation {
  quotation_id: number;
  quotation_number: string;
  client_id: number;
  created_at?: string;
  valid_until?: string;
  status?: string;
  subtotal?: string;
  tax_amount?: string;
  total_amount?: string;
  currency?: string;
  notes?: string;
  created_by: number;
  client?: Client;
}