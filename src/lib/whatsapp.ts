import { ShopItem } from "../types";

export const DEFAULT_SHOP_HELPLINE = "01333478448";

/** wa.me needs the full international number; Bangladeshi numbers are often saved as 01XXXXXXXXX. */
export function toWhatsAppNumber(raw: string): string {
  let digits = (raw || "").replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("01")) digits = `88${digits}`;
  else if (digits.length === 10 && digits.startsWith("1")) digits = `880${digits}`;
  return digits;
}

/** Opens WhatsApp with a ready-to-send order message that links back to the product page. */
export function openWhatsAppOrder(item: Pick<ShopItem, "id" | "name" | "price">, helpline?: string) {
  const number = toWhatsAppNumber(helpline || DEFAULT_SHOP_HELPLINE);
  const price = Number(item.price);
  const link = `${window.location.origin}/shop/${item.id}`;
  const message = [
    "হ্যালো, আমি অক্ষর পাঠাগারের বিক্রয় কর্নার থেকে এই পণ্যটি অর্ডার করতে চাই:",
    `• ${item.name}${Number.isFinite(price) ? ` — ৳${price}` : ""}`,
    link,
  ].join("\n");
  window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
}
