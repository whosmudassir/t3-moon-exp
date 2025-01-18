import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const categoriesRouter = createTRPCRouter({
  getCategories: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1), // Page number, default to 1
        limit: z.number().min(1).max(100).default(6), // Limit of items per page, default to 6
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, limit } = input;

      // Calculate the offset for pagination
      const offset = (page - 1) * limit;

      // Fetch categories from the database with pagination
      const categories = await ctx.db.category.findMany({
        skip: offset,
        take: limit,
      });

      // Get the total count of categories for pagination
      const totalCount = await ctx.db.category.count();

      return {
        categories,
        totalCount,
        totalPages: Math.ceil(totalCount / limit), // Calculate total pages
        currentPage: page,
      };
    }),
});
