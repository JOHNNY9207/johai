"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import AIChat from "@/components/AIChat";

export default function FloatingChat() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-[9999] flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-2xl transition hover:scale-110 hover:bg-blue-500"
        aria-label="Open JOHAI chat"
      >
        {open ? <X size={28} /> : <MessageCircle size={28} />}
      </button>

      {open && (
        <div className="fixed bottom-28 right-6 z-[9999] w-[390px] max-w-[calc(100vw-48px)]">
          <AIChat />
        </div>
      )}
    </>
  );
}