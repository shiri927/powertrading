-- Create retail_contracts table for retail contract management
CREATE TABLE public.retail_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  contract_no text UNIQUE NOT NULL,
  contract_name text NOT NULL,
  execution_month text NOT NULL, -- YYYY-MM format
  contract_type text NOT NULL DEFAULT 'monthly', -- monthly, quarterly, yearly
  contract_volume numeric NOT NULL DEFAULT 0, -- MWh
  contract_price numeric NOT NULL DEFAULT 0, -- ¥/MWh
  settlement_volume numeric DEFAULT 0, -- MWh
  settlement_amount numeric DEFAULT 0, -- ¥
  status text NOT NULL DEFAULT 'pending', -- pending, active, completed, cancelled
  signing_date date NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  remarks text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.retail_contracts ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Allow public read access for retail_contracts"
ON public.retail_contracts
FOR SELECT
USING (true);

CREATE POLICY "Allow public insert for demo"
ON public.retail_contracts
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update for demo"
ON public.retail_contracts
FOR UPDATE
USING (true);

CREATE POLICY "Allow public delete for demo"
ON public.retail_contracts
FOR DELETE
USING (true);

CREATE POLICY "Admins can manage retail_contracts"
ON public.retail_contracts
FOR ALL
USING (is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_retail_contracts_updated_at
BEFORE UPDATE ON public.retail_contracts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for common queries
CREATE INDEX idx_retail_contracts_customer_id ON public.retail_contracts(customer_id);
CREATE INDEX idx_retail_contracts_execution_month ON public.retail_contracts(execution_month);
CREATE INDEX idx_retail_contracts_status ON public.retail_contracts(status);