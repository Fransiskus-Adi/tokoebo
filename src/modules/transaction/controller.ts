import {
  createTransactionService,
  deleteTransactionByIdService,
  getTransactionByIdService,
  listTransactionsService,
  updateTransactionStatusByIdService,
} from "@/modules/transaction/service";

export async function listTransactions() {
  return listTransactionsService();
}

export async function getTransactionById(id: string) {
  return getTransactionByIdService(id);
}

export async function createTransaction(input: {
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
  return createTransactionService(input);
}

export async function deleteTransactionById(id: string) {
  return deleteTransactionByIdService(id);
}

export async function updateTransactionStatusById(id: string, status: "Paid" | "Unpaid") {
  return updateTransactionStatusByIdService(id, status);
}
