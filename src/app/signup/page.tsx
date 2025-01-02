"use client";

import { useState } from "react";
import Header from "../_components/header";
import { api } from "~/trpc/react";

export default function Signup() {
  const signupMutation = api.user.signup.useMutation(); // useMutation instead of useSuspenseQuery
  const verifyCodeMutation = api.user.verifyCode.useMutation();

  const onSubmit = (data: {
    name: string;
    email: string;
    password: string;
  }) => {
    signupMutation.mutate(data, {
      onSuccess: (res) => alert(res.message),
    });
  };

  const onVerify = (data: {
    email: string;
    code: string;
    password: string;
  }) => {
    verifyCodeMutation.mutate(data, {
      onSuccess: (res) => alert(res.message),
    });
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" }); // Clear error when typing
  };

  const validate = () => {
    const newErrors = {};
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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      onSubmit(formData);
      alert("Sign-up successful!");
    }
  };

  return (
    <>
      <Header />
      <main className="flex h-[100vh] items-center justify-center bg-gray-100">
        <div className="w-full max-w-md rounded-md bg-white p-6 shadow-md">
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
                className={`w-full rounded-md border px-3 py-2 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
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
              <input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full rounded-md border px-3 py-2 ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-black py-2 text-white"
            >
              CREATE ACCOUNT
            </button>
          </form>
          <p className="mt-4 text-center text-sm">
            Have an Account?{" "}
            <a href="#" className="text-blue-600">
              LOGIN
            </a>
          </p>
        </div>
      </main>
    </>
  );
}
