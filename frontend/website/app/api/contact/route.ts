import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ContactFormData } from "@/type/contactType";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();

    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 },
      );
    }

    // Public insert is permitted by RLS (contact_public_insert).
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("contact_submissions")
      .insert({
        name: body.name.trim(),
        email: body.email.trim(),
        phone: body.phone?.trim() || null,
        message: body.message.trim(),
      })
      .select("id")
      .single();

    if (error) throw error;

    return NextResponse.json(
      {
        success: true,
        id: data.id,
        message: "Contact form submitted successfully",
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to submit contact form. Please try again later." },
      { status: 500 },
    );
  }
}
