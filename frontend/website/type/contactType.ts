export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export interface ContactFormResponse {
  success: boolean;
  id?: string;
  message?: string;
  error?: string;
}
