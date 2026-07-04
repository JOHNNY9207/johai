const faqs = [
  {
    question: "Do I need to understand AI to use JOHAI?",
    answer:
      "No. We design, build and configure everything for you. You simply explain your business and your goals.",
  },
  {
    question: "Can JOHAI work for small businesses?",
    answer:
      "Absolutely. JOHAI is designed for entrepreneurs, local businesses, agencies and larger companies.",
  },
  {
    question: "Can you connect my CRM?",
    answer:
      "Yes. We can integrate popular CRM platforms and automate lead management and follow-up workflows.",
  },
  {
    question: "Is JOHAI multilingual?",
    answer:
      "Yes. The platform is being built for international use with English, French, Haitian Creole, Spanish and many more languages.",
  },
];

export default function FAQ() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <p className="mb-4 font-semibold uppercase tracking-[0.25em] text-blue-400">
        FAQ
      </p>

      <h2 className="max-w-4xl text-5xl font-black md:text-6xl">
        Frequently Asked Questions
      </h2>

      <div className="mt-14 space-y-5">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className="rounded-2xl border border-white/10 bg-white/5 p-6"
          >
            <summary className="cursor-pointer text-xl font-bold">
              {faq.question}
            </summary>

            <p className="mt-5 leading-8 text-gray-400">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}