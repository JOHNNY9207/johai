"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-36 pb-24">
      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-5 py-2 text-sm text-blue-300">
            🚀 AI Automation Platform
          </div>

          <h1 className="mt-8 text-6xl font-black leading-tight lg:text-7xl">
            AI Employees
            <br />
            That Work
            <span className="text-blue-500"> 24/7</span>
          </h1>

          <p className="mt-8 max-w-xl text-xl leading-9 text-gray-400">
            Automate customer support, appointment booking, lead qualification,
            CRM updates, emails and repetitive workflows using intelligent AI
            assistants built specifically for your business.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#contact"
              className="rounded-xl bg-blue-600 px-8 py-4 font-semibold transition hover:bg-blue-500"
            >
              Get Free Strategy Call
            </a>

            <a
              href="#demo"
              className="rounded-xl border border-white/20 px-8 py-4 transition hover:border-blue-500 hover:bg-white/5"
            >
              ▶ Watch Demo
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute -inset-8 rounded-[2rem] bg-blue-600/20 blur-3xl" />

          <div className="relative rounded-3xl border border-white/10 bg-[#111827] p-8 shadow-2xl">
            <div className="mb-8 flex gap-3">
              <div className="h-4 w-4 rounded-full bg-red-400" />
              <div className="h-4 w-4 rounded-full bg-yellow-400" />
              <div className="h-4 w-4 rounded-full bg-green-400" />
            </div>

            <h3 className="mb-8 text-2xl font-bold">JOHAI AI Assistant</h3>

            {[
              "Answering Customers",
              "Booking Appointments",
              "Sending Follow-ups",
              "Lead Qualification",
              "CRM Automation",
            ].map((item) => (
              <div key={item} className="mb-5 flex justify-between text-lg">
                <span>{item}</span>
                <span className="text-green-400">✓</span>
              </div>
            ))}

            <div className="mt-10 rounded-2xl bg-[#1b2538] p-6">
              <div className="flex justify-between">
                <span>Status</span>
                <span className="font-bold text-green-400">● Online</span>
              </div>

              <div className="mt-6 h-3 overflow-hidden rounded-full bg-gray-700">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "92%" }}
                  transition={{ duration: 1.2, delay: 0.8 }}
                  className="h-full rounded-full bg-blue-500"
                />
              </div>

              <div className="mt-4 flex justify-between text-gray-400">
                <span>Automation Load</span>
                <span>92%</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}