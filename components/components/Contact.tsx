"use client";
import { useState } from "react";
export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", business: "", message: "" });
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent("New JOHAI AI Audit Request");
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\nBusiness: ${form.business}\n\nMessage:\n${form.message}`);
    window.location.href = `mailto:josephjohnny017@gmail.com?subject=${subject}&body=${body}`;
  }
  return (
    <section id="contact" className="mx-auto max-w-5xl px-6 py-28">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 md:p-12">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <p className="mb-4 font-semibold uppercase tracking-[0.25em] text-blue-400">Contact</p>
            <h2 className="text-5xl font-black leading-tight md:text-6xl">Book your free AI audit.</h2>
            <p className="mt-6 leading-8 text-gray-300">Tell us about your business. JOHAI will identify what can be automated to save time, capture leads and increase revenue.</p>
            <div className="mt-8 rounded-2xl bg-black/30 p-5"><p className="font-bold text-white">What you get:</p><ul className="mt-4 space-y-3 text-gray-400"><li>✓ Automation opportunity review</li><li>✓ AI chatbot recommendation</li><li>✓ Website and lead system audit</li><li>✓ Clear action plan</li></ul></div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 outline-none placeholder:text-gray-500" placeholder="Full name" />
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 outline-none placeholder:text-gray-500" placeholder="Email address" />
            <input value={form.business} onChange={(e) => setForm({ ...form, business: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 outline-none placeholder:text-gray-500" placeholder="Business name" />
            <textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="h-32 w-full rounded-2xl border border-white/10 bg-black/20 p-4 outline-none placeholder:text-gray-500" placeholder="What do you want to automate?" />
            <button type="submit" className="w-full rounded-full bg-blue-600 px-8 py-4 font-bold transition hover:bg-blue-500">Request Free AI Audit</button>
          </form>
        </div>
      </div>
    </section>
  );
}
