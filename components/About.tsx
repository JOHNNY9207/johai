export default function About() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="mb-4 font-semibold uppercase tracking-[0.25em] text-blue-400">
            About JOHAI
          </p>

          <h2 className="text-5xl font-black leading-tight md:text-6xl">
            We build AI systems that help businesses work smarter.
          </h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <p className="leading-8 text-gray-300">
            JOHAI is an AI automation company built for modern businesses that
            want to save time, capture more leads, improve customer service and
            scale internationally.
          </p>

          <p className="mt-6 leading-8 text-gray-400">
            We do not sell technology for the sake of technology. We build
            practical business systems: AI chatbots, websites, CRM workflows,
            voice assistants, booking systems and automation tools that create
            measurable results.
          </p>
        </div>
      </div>
    </section>
  );
}