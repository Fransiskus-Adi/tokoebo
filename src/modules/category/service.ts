import { findAllCategories, insertCategory, removeCategoryById } from "@/modules/category/repository";

export async function listCategoriesService() {
  return findAllCategories();
}

export async function createCategoryService(input: { name: string }) {
  return insertCategory(input);
}

export async function deleteCategoryByIdService(id: string) {
  return removeCategoryById(id);
}
