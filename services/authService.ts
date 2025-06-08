import { BaseService } from "./baseService";

interface SignupPayload {
  email: string;
  password: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

class AuthService extends BaseService {
  async signup(payload: SignupPayload) {
    return this.post("/auth/signup", payload);
  }

  async login(payload: LoginPayload) {
    return this.post("/auth/login", payload);
  }

  // Add more auth-related methods here if needed
}

export default new AuthService();
