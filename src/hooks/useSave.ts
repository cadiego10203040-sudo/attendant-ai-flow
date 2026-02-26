import { useState, useCallback, useRef } from "react";
import { toast } from "@/hooks/use-toast";

export type SaveStatus = "idle" | "loading" | "success" | "error";

export function useSave() {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const execute = useCallback(async (fn: () => Promise<void>, successMessage = "Salvo com sucesso!") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus("loading");
    try {
      await fn();
      setStatus("success");
      toast({ title: successMessage });
    } catch (err: any) {
      setStatus("error");
      toast({ title: "❌ Erro ao salvar. Tente novamente.", description: err?.message, variant: "destructive" });
    } finally {
      timerRef.current = setTimeout(() => setStatus("idle"), 3000);
    }
  }, []);

  return { status, execute };
}
