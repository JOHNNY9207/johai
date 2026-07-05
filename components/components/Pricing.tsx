const plans = [
  {name:"Starter",price:"$499",description:"Perfect for small businesses getting started.",features:["Professional landing page","Contact form","Basic SEO","Mobile responsive","Email integration"]},
  {name:"Professional",price:"$1,499",popular:true,description:"Our most popular solution for growing businesses.",features:["Complete website","AI chatbot","Booking system","CRM integration","Analytics dashboard","Multilingual support"]},
  {name:"Enterprise",price:"Custom",description:"Tailored AI automation for larger organizations.",features:["Custom AI workflows","Voice AI","CRM automation","API integrations","Dedicated support","Advanced analytics"]},
];
export default function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
      <p className="mb-4 font-semibold uppercase tracking-[0.25em] text-blue-400">Pricing</p>
      <h2 className="text-5xl font-black md:text-6xl">Start small. Scale intelligently.</h2>
      <div className="mt-16 grid gap-8 lg:grid-cols-3">
        {plans.map((plan) => <div key={plan.name} className={`rounded-3xl border p-8 transition duration-300 hover:-translate-y-2 ${plan.popular ? "border-blue-500 bg-blue-500/10" : "border-white/10 bg-white/5"}`}>
          {plan.popular && <span className="mb-6 inline-block rounded-full bg-blue-600 px-4 py-1 text-sm font-semibold">Most Popular</span>}
          <h3 className="text-3xl font-bold">{plan.name}</h3><p className="mt-4 text-5xl font-black text-blue-400">{plan.price}</p><p className="mt-4 text-gray-400">{plan.description}</p>
          <ul className="mt-8 space-y-4">{plan.features.map((feature) => <li key={feature} className="flex items-center gap-3 text-gray-300"><span className="text-green-400">✔</span>{feature}</li>)}</ul>
          <a href="#contact" className="mt-10 block w-full rounded-full bg-white py-4 text-center font-bold text-black transition hover:bg-blue-100">Choose Plan</a>
        </div>)}
      </div>
    </section>
  );
}
