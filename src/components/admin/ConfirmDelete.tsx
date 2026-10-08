import type { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Wraps a trigger button with a "delete permanently?" confirmation.
const ConfirmDelete = ({
  itemLabel,
  onConfirm,
  children,
}: {
  itemLabel: string;
  onConfirm: () => void;
  children: ReactNode;
}) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
    <AlertDialogContent className="bg-navy border-gold/20">
      <AlertDialogHeader>
        <AlertDialogTitle className="font-display text-cream">Delete permanently?</AlertDialogTitle>
        <AlertDialogDescription className="font-body text-gold-muted">
          “{itemLabel}” will be removed from the database and the site. This can't be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel className="bg-transparent border-gold/20 text-gold-muted hover:bg-gold/10 hover:text-cream font-body text-xs tracking-wider uppercase">
          Cancel
        </AlertDialogCancel>
        <AlertDialogAction
          onClick={onConfirm}
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-body text-xs tracking-wider uppercase"
        >
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default ConfirmDelete;
