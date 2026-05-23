import {
  createTransactionService,
  deleteTransactionByIdService,
  getTransactionByIdService,
  listTransactionsService,
  updateTransactionDeliveryStatusByIdService,
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
  paymentStatus: "Paid" | "Unpaid";
  deliveryStatus: "Pending" | "Delivered";
  dueDate: string | null;
}) {
  return createTransactionService(input);
}

export async function deleteTransactionById(id: string) {
  return deleteTransactionByIdService(id);
}

export async function updateTransactionStatusById(id: string, paymentStatus: "Paid" | "Unpaid") {
  return updateTransactionStatusByIdService(id, paymentStatus);
}

export async function updateTransactionDeliveryStatusById(
  id: string,
  deliveryStatus: "Pending" | "Delivered",
) {
  return updateTransactionDeliveryStatusByIdService(id, deliveryStatus);
}
