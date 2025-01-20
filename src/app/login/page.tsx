"use client";

import { useState } from "react";
import Header from "../_components/header";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TRPCClientError } from "@trpc/client";
import type { User, Category } from "~/types/global";

interface LoginFormData {
  email: string;
  password: string;
}

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});

  const { data: userData, refetch: refetchUser } =
    api.user.getUser.useQuery() as { data: User; refetch: () => void };

  const { data: userCategoriesData, refetch: refetchUserCategories } =
    api.user.getUserCategories.useQuery<Category[]>();

  const loginMutation = api.auth.login.useMutation({
    onSuccess: () => {
      void refetchUser();
      void refetchUserCategories();
      router.push("/home");
    },
  });
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = (): Partial<LoginFormData> => {
    const newErrors: Partial<LoginFormData> = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email address.";
    }
    if (!formData.password.trim()) {
      newErrors.password = "Password is required.";
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      await loginMutation.mutateAsync(formData);
    } catch (err) {
      if (err instanceof TRPCClientError) {
        const message = err.message;
        if (message.includes("Invalid password")) {
          setErrors({ password: "Incorrect password." });
        } else if (message.includes("User not found")) {
          setErrors({ email: "Email not registered." });
        } else {
          setErrors({ email: "An error occurred. Please try again." });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="flex h-[100vh] items-center justify-center bg-gray-100">
        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="loader h-16 w-16 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
          </div>
        )}
        <div className="w-full max-w-xl rounded-md bg-white sm:p-2 md:p-4 lg:p-10">
          <h2 className="mb-2 text-center text-2xl font-bold">Login</h2>
          <p className="mb-1 text-center text-lg">
            Welcome back to ECOMMERCE <br />
          </p>
          <p className="mb-6 text-center text-xs text-gray-500">
            The next-gen business marketplace
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block font-medium">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full rounded-md border px-3 py-2 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full rounded-md border px-3 py-2 ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-sm text-blue-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-black py-2 text-white"
              disabled={loading}
            >
              {loading ? "Logging in..." : "LOGIN"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm">
            Don’t have an Account?{" "}
            <Link href="/signup" className="text-blue-600">
              SIGN UP
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
