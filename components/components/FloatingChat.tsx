"use client";
import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
export default function FloatingChat() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(!open)} className="fixed bottom-6 right-6 z-[9999] flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-2xl transition hover:scale-110 hover:bg-blue-500" aria-label="Open JOHAI chat">
        {open ? <X size={28} /> : <MessageCircle size={28} />}
      </button>
      {open && (
        <div className="fixed bottom-28 right-6 z-[9999] w-[360px] max-w-[calc(100vw-48px)] overflow-hidden rounded-3xl border border-white/10 bg-[#0B1220] text-white shadow-2xl">
          <div className="bg-blue-600 p-5"><h3 className="text-xl font-bold">JOHAI Assistant</h3><p className="text-sm text-blue-100">Ask anything about AI automation.</p></div>
          <div className="h-80 space-y-4 overflow-y-auto p-5">
            <div className="rounded-2xl bg-white/10 p-4">👋 Hello! I’m JOHAI.<br />How can I help your business today?</div>
            <div className="ml-auto rounded-2xl bg-blue-600 p-4">Example: I own a dental clinic.</div>
            <div className="rounded-2xl bg-white/10 p-4">JOHAI can automate appointment booking, reminders, patient FAQs, reviews and follow-ups.</div>
          </div>
          <div className="flex gap-3 border-t border-white/10 p-4">
            <input placeholder="Type your message..." className="flex-1 rounded-xl bg-white/10 px-4 py-3 text-white outline-none placeholder:text-gray-500" />
            <button className="rounded-xl bg-blue-600 px-4 transition hover:bg-blue-500"><Send size={18} /></button>
          </div>
        </div>
      )}
    </>
  );
}
