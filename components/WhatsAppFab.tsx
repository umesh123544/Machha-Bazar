import { MessageCircle } from "lucide-react";

export default function WhatsAppFab({ whatsappNumber }: { whatsappNumber: string }) {
  return (
    <a
      href={`https://wa.me/${whatsappNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      className="md:hidden fixed bottom-4 left-4 right-4 z-40 flex items-center justify-center gap-2 bg-berry text-berry-text text-sm font-medium py-3 rounded-xl shadow-lg"
    >
      <MessageCircle size={18} />
      WhatsApp Us
    </a>
  );
}
