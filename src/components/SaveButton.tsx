import { Save, Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SaveStatus } from "@/hooks/useSave";
import { cn } from "@/lib/utils";

interface SaveButtonProps {
  status: SaveStatus;
  onClick: () => void;
  className?: string;
}

const config: Record<SaveStatus, { icon: React.ReactNode; label: string; className: string }> = {
  idle: {
    icon: <Save className="mr-2 h-4 w-4" />,
    label: "Salvar",
    className: "bg-[#FF6B2B] hover:bg-[#FF6B2B]/90 text-white",
  },
  loading: {
    icon: <Loader2 className="mr-2 h-4 w-4 animate-spin" />,
    label: "Salvando...",
    className: "bg-[#FF6B2B]/60 text-white cursor-not-allowed",
  },
  success: {
    icon: <Check className="mr-2 h-4 w-4" />,
    label: "Salvo!",
    className: "bg-[#22D3A5] hover:bg-[#22D3A5] text-white",
  },
  error: {
    icon: <X className="mr-2 h-4 w-4" />,
    label: "Erro ao salvar",
    className: "bg-[#FF5252] hover:bg-[#FF5252] text-white",
  },
};

export default function SaveButton({ status, onClick, className }: SaveButtonProps) {
  const c = config[status];
  return (
    <Button
      onClick={onClick}
      disabled={status === "loading"}
      className={cn(c.className, "transition-all duration-300", className)}
    >
      {c.icon}
      {c.label}
    </Button>
  );
}
