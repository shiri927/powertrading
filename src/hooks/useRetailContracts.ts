import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface RetailContract {
  id: string;
  customer_id: string;
  contract_no: string;
  contract_name: string;
  execution_month: string;
  contract_type: string;
  contract_volume: number;
  contract_price: number;
  settlement_volume: number | null;
  settlement_amount: number | null;
  status: string;
  signing_date: string;
  start_date: string;
  end_date: string;
  remarks: string | null;
  created_at: string;
  updated_at: string;
  // Joined customer data
  customer?: {
    id: string;
    name: string;
    customer_code: string;
    agent_name: string | null;
    contact_person: string | null;
    contact_phone: string | null;
  };
}

export interface RetailContractStats {
  totalContracts: number;
  activeContracts: number;
  newThisMonth: number;
  totalSettlementAmount: number;
}

// Fetch all retail contracts with customer info
export function useRetailContracts() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("retail_contracts_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "retail_contracts" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["retail-contracts"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["retail-contracts"],
    queryFn: async (): Promise<RetailContract[]> => {
      const { data, error } = await supabase
        .from("retail_contracts")
        .select(`
          *,
          customer:customers(id, name, customer_code, agent_name, contact_person, contact_phone)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as RetailContract[];
    },
  });
}

// Fetch contracts by customer ID
export function useRetailContractsByCustomer(customerId: string | null) {
  return useQuery({
    queryKey: ["retail-contracts", "customer", customerId],
    queryFn: async (): Promise<RetailContract[]> => {
      if (!customerId) return [];
      
      const { data, error } = await supabase
        .from("retail_contracts")
        .select(`
          *,
          customer:customers(id, name, customer_code, agent_name, contact_person, contact_phone)
        `)
        .eq("customer_id", customerId)
        .order("execution_month", { ascending: false });

      if (error) throw error;
      return data as RetailContract[];
    },
    enabled: !!customerId,
  });
}

// Fetch contracts by execution month
export function useRetailContractsByMonth(month: string | null) {
  return useQuery({
    queryKey: ["retail-contracts", "month", month],
    queryFn: async (): Promise<RetailContract[]> => {
      if (!month) return [];
      
      const { data, error } = await supabase
        .from("retail_contracts")
        .select(`
          *,
          customer:customers(id, name, customer_code, agent_name, contact_person, contact_phone)
        `)
        .eq("execution_month", month)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as RetailContract[];
    },
    enabled: !!month,
  });
}

// Get contract statistics
export function useRetailContractStats() {
  return useQuery({
    queryKey: ["retail-contracts", "stats"],
    queryFn: async (): Promise<RetailContractStats> => {
      const { data, error } = await supabase
        .from("retail_contracts")
        .select("*");

      if (error) throw error;

      const contracts = data || [];
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

      return {
        totalContracts: contracts.length,
        activeContracts: contracts.filter((c) => c.status === "active").length,
        newThisMonth: contracts.filter((c) => {
          const signingMonth = c.signing_date?.substring(0, 7);
          return signingMonth === currentMonth;
        }).length,
        totalSettlementAmount: contracts.reduce(
          (sum, c) => sum + (c.settlement_amount || 0),
          0
        ),
      };
    },
  });
}

// Search contracts by customer name or contract number
export function useSearchRetailContracts(keyword: string) {
  return useQuery({
    queryKey: ["retail-contracts", "search", keyword],
    queryFn: async (): Promise<RetailContract[]> => {
      if (!keyword || keyword.length < 2) return [];

      // First search by contract_no or contract_name
      const { data: contractData, error: contractError } = await supabase
        .from("retail_contracts")
        .select(`
          *,
          customer:customers(id, name, customer_code, agent_name, contact_person, contact_phone)
        `)
        .or(`contract_no.ilike.%${keyword}%,contract_name.ilike.%${keyword}%`)
        .order("created_at", { ascending: false });

      if (contractError) throw contractError;

      // Then search by customer name
      const { data: customerData, error: customerError } = await supabase
        .from("customers")
        .select("id")
        .ilike("name", `%${keyword}%`);

      if (customerError) throw customerError;

      if (customerData && customerData.length > 0) {
        const customerIds = customerData.map((c) => c.id);
        const { data: customerContracts, error: customerContractsError } = await supabase
          .from("retail_contracts")
          .select(`
            *,
            customer:customers(id, name, customer_code, agent_name, contact_person, contact_phone)
          `)
          .in("customer_id", customerIds)
          .order("created_at", { ascending: false });

        if (customerContractsError) throw customerContractsError;

        // Merge results and deduplicate
        const allContracts = [...(contractData || []), ...(customerContracts || [])];
        const uniqueContracts = allContracts.filter(
          (contract, index, self) =>
            index === self.findIndex((c) => c.id === contract.id)
        );
        return uniqueContracts as RetailContract[];
      }

      return contractData as RetailContract[];
    },
    enabled: keyword.length >= 2,
  });
}

// Filter contracts with multiple criteria
export function useFilteredRetailContracts(filters: {
  customerName?: string;
  executionMonth?: string;
  contractType?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ["retail-contracts", "filtered", filters],
    queryFn: async (): Promise<RetailContract[]> => {
      let query = supabase
        .from("retail_contracts")
        .select(`
          *,
          customer:customers(id, name, customer_code, agent_name, contact_person, contact_phone)
        `);

      if (filters.executionMonth) {
        query = query.eq("execution_month", filters.executionMonth);
      }

      if (filters.contractType && filters.contractType !== "all") {
        query = query.eq("contract_type", filters.contractType);
      }

      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;

      let result = data as RetailContract[];

      // Filter by customer name (client-side due to join)
      if (filters.customerName && filters.customerName.trim()) {
        const keyword = filters.customerName.toLowerCase();
        result = result.filter(
          (c) =>
            c.customer?.name?.toLowerCase().includes(keyword) ||
            c.contract_no.toLowerCase().includes(keyword) ||
            c.contract_name.toLowerCase().includes(keyword)
        );
      }

      return result;
    },
  });
}
