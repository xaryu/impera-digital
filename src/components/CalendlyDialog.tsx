import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ReactNode } from "react";

interface CalendlyDialogProps {
  children: ReactNode;
}

const CalendlyDialog = ({ children }: CalendlyDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl h-[700px] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="font-display text-xl">Book a Free 30-Minute Call</DialogTitle>
        </DialogHeader>
        <div className="flex-1 px-6 pb-6 h-full">
          <iframe
            src="https://calendly.com/flavianconstantinovici48/30min"
            width="100%"
            height="100%"
            frameBorder="0"
            title="Schedule a call"
            className="rounded-md"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CalendlyDialog;
