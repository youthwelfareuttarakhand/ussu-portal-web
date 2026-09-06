"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { PayOrder } from "@/types/api";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, cb: (r: unknown) => void) => void };
  }
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load payment gateway"));
    document.body.appendChild(script);
  });
}

// Pays every unpaid applicable fee line item (course fee + hostel fee if
// opted) in a single combined Razorpay checkout.
export function PayFeeButton({ label }: { label: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setLoading(true);
    setError(null);
    try {
      await loadRazorpayScript();
      const order = await apiFetch<PayOrder>("/fees/pay", { method: "POST" });
      const razorpay = new window.Razorpay!({
        key: order.razorpayKeyId,
        order_id: order.razorpayOrderId,
        amount: order.amount,
        currency: "INR",
        name: "Uttarakhand State Sports University",
        description: "Course Fee",
        handler: async (response: unknown) => {
          const r = response as { razorpay_payment_id: string; razorpay_signature: string };
          try {
            await apiFetch("/fees/verify-payment", {
              method: "POST",
              body: JSON.stringify({
                razorpayOrderId: order.razorpayOrderId,
                razorpayPaymentId: r.razorpay_payment_id,
                razorpaySignature: r.razorpay_signature,
              }),
            });
            router.refresh();
          } catch {
            setError("Payment succeeded but we couldn't confirm it automatically. Please contact support.");
          }
        },
        modal: {
          ondismiss: () => setError("Payment cancelled. You can try again."),
        },
      });
      razorpay.on("payment.failed", (response: unknown) => {
        const r = response as { error?: { description?: string } };
        setError(r.error?.description ?? "Payment failed. Please try again.");
      });
      razorpay.open();
    } catch {
      setError("Could not start payment. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={pay}
        disabled={loading}
        className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
      >
        {loading ? "Starting…" : label}
      </button>
      {error && <p className="max-w-xs text-right text-[11px] text-accent">{error}</p>}
    </div>
  );
}
