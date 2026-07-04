export default function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-5xl px-6 py-28">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 md:p-12">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <p className="mb-4 font-semibold uppercase tracking-[0.25em] text-blue-400">
              Contact
            </p>

            <h2 className="text-5xl font-black leading-tight md:text-6xl">
              Ready to build your AI business system?
            </h2>

            <p className="mt-6 leading-8 text-gray-300">
              Start with a free strategy call. We will identify where AI can
              save time, reduce costs, improve customer experience and generate
              more revenue.
            </p>

            <a
              href="mailto:contact@johai.ai"
              className="mt-8 inline-flex rounded-full bg-white px-7 py-4 font-bold text-black transition hover:bg-blue-100"
            >
              contact@johai.ai
            </a>
          </div>

          <form className="space-y-4">
            <input
              className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 outline-none placeholder:text-gray-500"
              placeholder="Full name"
            />

            <input
              className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 outline-none placeholder:text-gray-500"
              placeholder="Email address"
            />

            <input
              className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 outline-none placeholder:text-gray-500"
              placeholder="Business name"
            />

            <textarea
              className="h-32 w-full rounded-2xl border border-white/10 bg-black/20 p-4 outline-none placeholder:text-gray-500"
              placeholder="Tell us what you want to automate"
            />

            <button
              type="button"
              className="w-full rounded-full bg-blue-600 px-8 py-4 font-bold transition hover:bg-blue-500"
            >
              Request Free Strategy Call
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}