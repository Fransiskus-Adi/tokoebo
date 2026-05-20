import {
  createCategoryService,
  deleteCategoryByIdService,
  listCategoriesService,
} from "@/modules/category/service";

export async function listCategories() {
  return listCategoriesService();
}

export async function createCategory(input: { name: string }) {
  return createCategoryService(input);
}

export async function deleteCategoryById(id: string) {
  return deleteCategoryByIdService(id);
}
