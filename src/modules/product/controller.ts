import {
  createProductService,
  deleteProductByIdService,
  getProductByIdService,
  getProductsByIdsService,
  listProductsService,
  updateProductByIdService,
} from "@/modules/product/service";

export async function listProducts() {
  return listProductsService();
}

export async function getProductById(id: string) {
  return getProductByIdService(id);
}

export async function getProductsByIds(ids: string[]) {
  return getProductsByIdsService(ids);
}

export async function createProduct(input: {
  name: string;
  category: string;
  price: number;
  stock: number;
  imageUrl: string;
}) {
  return createProductService(input);
}

export async function deleteProductById(id: string) {
  return deleteProductByIdService(id);
}

export async function updateProductById(
  id: string,
  input: {
    name: string;
    category: string;
    price: number;
    stock: number;
    imageUrl?: string;
  },
) {
  return updateProductByIdService(id, input);
}
