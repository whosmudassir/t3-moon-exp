import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getCurrentUser } from "~/utils/lib";

export const userRouter = createTRPCRouter({
  saveInterests: publicProcedure
    .input(
      z.object({
        categoryIds: z.array(z.number()), // Array of category IDs
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { categoryIds } = input;
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error("User not found or not authenticated");
      }
      const userId = currentUser.id;

      // Remove existing interests for the user
      await ctx.db.userCategory.deleteMany({
        where: { userId },
      });

      // Save new interests
      const userCategories = categoryIds.map((categoryId) => ({
        userId,
        categoryId,
      }));

      await ctx.db.userCategory.createMany({
        data: userCategories,
      });

      return { success: true };
    }),
  getUserCategories: publicProcedure.query(async ({ ctx }) => {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error("User not found or not authenticated");
    }
    const userId = currentUser?.id;

    // Fetch the categories that the user has selected
    const userCategories = await ctx.db.userCategory.findMany({
      where: { userId },
      include: { category: true }, // Include category details
    });

    return userCategories.map((userCategory) => userCategory.category);
  }),
  getUser: publicProcedure.query(async ({ ctx }) => {
    const currentUser = await getCurrentUser();
    return currentUser;
  }),
});
