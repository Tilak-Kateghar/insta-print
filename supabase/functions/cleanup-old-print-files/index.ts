import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);

  const { data: jobs, error } = await supabase
    .schema("public")
    .from("PrintJob")
    .select("id, fileUrl")
    .lt("createdAt", cutoff.toISOString())
    .in("status", ["COMPLETED", "CANCELLED"])
    .not("fileUrl", "is", null);

  if (error) {
    return new Response(JSON.stringify({ error }), { status: 500 });
  }

  for (const job of jobs ?? []) {
    await supabase.storage
      .from("print-files")
      .remove([job.fileUrl]);

    await supabase
      .from("PrintJob")
      .update({ fileUrl: null })
      .eq("id", job.id);
  }

  return new Response(
    JSON.stringify({ deleted: jobs?.length ?? 0 }),
    { status: 200 }
  );
});