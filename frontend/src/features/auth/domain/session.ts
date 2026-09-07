export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface Session {
  user: AuthUser;
  token: string;
}
