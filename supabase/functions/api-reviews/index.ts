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

async function requireAuth(req: Request): Promise<{ userId: string } | Response> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return err("Missing authorization header", 401);
  }
  const token = authHeader.slice(7);
  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { data: { user }, error } = await adminClient.auth.getUser(token);
  if (error || !user) return err("Invalid or expired token", 401);
  return { userId: user.id };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const pathParts = url.pathname.replace(/^\/api-reviews\/?/, "").split("/").filter(Boolean);
  const reviewId = pathParts[0] ?? null;

  try {
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // GET /api-reviews — list reviews (optionally by tool)
    if (req.method === "GET" && !reviewId) {
      const toolId = url.searchParams.get("tool_id");
      const userId = url.searchParams.get("user_id");
      const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20"), 100);
      const offset = parseInt(url.searchParams.get("offset") ?? "0");
      const sortBy = url.searchParams.get("sort_by") ?? "created_at";
      const sortOrder = url.searchParams.get("sort_order") ?? "desc";

      const allowedSortColumns = ["created_at", "rating", "helpful_count"];
      if (!allowedSortColumns.includes(sortBy)) {
        return err(`Invalid sort_by. Allowed: ${allowedSortColumns.join(", ")}`, 400);
      }

      if (!toolId && !userId) {
        return err("Either tool_id or user_id query parameter is required", 400);
      }

      let query = adminClient
        .from("reviews")
        .select(
          `id, tool_id, user_id, rating, title, content, pros, cons,
           is_verified, helpful_count, created_at, updated_at,
           profiles(id, full_name, avatar_url)`,
          { count: "exact" },
        );

      if (toolId) query = query.eq("tool_id", toolId);
      if (userId) query = query.eq("user_id", userId);

      query = query.order(sortBy, { ascending: sortOrder === "asc" }).range(offset, offset + limit - 1);

      const { data, error, count } = await query;
      if (error) return err(error.message, 500);

      return json({ data, total: count, limit, offset });
    }

    // GET /api-reviews/:id — single review
    if (req.method === "GET" && reviewId) {
      const { data, error } = await adminClient
        .from("reviews")
        .select(
          `id, tool_id, user_id, rating, title, content, pros, cons,
           is_verified, helpful_count, created_at, updated_at,
           profiles(id, full_name, avatar_url)`,
        )
        .eq("id", reviewId)
        .maybeSingle();

      if (error) return err(error.message, 500);
      if (!data) return err("Review not found", 404);
      return json({ data });
    }

    // POST /api-reviews — authenticated users only
    if (req.method === "POST" && !reviewId) {
      const authResult = await requireAuth(req);
      if (authResult instanceof Response) return authResult;
      const { userId } = authResult;

      let body: Record<string, unknown>;
      try {
        body = await req.json();
      } catch {
        return err("Invalid JSON body", 400);
      }

      const required = ["tool_id", "rating"];
      for (const field of required) {
        if (body[field] === undefined || body[field] === null) {
          return err(`Missing required field: ${field}`, 400);
        }
      }

      const rating = Number(body.rating);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return err("rating must be an integer between 1 and 5", 400);
      }

      // Validate tool exists
      const { data: tool } = await adminClient
        .from("tools")
        .select("id")
        .eq("id", body.tool_id as string)
        .eq("is_approved", true)
        .maybeSingle();
      if (!tool) return err("Tool not found", 404);

      // One review per user per tool
      const { data: existing } = await adminClient
        .from("reviews")
        .select("id")
        .eq("tool_id", body.tool_id as string)
        .eq("user_id", userId)
        .maybeSingle();
      if (existing) return err("You have already reviewed this tool", 409);

      const pros = Array.isArray(body.pros) ? body.pros : [];
      const cons = Array.isArray(body.cons) ? body.cons : [];

      const { data, error } = await adminClient
        .from("reviews")
        .insert({
          tool_id: body.tool_id,
          user_id: userId,
          rating,
          title: body.title ?? null,
          content: body.content ?? null,
          pros,
          cons,
        })
        .select()
        .single();

      if (error) return err(error.message, 500);

      // Recalculate tool average rating
      const { data: ratingData } = await adminClient
        .from("reviews")
        .select("rating")
        .eq("tool_id", body.tool_id as string);

      if (ratingData && ratingData.length > 0) {
        const avg = ratingData.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / ratingData.length;
        await adminClient
          .from("tools")
          .update({
            average_rating: Math.round(avg * 10) / 10,
            reviews_count: ratingData.length,
            updated_at: new Date().toISOString(),
          })
          .eq("id", body.tool_id as string);
      }

      return json({ data }, 201);
    }

    return err("Method not allowed", 405);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Internal server error", 500);
  }
});
