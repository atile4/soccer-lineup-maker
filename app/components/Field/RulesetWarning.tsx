import { AlertTriangle } from "lucide-react";
import { Button } from "@/app/components/ui/Button";

export default function RulesetWarning() {
  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      disabled
      aria-label="Warning"
      className="absolute right-full bottom-10 mr-2"
    >
      <AlertTriangle size={18} />
    </Button>
  );
}
