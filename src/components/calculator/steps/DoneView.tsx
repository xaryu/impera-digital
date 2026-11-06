import { useTranslation } from "react-i18next";
import BookingLink from "@/components/common/BookingLink";

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
        <BookingLink
          onClick={onAuditClick}
          className="inline-block px-6 py-3 min-h-[44px] text-center bg-gold text-navy-dark font-body text-sm font-semibold tracking-wider uppercase hover:bg-gold-light transition-colors"
        >
          {t("calculator.result.auditCta")}
        </BookingLink>
      </div>
    </div>
  );
};

export default DoneView;
