const steps = [["1", "Discover", "We analyze your business and identify automation opportunities."],["2", "Build", "We create the website, chatbot, workflows and CRM structure."],["3", "Launch", "We test the system and launch it for your customers."],["4", "Scale", "We improve the system with data, feedback and new automations."]];
export default function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <p className="text-sm font-bold uppercase tracking-widest text-blue-400">Process</p>
      <h2 className="mt-4 max-w-3xl text-4xl font-black md:text-5xl">A simple process for serious business transformation.</h2>
      <div className="mt-12 grid gap-6 md:grid-cols-4">
        {steps.map(([number, title, description]) => <div key={title} className="rounded-3xl border border-white/10 bg-[#0B1220] p-7"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 font-black">{number}</div><h3 className="mt-6 text-xl font-bold">{title}</h3><p className="mt-4 text-sm leading-7 text-gray-400">{description}</p></div>)}
      </div>
    </section>
  );
}
