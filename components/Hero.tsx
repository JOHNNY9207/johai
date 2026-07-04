const stats = [
  ["24/7", "AI support"],
  ["30%+", "time saved"],
  ["3x", "faster follow-up"],
];

export default function Hero() {
  return (
    <section className="mx-auto grid min-h-[86vh] max-w-7xl items-center gap-16 px-6 py-20 lg:grid-cols-2">
      <div>
        <div className="mb-6 inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
          AI Automation Platform for Global Businesses
        </div>

        <h1 className="max-w-4xl text-5xl font-black leading-tight tracking-tight md:text-7xl">
          Build smarter businesses with AI-powered automation.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-300">
          JOHAI helps companies automate customer service, websites, workflows,
          lead generation, CRM tasks, and business operations with intelligent AI systems.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a href="#contact" className="rounded-full bg-blue-600 px-8 py-4 text-center font-bold transition hover:bg-blue-500">
            Start Free Strategy Call
          </a>

          <a href="#services" className="rounded-full border border-white/15 px-8 py-4 text-center font-bold transition hover:bg-white/10">
            Explore Solutions
          </a>
        </div>

        <div className="mt-12 grid max-w-2xl grid-cols-3 gap-4">
          {stats.map(([number, label]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-3xl font-black text-blue-400">{number}</p>
              <p className="mt-1 text-sm text-gray-400">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="absolute -inset-6 rounded-[2rem] bg-blue-600/20 blur-3xl" />

        <div className="relative rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
          <div className="mb-6 flex gap-2">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-400" />
          </div>

          <div className="rounded-3xl bg-[#0B1220] p-6">
            <p className="text-sm text-blue-300">JOHAI Assistant</p>

            <p className="mt-4 text-2xl font-bold leading-relaxed">
              “I qualify leads, answer questions, book appointments, send follow-ups,
              and automate repetitive tasks 24/7.”
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white/10 p-5">
              <p className="text-3xl font-black">Lead</p>
              <p className="text-gray-400">Qualification</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-5">
              <p className="text-3xl font-black">CRM</p>
              <p className="text-gray-400">Automation</p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-white/10 p-5">
            <div className="mb-3 flex justify-between text-sm text-gray-400">
              <span>Automation readiness</span>
              <span>82%</span>
            </div>

            <div className="h-3 rounded-full bg-white/10">
              <div className="h-3 w-[82%] rounded-full bg-blue-500" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}