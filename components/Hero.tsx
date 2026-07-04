"use client";

import { motion } from "framer-motion";

const activity = [
  ["💬", "Demo", "AI conversations"],
  ["📅", "Demo", "appointments booked"],
  ["⚡", "Demo", "hours saved"],
  ["⭐", "Demo", "customer experience"],
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-28 pt-32">
      <div className="absolute left-1/2 top-20 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[120px]" />

      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-5 py-2 text-sm font-semibold text-blue-300">
            AI employees for modern businesses
          </div>

          <h1 className="mt-8 max-w-4xl text-5xl font-black leading-tight tracking-tight md:text-7xl">
            Stop losing customers because your business can’t respond fast
            enough.
          </h1>

          <p className="mt-8 max-w-2xl text-xl leading-9 text-gray-400">
            JOHAI builds AI employees that answer customers, book appointments,
            qualify leads, update your CRM and automate repetitive work 24/7.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="#contact"
              className="rounded-full bg-blue-600 px-8 py-4 text-center font-bold transition hover:bg-blue-500"
            >
              Book My Free AI Audit
            </a>

            <a
              href="#demo"
              className="rounded-full border border-white/15 px-8 py-4 text-center font-bold transition hover:bg-white/10"
            >
              ▶ See JOHAI Live
            </a>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {activity.map(([icon, number, label]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <p className="text-3xl">{icon}</p>
                <p className="mt-3 text-3xl font-black text-blue-400">
                  {number}
                </p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 35 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute -inset-6 rounded-[2rem] bg-blue-600/20 blur-3xl" />

          <div className="relative rounded-[2rem] border border-white/10 bg-[#0B1220]/90 p-6 shadow-2xl backdrop-blur">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Live AI conversation</p>
                <h3 className="text-2xl font-black">JOHAI Assistant</h3>
              </div>

              <span className="rounded-full bg-green-500/10 px-4 py-2 text-sm font-bold text-green-400">
                ● Online
              </span>
            </div>

            <div className="space-y-4">
              <div className="max-w-[85%] rounded-2xl bg-white/10 p-4">
                <p className="text-sm text-gray-400">Customer</p>
                <p className="mt-1">Hi, I’d like to schedule an appointment.</p>
              </div>

              <div className="ml-auto max-w-[85%] rounded-2xl bg-blue-600 p-4">
                <p className="text-sm text-blue-100">JOHAI</p>
                <p className="mt-1">Absolutely. What day works best for you?</p>
              </div>

              <div className="max-w-[85%] rounded-2xl bg-white/10 p-4">
                <p className="text-sm text-gray-400">Customer</p>
                <p className="mt-1">Tomorrow morning.</p>
              </div>

              <div className="ml-auto max-w-[85%] rounded-2xl bg-blue-600 p-4">
                <p className="text-sm text-blue-100">JOHAI</p>
                <p className="mt-1">
                  Perfect. You’re booked for 10:00 AM tomorrow. Confirmation
                  email sent. CRM updated.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-2xl font-black">92</p>
                <p className="text-xs text-gray-500">conversations today</p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-2xl font-black">37</p>
                <p className="text-xs text-gray-500">appointments booked</p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-2xl font-black">18</p>
                <p className="text-xs text-gray-500">leads qualified</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}