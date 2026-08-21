import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
      <h1 className="text-2xl sm:text-3xl font-medium text-plum mb-6">Privacy policy</h1>
      <div className="space-y-4 text-sm text-ink-muted leading-relaxed">
        <p>
          AquaRealm Fish respects your privacy. This page explains what information we collect when you
          browse our website or contact us, and how we use it.
        </p>
        <p>
          We do not require account registration to browse or order. When you contact us through WhatsApp
          or our contact form, we collect the information you choose to share, such as your name, phone
          number, and delivery address, only to process your order or reply to your inquiry.
        </p>
        <p>
          We do not sell or share your personal information with third parties. Basic, privacy-conscious
          analytics may be used to understand site usage, without collecting unnecessary personal data.
        </p>
        <p>
          If you have questions about this policy, please contact us through the details on our Contact page.
        </p>
      </div>
    </div>
  );
}
