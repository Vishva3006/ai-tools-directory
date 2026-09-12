import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function err(message: string, status: number) {
  return json({ error: message }, status);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return err("Method not allowed", 405);
  }

  try {
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const url = new URL(req.url);
    const withToolCount = url.searchParams.get("with_tool_count") === "true";

    let query = adminClient
      .from("categories")
      .select(
        withToolCount
          ? "id, name, slug, description, icon, color, created_at, tools(count)"
          : "id, name, slug, description, icon, color, created_at",
      )
      .order("name", { ascending: true });

    const { data, error } = await query;
    if (error) return err(error.message, 500);

    // If tool counts were requested, flatten the aggregated count
    const result = withToolCount
      ? (data as Array<Record<string, unknown>>).map((cat) => {
          const tools = cat.tools as Array<{ count: number }> | null;
          const toolCount = tools?.[0]?.count ?? 0;
          const { tools: _tools, ...rest } = cat;
          return { ...rest, tool_count: toolCount };
        })
      : data;

    return json({ data: result });
  } catch (e) {
    return err(e instanceof Error ? e.message : "Internal server error", 500);
  }
});
