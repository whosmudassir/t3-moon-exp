export interface User {
  id: string;
  name?: string;
  email: string;
  password?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface Category {
  name: string;
  createdAt: Date;
  id: number;
}
