const features = [
  ["🧠", "AI Automation", "Automate repetitive tasks and free your team from manual work."],
  ["⚡", "Save Time", "Reduce delays with instant answers, automatic follow-ups and smart workflows."],
  ["📈", "Grow Revenue", "Capture leads faster and convert more prospects into paying customers."],
  ["🔒", "Built for Trust", "Professional systems designed with security, reliability and clarity."],
];

export default function Features() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
        Why JOHAI
      </p>

      <h2 className="mt-4 max-w-3xl text-4xl font-black md:text-5xl">
        Your business should not lose money because of slow systems.
      </h2>

      <div className="mt-12 grid gap-6 md:grid-cols-4">
        {features.map(([icon, title, description]) => (
          <div key={title} className="rounded-3xl border border-white/10 bg-white/5 p-7">
            <div className="text-4xl">{icon}</div>
            <h3 className="mt-6 text-xl font-bold">{title}</h3>
            <p className="mt-4 text-sm leading-7 text-gray-400">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}