import type { Category, SubCategory, Tool } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Category, SubCategory, Tool };

export function getCategories(): Promise<Category[]> {
  return prisma.category.findMany();
}

export function getSubCategories(): Promise<SubCategory[]> {
  return prisma.subCategory.findMany();
}
