import {
  findAllProducts,
  findProductById,
  findProductsByIds,
  insertProduct,
  removeProductById,
  updateProductRecordById,
} from "@/modules/product/repository";

export async function listProductsService() {
  return findAllProducts();
}

export async function getProductByIdService(id: string) {
  return findProductById(id);
}

export async function getProductsByIdsService(ids: string[]) {
  return findProductsByIds(ids);
}

export async function createProductService(input: {
  name: string;
  category: string;
  price: number;
  stock: number;
  imageUrl: string;
}) {
  return insertProduct(input);
}

export async function deleteProductByIdService(id: string) {
  return removeProductById(id);
}

export async function updateProductByIdService(
  id: string,
  input: {
    name: string;
    category: string;
    price: number;
    stock: number;
    imageUrl?: string;
  },
) {
  return updateProductRecordById(id, input);
}
