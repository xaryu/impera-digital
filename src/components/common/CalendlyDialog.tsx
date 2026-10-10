import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { ReactNode } from "react";
import { company } from "@/config/company";

interface CalendlyDialogProps {
  children: ReactNode;
}

const CalendlyDialog = ({ children }: CalendlyDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl h-[80vh] max-h-[700px] p-0 overflow-hidden bg-navy border border-gold/20 rounded-lg">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="font-display text-xl text-cream">{t("calendly.title")}</DialogTitle>
          <p className="font-body text-sm text-gold-muted">{t("calendly.subtitle")}</p>
        </DialogHeader>
        <div className="flex-1 px-6 pb-6 h-full">
          <iframe
            src={company.calendlyUrl}
            width="100%"
            height="100%"
            frameBorder="0"
            title={t("calendly.iframeTitle")}
            className="rounded-md"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CalendlyDialog;
