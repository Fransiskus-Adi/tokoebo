import {
  findAllTransactions,
  findTransactionById,
  insertTransaction,
  removeTransactionById,
  updateTransactionStatusByIdRecord,
} from "@/modules/transaction/repository";

export async function listTransactionsService() {
  return findAllTransactions();
}

export async function getTransactionByIdService(id: string) {
  return findTransactionById(id);
}

export async function createTransactionService(input: {
  customerName: string;
  itemName: string;
  itemDetails: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }>;
  amount: number;
  deliveryFee: number;
  status: "Paid" | "Unpaid";
  dueDate: string | null;
}) {
  return insertTransaction(input);
}

export async function deleteTransactionByIdService(id: string) {
  return removeTransactionById(id);
}

export async function updateTransactionStatusByIdService(id: string, status: "Paid" | "Unpaid") {
  return updateTransactionStatusByIdRecord(id, status);
}
