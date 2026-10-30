import { useTranslation } from "react-i18next";
import CalendlyDialog from "@/components/common/CalendlyDialog";

interface DoneViewProps {
  onAuditClick: () => void;
}

const DoneView = ({ onAuditClick }: DoneViewProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <p className="font-body text-sm text-gold-muted">{t("calculator.done.description")}</p>
      <div className="space-y-3">
        <p className="font-body text-sm text-cream">{t("calculator.done.auditText")}</p>
        <CalendlyDialog>
          <button
            type="button"
            onClick={onAuditClick}
            className="px-6 py-3 min-h-[44px] bg-gold text-navy-dark font-body text-sm font-semibold tracking-wider uppercase hover:bg-gold-light transition-colors"
          >
            {t("calculator.result.auditCta")}
          </button>
        </CalendlyDialog>
      </div>
    </div>
  );
};

export default DoneView;
