"use client";

import React, { useEffect, useState } from "react";
import Header from "../_components/header";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import UserHeader from "../_components/userHeader";
import type { User } from "~/types/global";

// TypeScript interfaces
interface Category {
  name: string;
  createdAt: Date;
  id: number;
}

interface CategoriesResponse {
  categories: Category[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

const InterestSelection: React.FC = () => {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const router = useRouter();

  const { data: categoriesData, isLoading } =
    api.categories.getCategories.useQuery<CategoriesResponse>({ page });

  const { data: userCategoriesData } =
    api.user.getUserCategories.useQuery<Category[]>();

  const { mutate: saveUserInterests } = api.user.saveInterests.useMutation();

  const { data: userData } = api.user.getUser.useQuery() as { data: User };

  const logoutMutation = api.auth.logout.useMutation({
    onSuccess: () => {
      router.push("/login");
    },
  });

  useEffect(() => {
    if (categoriesData && totalPages === null) {
      setTotalPages(categoriesData.totalPages);
    }
  }, [categoriesData, totalPages]);

  useEffect(() => {
    if (userCategoriesData) {
      setSelectedCategories(userCategoriesData.map((category) => category.id));
    }
  }, [userCategoriesData]);

  const handleCheckboxChange = (categoryId: number) => {
    const isSelected = selectedCategories.includes(categoryId);
    const updatedCategories = isSelected
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];

    setSelectedCategories(updatedCategories);
    saveUserInterests({ categoryIds: updatedCategories });
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  const pageNumbers = totalPages
    ? Array.from({ length: totalPages }, (_, index) => index + 1)
    : [];

  return (
    <>
      <UserHeader handleLogout={handleLogout} user={userData ?? " "} />
      <Header />

      <main className="flex h-[100vh] items-center justify-center bg-gray-100">
        <div className="w-full max-w-xl rounded-md bg-white p-4 sm:p-2 md:p-4 lg:p-10">
          <div className="font-sans">
            <h2 className="mb-2 text-center text-2xl font-semibold">
              Please mark your interests!
            </h2>
            <p className="text-md mb-8 text-center">
              We will keep you notified.
            </p>

            <div>
              <h3 className="mb-4 text-lg font-medium">My saved interests!</h3>
              <ul className="space-y-2">
                {isLoading
                  ? Array(6)
                      .fill(null)
                      .map((_, index) => (
                        <li
                          key={index}
                          className="flex animate-pulse items-center rounded border p-2"
                        >
                          <div className="mr-2 h-5 w-5 rounded bg-gray-300"></div>
                          <div className="h-4 w-3/4 rounded bg-gray-300"></div>
                        </li>
                      ))
                  : categoriesData?.categories.map((category) => (
                      <li
                        key={category.id}
                        className="flex cursor-pointer items-center rounded border p-2"
                      >
                        <label className="flex w-full cursor-pointer items-center">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category.id)}
                            onChange={() => handleCheckboxChange(category.id)}
                            className="mr-2 h-5 w-5 cursor-pointer appearance-none rounded border border-gray-300 checked:border-black checked:bg-black focus:ring-2 focus:ring-black focus:ring-offset-2"
                          />
                          {category.name}
                        </label>
                      </li>
                    ))}
              </ul>

              <div className="mt-4 flex flex-wrap items-center justify-center">
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className={`mx-1 rounded bg-black px-2 py-1 text-white hover:bg-gray-800 sm:px-4 sm:py-2 ${
                    page === 1 ? "cursor-not-allowed opacity-50" : ""
                  }`}
                >
                  &lt;&lt;
                </button>
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className={`mx-1 rounded bg-black px-2 py-1 text-white hover:bg-gray-800 sm:px-4 sm:py-2 ${
                    page === 1 ? "cursor-not-allowed opacity-50" : ""
                  }`}
                >
                  &lt;
                </button>

                {pageNumbers
                  .slice(
                    Math.max(page - 3, 0), // Start index (current page - 2)
                    Math.min(page + 2, totalPages ?? 0), // End index (current page + 2)
                  )
                  .map((pageNumber) => (
                    <button
                      key={pageNumber}
                      onClick={() => setPage(pageNumber)}
                      className={`mx-1 rounded px-2 py-1 text-black hover:bg-gray-100 sm:px-4 sm:py-2 ${
                        page === pageNumber ? "font-bold" : ""
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ))}

                <button
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, totalPages ?? 0))
                  }
                  disabled={page === totalPages}
                  className={`mx-1 rounded bg-black px-2 py-1 text-white hover:bg-gray-800 sm:px-4 sm:py-2 ${
                    page === totalPages ? "cursor-not-allowed opacity-50" : ""
                  }`}
                >
                  &gt;
                </button>
                <button
                  onClick={() => setPage(totalPages ?? 0)}
                  disabled={page === totalPages}
                  className={`mx-1 rounded bg-black px-2 py-1 text-white hover:bg-gray-800 sm:px-4 sm:py-2 ${
                    page === totalPages ? "cursor-not-allowed opacity-50" : ""
                  }`}
                >
                  &gt;&gt;
                </button>
              </div>

              <p className="mt-4 text-center">
                Page {page} of {totalPages ?? "N/A"}
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default InterestSelection;
