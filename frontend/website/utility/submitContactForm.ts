import type { ContactFormData, ContactFormResponse } from "@/type/contactType";

export async function submitContactForm(
  formData: ContactFormData,
): Promise<ContactFormResponse> {
  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to submit contact form");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to submit contact form. Please try again.");
  }
}
