import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

type Company = {
  id: string;
  user_id: string;
  name: string;
  segment: string;
  language: string;
  logo_url: string;
  address: string;
  business_hours: any;
  ai_instructions: string;
  objections: string;
  escalation_rules: string;
  whatsapp_phone_id: string;
  whatsapp_token: string;
  whatsapp_verify_token: string;
  webhook_url: string;
  openai_key: string;
  mp_key: string;
  customer_whatsapp: string;
};

type CompanyContextType = {
  company: Company | null;
  loading: boolean;
  refetch: () => Promise<void>;
  ensureCompany: () => Promise<Company>;
};

const CompanyContext = createContext<CompanyContextType | null>(null);

export const CompanyProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!user) { setCompany(null); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from("companies")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    setCompany(data as Company | null);
    setLoading(false);
  }, [user]);

  const ensureCompany = useCallback(async (): Promise<Company> => {
    if (company) return company;
    if (!user) throw new Error("Usuário não autenticado");
    // Check if exists
    const { data: existing } = await supabase
      .from("companies")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (existing) {
      setCompany(existing as Company);
      return existing as Company;
    }
    // Auto-create
    const { data: created, error } = await supabase
      .from("companies")
      .insert({ user_id: user.id, name: "Minha Empresa", language: "informal" })
      .select("*")
      .single();
    if (error) throw error;
    setCompany(created as Company);
    return created as Company;
  }, [company, user]);

  useEffect(() => { refetch(); }, [refetch]);

  return (
    <CompanyContext.Provider value={{ company, loading, refetch, ensureCompany }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error("useCompany must be used within CompanyProvider");
  return ctx;
};
