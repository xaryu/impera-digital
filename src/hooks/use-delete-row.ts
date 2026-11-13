import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type ContentTable = "blog_posts" | "job_openings";

// Query-key prefix each table's lists are cached under.
const queryKeys: Record<ContentTable, string> = {
  blog_posts: "blog_posts",
  job_openings: "job-openings",
};

// afterDelete runs once the row is gone (e.g. removing files that belonged to it). If it throws,
// the delete still counts and the error is shown as a warning.
export const useDeleteRow = (
  table: ContentTable,
  successMessage: string,
  afterDelete?: (id: string) => Promise<void>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // RLS turns a forbidden delete into a silent no-op, so ask for the
      // deleted row back and treat "nothing deleted" as an error.
      const { data, error } = await supabase.from(table).delete().eq("id", id).select("id");
      if (error) throw error;
      if (!data.length) throw new Error("Nothing was deleted. Check that this account has the admin role.");
      if (afterDelete) {
        try {
          await afterDelete(id);
        } catch (cleanupError) {
          toast.warning(`Deleted, but cleanup failed: ${(cleanupError as Error).message}`);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys[table]] });
      toast.success(successMessage);
    },
    onError: (err: Error) => toast.error(err.message),
  });
};
