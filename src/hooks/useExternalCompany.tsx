import { useState, useEffect, createContext, useContext } from "react";
import { externalSupabase } from "@/integrations/supabase/externalClient";
import { useCompany } from "./useCompany";

type ExternalCompanyContextType = {
  externalCompanyId: string | null;
  loading: boolean;
  notFound: boolean;
};

const ExternalCompanyContext = createContext<ExternalCompanyContextType | null>(null);

export const ExternalCompanyProvider = ({ children }: { children: React.ReactNode }) => {
  const { company } = useCompany();
  const [externalCompanyId, setExternalCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!company?.whatsapp_phone_id) {
      setExternalCompanyId(null);
      setNotFound(!!company);
      setLoading(false);
      return;
    }
    let active = true;
    (async () => {
      setLoading(true);
      const { data, error } = await externalSupabase
        .from("companies")
        .select("id")
        .eq("whatsapp_phone_id", company.whatsapp_phone_id)
        .limit(1)
        .maybeSingle();
      if (!active) return;
      if (error) console.error("[external company]", error);
      setExternalCompanyId(data?.id || null);
      setNotFound(!data?.id);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [company?.whatsapp_phone_id, company]);

  return (
    <ExternalCompanyContext.Provider value={{ externalCompanyId, loading, notFound }}>
      {children}
    </ExternalCompanyContext.Provider>
  );
};

export const useExternalCompany = () => {
  const ctx = useContext(ExternalCompanyContext);
  if (!ctx) throw new Error("useExternalCompany must be used within ExternalCompanyProvider");
  return ctx;
};
