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

async function getAdminClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

async function requireAdmin(req: Request): Promise<{ userId: string } | Response> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return err("Missing authorization header", 401);
  }
  const token = authHeader.slice(7);
  const adminClient = await getAdminClient();
  const { data: { user }, error } = await adminClient.auth.getUser(token);
  if (error || !user) return err("Invalid or expired token", 401);

  const { data: profile, error: profileErr } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileErr) return err("Failed to fetch user profile", 500);
  if (!profile || profile.role !== "admin") return err("Admin access required", 403);

  return { userId: user.id };
}

async function requireAuth(req: Request): Promise<{ userId: string } | Response> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return err("Missing authorization header", 401);
  }
  const token = authHeader.slice(7);
  const adminClient = await getAdminClient();
  const { data: { user }, error } = await adminClient.auth.getUser(token);
  if (error || !user) return err("Invalid or expired token", 401);
  return { userId: user.id };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const url = new URL(req.url);
  // Path: /api-tools or /api-tools/<id>
  const pathParts = url.pathname.replace(/^\/api-tools\/?/, "").split("/").filter(Boolean);
  const toolId = pathParts[0] ?? null;

  try {
    const adminClient = await getAdminClient();

    // GET /api-tools — list tools with filtering/pagination
    if (req.method === "GET" && !toolId) {
      const category = url.searchParams.get("category");
      const search = url.searchParams.get("search");
      const pricing = url.searchParams.get("pricing");
      const featured = url.searchParams.get("featured");
      const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20"), 100);
      const offset = parseInt(url.searchParams.get("offset") ?? "0");
      const sortBy = url.searchParams.get("sort_by") ?? "created_at";
      const sortOrder = url.searchParams.get("sort_order") ?? "desc";

      const allowedSortColumns = ["created_at", "name", "average_rating", "reviews_count", "views_count"];
      if (!allowedSortColumns.includes(sortBy)) {
        return err(`Invalid sort_by. Allowed: ${allowedSortColumns.join(", ")}`, 400);
      }

      let query = adminClient
        .from("tools")
        .select(`
          id, name, slug, description, website_url, logo_url, screenshot_url,
          pricing_type, starting_price, tags, features, is_featured,
          average_rating, reviews_count, views_count, clicks_count,
          created_at, updated_at,
          categories(id, name, slug, icon, color)
        `, { count: "exact" })
        .eq("is_approved", true)
        .eq("status", "active");

      if (category) query = query.eq("categories.slug", category);
      if (pricing) query = query.eq("pricing_type", pricing);
      if (featured === "true") query = query.eq("is_featured", true);
      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      query = query.order(sortBy, { ascending: sortOrder === "asc" }).range(offset, offset + limit - 1);

      const { data, error, count } = await query;
      if (error) return err(error.message, 500);

      return json({ data, total: count, limit, offset });
    }

    // GET /api-tools/:id — single tool
    if (req.method === "GET" && toolId) {
      const { data, error } = await adminClient
        .from("tools")
        .select(`
          id, name, slug, description, long_description, website_url, affiliate_url,
          logo_url, screenshot_url, pricing_type, starting_price, tags, features,
          is_featured, average_rating, reviews_count, views_count, clicks_count,
          created_at, updated_at,
          categories(id, name, slug, icon, color)
        `)
        .eq("is_approved", true)
        .eq("status", "active")
        .or(`id.eq.${toolId},slug.eq.${toolId}`)
        .maybeSingle();

      if (error) return err(error.message, 500);
      if (!data) return err("Tool not found", 404);

      // Increment view count (fire-and-forget)
      adminClient.from("tools").update({ views_count: (data.views_count ?? 0) + 1 }).eq("id", data.id);

      return json({ data });
    }

    // POST /api-tools — admin only, create tool
    if (req.method === "POST" && !toolId) {
      const authResult = await requireAdmin(req);
      if (authResult instanceof Response) return authResult;

      let body: Record<string, unknown>;
      try {
        body = await req.json();
      } catch {
        return err("Invalid JSON body", 400);
      }

      const required = ["name", "slug", "description", "website_url", "pricing_type", "category_id"];
      for (const field of required) {
        if (!body[field]) return err(`Missing required field: ${field}`, 400);
      }

      const validPricing = ["free", "freemium", "paid", "subscription", "contact"];
      if (!validPricing.includes(body.pricing_type as string)) {
        return err(`Invalid pricing_type. Allowed: ${validPricing.join(", ")}`, 400);
      }

      // Verify category exists
      const { data: cat } = await adminClient.from("categories").select("id").eq("id", body.category_id).maybeSingle();
      if (!cat) return err("Invalid category_id", 400);

      // Check slug uniqueness
      const { data: existing } = await adminClient.from("tools").select("id").eq("slug", body.slug as string).maybeSingle();
      if (existing) return err("A tool with this slug already exists", 409);

      const { data, error } = await adminClient
        .from("tools")
        .insert({
          name: body.name,
          slug: body.slug,
          description: body.description,
          long_description: body.long_description ?? null,
          website_url: body.website_url,
          affiliate_url: body.affiliate_url ?? null,
          logo_url: body.logo_url ?? null,
          screenshot_url: body.screenshot_url ?? null,
          pricing_type: body.pricing_type,
          starting_price: body.starting_price ?? null,
          category_id: body.category_id,
          tags: body.tags ?? [],
          features: body.features ?? [],
          is_featured: body.is_featured ?? false,
          is_approved: body.is_approved ?? true,
          status: body.status ?? "active",
        })
        .select()
        .single();

      if (error) return err(error.message, 500);
      return json({ data }, 201);
    }

    // PUT /api-tools/:id — admin only, update tool
    if (req.method === "PUT" && toolId) {
      const authResult = await requireAdmin(req);
      if (authResult instanceof Response) return authResult;

      let body: Record<string, unknown>;
      try {
        body = await req.json();
      } catch {
        return err("Invalid JSON body", 400);
      }

      // Validate pricing_type if provided
      if (body.pricing_type !== undefined) {
        const validPricing = ["free", "freemium", "paid", "subscription", "contact"];
        if (!validPricing.includes(body.pricing_type as string)) {
          return err(`Invalid pricing_type. Allowed: ${validPricing.join(", ")}`, 400);
        }
      }

      // Validate category if provided
      if (body.category_id) {
        const { data: cat } = await adminClient.from("categories").select("id").eq("id", body.category_id).maybeSingle();
        if (!cat) return err("Invalid category_id", 400);
      }

      // Check slug uniqueness if changing slug
      if (body.slug) {
        const { data: existing } = await adminClient
          .from("tools").select("id").eq("slug", body.slug as string).neq("id", toolId).maybeSingle();
        if (existing) return err("A tool with this slug already exists", 409);
      }

      const allowedFields = [
        "name", "slug", "description", "long_description", "website_url", "affiliate_url",
        "logo_url", "screenshot_url", "pricing_type", "starting_price", "category_id",
        "tags", "features", "is_featured", "is_approved", "status",
      ];
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      for (const field of allowedFields) {
        if (body[field] !== undefined) updates[field] = body[field];
      }

      const { data, error } = await adminClient
        .from("tools")
        .update(updates)
        .eq("id", toolId)
        .select()
        .maybeSingle();

      if (error) return err(error.message, 500);
      if (!data) return err("Tool not found", 404);
      return json({ data });
    }

    // DELETE /api-tools/:id — admin only, soft-delete (set status=archived)
    if (req.method === "DELETE" && toolId) {
      const authResult = await requireAdmin(req);
      if (authResult instanceof Response) return authResult;

      const { data, error } = await adminClient
        .from("tools")
        .update({ status: "archived", is_approved: false, updated_at: new Date().toISOString() })
        .eq("id", toolId)
        .select("id")
        .maybeSingle();

      if (error) return err(error.message, 500);
      if (!data) return err("Tool not found", 404);
      return json({ message: "Tool archived successfully" });
    }

    return err("Method not allowed", 405);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Internal server error", 500);
  }
});
