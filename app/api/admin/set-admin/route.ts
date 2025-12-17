import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: "Missing Supabase environment variables." },
        { status: 500 }
      );
    }

    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.toLowerCase().startsWith("bearer ")
      ? authHeader.slice(7).trim()
      : "";

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      email?: string;
      isAdmin?: boolean;
    };

    const email = (body.email || "").trim().toLowerCase();
    const isAdmin = body.isAdmin === true;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const adminSupabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const authSupabase = createClient(supabaseUrl, supabaseAnonKey);

    const {
      data: { user },
      error: userError,
    } = await authSupabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: callerProfile, error: callerProfileError } = await adminSupabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();

    if (callerProfileError || !callerProfile || callerProfile.is_admin !== true) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!isAdmin && email === (user.email || "").toLowerCase()) {
      return NextResponse.json(
        { error: "You cannot revoke your own admin access." },
        { status: 400 }
      );
    }

    const perPage = 1000;
    const maxPages = 10;

    let foundUser:
      | {
          id: string;
          email?: string;
        }
      | null = null;

    for (let page = 1; page <= maxPages; page++) {
      const { data, error } = await adminSupabase.auth.admin.listUsers({
        page,
        perPage,
      });

      if (error) {
        return NextResponse.json(
          { error: "Failed to list users" },
          { status: 500 }
        );
      }

      const users = data?.users ?? [];
      foundUser =
        users.find((u) => (u.email || "").toLowerCase() === email) ?? null;

      if (foundUser) break;
      if (users.length < perPage) break;
    }

    if (!foundUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { error: upsertError } = await adminSupabase.from("profiles").upsert(
      {
        id: foundUser.id,
        is_admin: isAdmin,
      },
      { onConflict: "id" }
    );

    if (upsertError) {
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, email, isAdmin });
  } catch {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
