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
};

type CompanyContextType = {
  company: Company | null;
  loading: boolean;
  refetch: () => Promise<void>;
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

  useEffect(() => { refetch(); }, [refetch]);

  return (
    <CompanyContext.Provider value={{ company, loading, refetch }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error("useCompany must be used within CompanyProvider");
  return ctx;
};
