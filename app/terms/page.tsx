import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
      <h1 className="text-2xl sm:text-3xl font-medium text-plum mb-6">Terms & conditions</h1>
      <div className="space-y-4 text-sm text-ink-muted leading-relaxed">
        <p>
          By using the AquaRealm Fish website and placing an order through WhatsApp, you agree to the
          following terms.
        </p>
        <p>
          Prices and availability shown on the website are indicative and are confirmed at the time of
          order through WhatsApp. Delivery is currently available inside Kathmandu Valley only, and delivery
          charges may vary by location.
        </p>
        <p>
          Live fish are delicate. We take care in packing and handling, but please inspect your fish upon
          delivery and let us know immediately if there is an issue.
        </p>
        <p>
          We reserve the right to update product availability, pricing, and these terms at any time.
        </p>
      </div>
    </div>
  );
}
