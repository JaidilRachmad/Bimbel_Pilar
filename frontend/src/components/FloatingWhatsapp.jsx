
import { FaWhatsapp } from 'react-icons/fa';

export default function FloatingWhatsApp() {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_ADMIN;
  const message =
    'Halo Bimbel Pilar Cendekia, saya ingin tanya tentang tagihan SPP anak saya.';

  const whatsappUrl = `https://api.whatsapp.com/send/?phone=${whatsappNumber}&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0`;

  if (!whatsappNumber) return null;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Tanya Admin melalui WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 transition-all duration-300 hover:scale-105"
    >
      <span className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-lg">
        Tanya Admin
      </span>

      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg">
        <FaWhatsapp className="h-7 w-7" />
      </span>
    </a>
  );
}
