"use client";

import { useState, useCallback } from "react";
import Header from "../_components/header";
import { api } from "~/trpc/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type FormData = {
  name: string;
  email: string;
  password: string;
};

type Errors = Partial<FormData & { verificationCode: string; global: string }>;

// Define custom error types
interface ApiError {
  code?: string;
  message: string;
}

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const [showVerificationUI, setShowVerificationUI] = useState(false);
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
  });

  const signupMutation = api.auth.signup.useMutation();
  const verifyCodeMutation = api.auth.verifyCode.useMutation();
  const router = useRouter();

  const obfuscateEmail = useCallback((email: string): string => {
    const [username, domain] = email.split("@");
    const obfuscatedUsername = username?.slice(0, 3) + "***";
    return `${obfuscatedUsername}@${domain}`;
  }, []);

  const validate = useCallback((): Errors => {
    const newErrors: Errors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email address.";
    }
    if (!formData.password.trim()) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }
    return newErrors;
  }, [formData]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // Clear specific field error
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const validationErrors = validate();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
      } else {
        setLoading(true);
        signupMutation.mutate(formData, {
          onSuccess: () => {
            setShowVerificationUI(true);
            setLoading(false);
          },
          onError: (error: ApiError) => {
            setErrors({ global: error.message });
            setLoading(false);
          },
        });
      }
    },
    [formData, validate, signupMutation],
  );

  const handleCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCode(e.target.value);
    },
    [],
  );

  const handleVerify = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (code.length !== 8) {
        setErrors({
          verificationCode: "Please enter an 8-digit verification code.",
        });
        return;
      }

      setLoading(true);
      verifyCodeMutation.mutate(
        { ...formData, verificationCode: code },
        {
          onSuccess: () => {
            router.push("/home");
            setLoading(false);
          },
          onError: (error: ApiError) => {
            setErrors({ global: error.message });
            setLoading(false);
          },
        },
      );
    },
    [code, formData, verifyCodeMutation, router],
  );

  const codeArray = code
    ? code.split("").concat(Array(8 - code.length).fill(""))
    : Array(8).fill("");

  const mappedArray = codeArray.map((char, index) => (
    <div
      key={index}
      className={`h-10 w-10 border text-center ${
        index === 0 && focused
          ? "border-blue-500 bg-blue-100"
          : "border-gray-300"
      }`}
    >
      {char}
    </div>
  ));

  const handleFocus = () => {
    setFocused(true);
  };

  return (
    <>
      <Header />
      <main className="flex h-[100vh] items-center justify-center bg-gray-100">
        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="loader h-16 w-16 rounded-full border-4 border-white border-t-transparent"></div>
          </div>
        )}

        {showVerificationUI ? (
          <div className="w-full max-w-xl rounded-md bg-white p-6 sm:p-8 md:p-10">
            <h2 className="mb-2 text-center text-xl font-bold sm:text-2xl">
              Verify your email
            </h2>
            <p className="mb-4 text-center text-sm text-gray-600 sm:text-base">
              Enter the 8-digit code you have received on{" "}
              <p className="font-semibold">{obfuscateEmail(formData.email)}</p>
            </p>
            <p className="text-center text-sm text-gray-600">Code</p>
            <form onSubmit={handleVerify} className="relative space-y-4">
              <div className="absolute left-0 top-0 flex w-full justify-center gap-2">
                {mappedArray}
              </div>

              <div className="opacity-0">
                <input
                  type="text"
                  maxLength={8}
                  value={code}
                  onFocus={handleFocus}
                  onChange={handleCodeChange}
                  className="h-10 w-80 rounded-md border border-gray-300 text-center font-mono text-lg focus:border-black focus:outline-none sm:h-12 sm:w-96 sm:text-xl"
                />
              </div>

              {errors.verificationCode && (
                <p className="text-center text-sm text-red-500">
                  {errors.verificationCode}
                </p>
              )}
              {errors.global && (
                <p className="text-center text-sm text-red-500">
                  {errors.global}
                </p>
              )}

              <button
                type="submit"
                className="w-full rounded-md bg-black py-2 text-sm text-white sm:py-2.5 sm:text-base"
              >
                VERIFY
              </button>
            </form>
          </div>
        ) : (
          <div className="w-full max-w-xl rounded-md bg-white p-6">
            <h2 className="mb-4 text-center text-2xl font-bold">
              Create your account
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block font-medium">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full rounded-md border px-3 py-2 ${errors.name ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>
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
                  className={`w-full rounded-md border px-3 py-2 ${errors.email ? "border-red-500" : "border-gray-300"}`}
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
                    className={`w-full rounded-md border px-3 py-2 ${errors.password ? "border-red-500" : "border-gray-300"}`}
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
              {errors.global && (
                <p className="text-sm text-red-500">{errors.global}</p>
              )}
              <button
                type="submit"
                className="w-full rounded-md bg-black py-2 text-white"
              >
                CREATE ACCOUNT
              </button>
            </form>
            <p className="mt-4 text-center text-sm">
              Have an Account?{" "}
              <Link href="/login" className="text-blue-600">
                LOGIN
              </Link>
            </p>
          </div>
        )}
      </main>
    </>
  );
}
