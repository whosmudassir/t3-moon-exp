export interface User {
  id: string;
  name?: string;
  email: string;
  password?: string;
  isVerified: boolean;
  createdAt: string;
}
