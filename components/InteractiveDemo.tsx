"use client";

import { useState } from "react";

const industries = {
  "Dental Clinic": [
    "Answer patient questions 24/7",
    "Book appointments automatically",
    "Send appointment reminders",
    "Follow up after visits",
    "Collect Google reviews",
  ],
  "Law Firm": [
    "Qualify new clients",
    "Collect case details",
    "Schedule consultations",
    "Send follow-up emails",
    "Organize leads in a CRM",
  ],
  Restaurant: [
    "Answer menu questions",
    "Take reservation requests",
    "Promote daily specials",
    "Collect customer feedback",
    "Automate social media content",
  ],
  "Real Estate": [
    "Qualify buyers and sellers",
    "Schedule property tours",
    "Send listing information",
    "Follow up with prospects",
    "Update CRM automatically",
  ],
  "Beauty Salon": [
    "Book appointments",
    "Answer service questions",
    "Send reminders",
    "Promote offers",
    "Collect reviews",
  ],
};

export default function InteractiveDemo() {
  const [selected, setSelected] = useState("Dental Clinic");

  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <p className="mb-4 font-semibold uppercase tracking-[0.25em] text-blue-400">
        Live Demo
      </p>

      <h2 className="max-w-4xl text-5xl font-black leading-tight md:text-6xl">
        See what JOHAI can automate for your business.
      </h2>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <p className="mb-6 text-xl font-bold">
            What type of business do you own?
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {Object.keys(industries).map((industry) => (
              <button
                key={industry}
                onClick={() => setSelected(industry)}
                className={`rounded-2xl border px-5 py-4 text-left font-semibold transition ${
                  selected === industry
                    ? "border-blue-500 bg-blue-600"
                    : "border-white/10 bg-black/20 hover:bg-white/10"
                }`}
              >
                {industry}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-blue-500/30 bg-blue-500/10 p-8">
          <p className="text-blue-300">JOHAI Recommendation</p>

          <h3 className="mt-3 text-3xl font-black">
            For a {selected}, JOHAI can:
          </h3>

          <ul className="mt-8 space-y-5">
            {industries[selected as keyof typeof industries].map((item) => (
              <li key={item} className="flex gap-3 text-lg text-gray-200">
                <span className="text-green-400">✓</span>
                {item}
              </li>
            ))}
          </ul>

          <a
            href="#contact"
            className="mt-10 inline-flex rounded-full bg-white px-8 py-4 font-bold text-black"
          >
            Build This System
          </a>
        </div>
      </div>
    </section>
  );
}