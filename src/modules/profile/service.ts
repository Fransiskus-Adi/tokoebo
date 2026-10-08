import { scryptSync, timingSafeEqual } from "node:crypto";
import {
  getUserProfileByUsername,
  updatePaymentInfo as repoUpdatePaymentInfo,
  getPasswordHash,
  updatePassword as repoUpdatePassword,
} from "@/modules/profile/repository";

export type { UserProfileRow } from "@/modules/profile/repository";

export async function getProfile(username: string) {
  return getUserProfileByUsername(username);
}

export async function savePaymentInfo(
  username: string,
  paymentName: string,
  paymentBank: string,
  paymentAccountNo: string,
) {
  if (!paymentName.trim() || !paymentBank.trim() || !paymentAccountNo.trim()) {
    throw new Error("All payment fields are required.");
  }
  await repoUpdatePaymentInfo(
    username,
    paymentName.trim(),
    paymentBank.trim(),
    paymentAccountNo.trim(),
  );
}

function verifyScrypt(password: string, stored: string): boolean {
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const derived = scryptSync(password, salt, expected.length);
  return timingSafeEqual(derived, expected);
}

export async function changePassword(
  username: string,
  currentPassword: string,
  newPassword: string,
) {
  if (!currentPassword || !newPassword) {
    throw new Error("All password fields are required.");
  }
  if (newPassword.length < 6) {
    throw new Error("New password must be at least 6 characters.");
  }

  const storedHash = await getPasswordHash(username);
  if (!storedHash) {
    throw new Error("User not found.");
  }

  const valid =
    storedHash.startsWith("scrypt$")
      ? verifyScrypt(currentPassword, storedHash)
      : currentPassword === storedHash;

  if (!valid) {
    throw new Error("Current password is incorrect.");
  }

  await repoUpdatePassword(username, newPassword);
}
