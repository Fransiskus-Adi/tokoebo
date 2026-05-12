import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextResponse } from "next/server";
import { getTransactionById } from "@/lib/store";

type RouteProps = {
  params: Promise<{ id: string }>;
};

const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function parseItems(raw: string) {
  if (!raw.trim()) return [];
  return raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const match = part.match(/^(.*)\sx(\d+)$/i);
      if (!match) return { name: part, qty: 1 };
      return { name: match[1].trim(), qty: Number(match[2]) || 1 };
    });
}

function drawRightText(params: {
  page: import("pdf-lib").PDFPage;
  text: string;
  rightX: number;
  y: number;
  size: number;
  font: import("pdf-lib").PDFFont;
  color?: ReturnType<typeof rgb>;
}) {
  const width = params.font.widthOfTextAtSize(params.text, params.size);
  params.page.drawText(params.text, {
    x: params.rightX - width,
    y: params.y,
    size: params.size,
    font: params.font,
    color: params.color,
  });
}

export async function GET(_: Request, { params }: RouteProps) {
  const { id } = await params;
  const transaction = await getTransactionById(id);

  if (!transaction) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const lineColor = rgb(0.4, 0.4, 0.4);
  const black = rgb(0, 0, 0);
  const detailedItems = (transaction.item_details ?? []).map((item) => ({
    product_name: item.product_name,
    quantity: Number(item.quantity) || 1,
    unit_price: Number(item.unit_price) || 0,
    subtotal: Number(item.subtotal) || 0,
  }));

  const subtotal =
    detailedItems.length > 0
      ? detailedItems.reduce((sum, item) => sum + item.subtotal, 0)
      : Math.max(0, Number(transaction.amount) - Number(transaction.delivery_fee));

  const fallbackItems = parseItems(transaction.item_name || "");

  const pageRight = 547;
  let y = 730;
  const x = 48;

  page.drawText("Invoice", {
    x,
    y,
    size: 88,
    font: bold,
    color: black,
  });
  drawRightText({
    page,
    text: new Date(transaction.created_at).toLocaleDateString("id-ID"),
    rightX: pageRight,
    y: 675,
    size: 14,
    font,
    color: black,
  });
  drawRightText({
    page,
    text: `Invoice No. ${transaction.id}`,
    rightX: pageRight,
    y: 645,
    size: 16,
    font: bold,
    color: black,
  });

  y = 620;
  page.drawLine({ start: { x, y }, end: { x: pageRight, y }, thickness: 1, color: lineColor });
  y -= 36;
  page.drawText("Billed to:", { x, y, size: 17, font: bold });
  y -= 30;
  page.drawText(transaction.customer_name, { x, y, size: 13, font });
  y -= 22;
  page.drawText(`Status: ${transaction.status}`, { x, y, size: 13, font });
  y -= 22;
  page.drawText("Toko Ebo Customer", { x, y, size: 13, font });
  y -= 30;
  page.drawLine({ start: { x, y }, end: { x: pageRight, y }, thickness: 1, color: lineColor });

  y -= 36;
  page.drawLine({ start: { x, y }, end: { x: pageRight, y }, thickness: 1, color: lineColor });
  y -= 28;
  page.drawText("Description", { x, y, size: 12, font: bold });
  page.drawText("Rate", { x: 325, y, size: 12, font: bold });
  page.drawText("Qty", { x: 410, y, size: 12, font: bold });
  drawRightText({ page, text: "Amount", rightX: pageRight - 20, y, size: 12, font: bold, color: black });
  y -= 16;
  page.drawLine({ start: { x, y }, end: { x: pageRight, y }, thickness: 1, color: lineColor });

  const drawItemRow = (desc: string, rate: number, qty: number, amount: number) => {
    y -= 26;
    page.drawText(desc, { x, y, size: 12, font });
    page.drawText(currency.format(rate), { x: 315, y, size: 12, font });
    page.drawText(String(qty), { x: 420, y, size: 12, font });
    drawRightText({ page, text: currency.format(amount), rightX: pageRight - 12, y, size: 12, font, color: black });
    y -= 14;
    page.drawLine({ start: { x, y }, end: { x: pageRight, y }, thickness: 1, color: lineColor });
  };

  if (detailedItems.length > 0) {
    detailedItems.forEach((item) => {
      drawItemRow(item.product_name, item.unit_price, item.quantity, item.subtotal);
    });
  } else if (fallbackItems.length === 0) {
    drawItemRow("Transaction Item", subtotal, 1, subtotal);
  } else {
    const totalQty = Math.max(
      1,
      fallbackItems.reduce((sum, item) => sum + item.qty, 0),
    );
    const blendedRate = subtotal / totalQty;
    fallbackItems.forEach((item) => {
      const amount = blendedRate * item.qty;
      drawItemRow(item.name, blendedRate, item.qty, amount);
    });
  }

  y -= 34;
  drawRightText({ page, text: "Subtotal", rightX: 430, y, size: 12, font: bold, color: black });
  drawRightText({ page, text: currency.format(subtotal), rightX: pageRight - 12, y, size: 12, font, color: black });
  y -= 32;
  drawRightText({ page, text: "Delivery Fee", rightX: 430, y, size: 12, font: bold, color: black });
  drawRightText({
    page,
    text: currency.format(transaction.delivery_fee),
    rightX: pageRight - 12,
    y,
    size: 12,
    font,
    color: black,
  });
  y -= 18;
  page.drawLine({ start: { x: 350, y }, end: { x: pageRight, y }, thickness: 1, color: lineColor });
  y -= 30;
  drawRightText({ page, text: "Total", rightX: 430, y, size: 16, font: bold, color: black });
  drawRightText({
    page,
    text: currency.format(transaction.amount),
    rightX: pageRight - 12,
    y,
    size: 16,
    font: bold,
    color: black,
  });

  const footerTop = 160;

  page.drawText("Payment Information", { x, y: footerTop + 8, size: 13, font: bold });
  page.drawText("Toko Ebo", { x, y: footerTop - 18, size: 12, font });
  page.drawText("Bank: Toko Ebo Bank", { x, y: footerTop - 40, size: 12, font });
  page.drawText("Account No: 0123 4567 8901", { x, y: footerTop - 62, size: 12, font });

  page.drawLine({
    start: { x, y: 52 },
    end: { x: pageRight, y: 52 },
    thickness: 1,
    color: lineColor,
  });

  const pdfBytes = await pdfDoc.save();

  return new NextResponse(new Uint8Array(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${transaction.id}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
