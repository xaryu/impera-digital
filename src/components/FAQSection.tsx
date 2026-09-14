import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Accordion, AccordionItem, AccordionContent } from "@/components/ui/accordion";
import FadeInSection from "./FadeInSection";
import { cn } from "@/lib/utils";

const FAQSection = () => {
  const { t } = useTranslation();

  const faqs = [
    { question: t("faq.q1"), answer: t("faq.a1") },
    { question: t("faq.q2"), answer: t("faq.a2") },
    { question: t("faq.q3"), answer: t("faq.a3") },
    { question: t("faq.q4"), answer: t("faq.a4") },
    { question: t("faq.q5"), answer: t("faq.a5") },
    { question: t("faq.q6"), answer: t("faq.a6") },
  ];

  return (
    <section className="py-28 md:py-36 bg-cream relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/[0.06] rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <FadeInSection className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <p className="font-body text-sm tracking-[0.3em] text-gold uppercase mb-4">{t("faq.eyebrow")}</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-navy leading-tight mb-6">{t("faq.title")}</h2>
          <p className="font-body text-muted-foreground leading-relaxed">{t("faq.subtitle")}</p>
        </FadeInSection>

        <FadeInSection delay={150} className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="group border border-navy/10 rounded-2xl bg-background/60 px-6 md:px-8 data-[state=open]:border-gold/30 data-[state=open]:bg-background transition-colors duration-500"
              >
                <AccordionPrimitive.Header className="flex">
                  <AccordionPrimitive.Trigger
                    className={cn(
                      "flex flex-1 items-center justify-between gap-6 py-6 text-left font-display text-lg md:text-xl text-navy font-semibold outline-none",
                    )}
                  >
                    {faq.question}
                    <span className="relative shrink-0 w-8 h-8 rounded-full border border-gold/30 flex items-center justify-center transition-colors duration-500 group-data-[state=open]:bg-gold group-data-[state=open]:border-gold">
                      <Plus
                        className="w-4 h-4 text-gold transition-transform duration-300 group-data-[state=open]:rotate-45 group-data-[state=open]:text-navy-dark"
                        aria-hidden="true"
                      />
                    </span>
                  </AccordionPrimitive.Trigger>
                </AccordionPrimitive.Header>
                <AccordionContent className="pb-6">
                  <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed">{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </FadeInSection>
      </div>
    </section>
  );
};

export default FAQSection;
