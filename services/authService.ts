import { apiPost } from "@/lib/apiClient";

interface SignupPayload {
  email: string;
  password: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

class AuthService {
  async signup(payload: SignupPayload) {
    return apiPost("/auth/signup", payload as unknown as Record<string, unknown>);
  }

  async login(payload: LoginPayload) {
    return apiPost("/auth/login", payload as unknown as Record<string, unknown>);
  }

  // Add more auth-related methods here if needed
}

export default new AuthService();
