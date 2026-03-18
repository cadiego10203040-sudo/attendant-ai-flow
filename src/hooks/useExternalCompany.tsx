import { useState, useEffect, createContext, useContext } from "react";
import { externalSupabase } from "@/integrations/supabase/externalClient";
import { useCompany } from "./useCompany";

type ExternalCompanyContextType = {
  externalCompanyId: string | null;
  loading: boolean;
};

const ExternalCompanyContext = createContext<ExternalCompanyContextType | null>(null);

export const ExternalCompanyProvider = ({ children }: { children: React.ReactNode }) => {
  const { company } = useCompany();
  const [externalCompanyId, setExternalCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!company?.whatsapp_phone_id) {
      setExternalCompanyId(null);
      setLoading(false);
      return;
    }

    const findExternalCompany = async () => {
      setLoading(true);
      // Try to find by whatsapp_phone_id
      const { data } = await externalSupabase
        .from("companies")
        .select("id")
        .eq("whatsapp_phone_id", company.whatsapp_phone_id)
        .maybeSingle();

      setExternalCompanyId(data?.id || null);
      setLoading(false);
    };

    findExternalCompany();
  }, [company?.whatsapp_phone_id]);

  return (
    <ExternalCompanyContext.Provider value={{ externalCompanyId, loading }}>
      {children}
    </ExternalCompanyContext.Provider>
  );
};

export const useExternalCompany = () => {
  const ctx = useContext(ExternalCompanyContext);
  if (!ctx) throw new Error("useExternalCompany must be used within ExternalCompanyProvider");
  return ctx;
};
