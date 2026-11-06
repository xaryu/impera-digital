import { AnchorHTMLAttributes } from "react";
import { useTranslation } from "react-i18next";
import { company } from "@/config/company";

type BookingLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "target" | "rel">;

// Opens the calendar in a new tab. A plain link rather than window.open, so popup blockers leave it
// alone, and visitors keep the page they were on (a calculator result, for example).
const BookingLink = ({ children, ...props }: BookingLinkProps) => {
  const { t } = useTranslation();

  return (
    <a {...props} href={company.calendlyUrl} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="sr-only"> ({t("common.opensInNewTab")})</span>
    </a>
  );
};

export default BookingLink;
