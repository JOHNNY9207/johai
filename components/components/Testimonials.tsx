const testimonials = [
  {name:"Sarah M.",role:"Agency Owner",quote:"JOHAI helped us respond to leads faster and organize our sales process. It made our business look and operate more professionally."},
  {name:"Michael R.",role:"Dental Clinic Manager",quote:"The chatbot and booking flow gave our website a much stronger first impression. Patients can now get answers faster."},
  {name:"David K.",role:"Local Business Owner",quote:"We finally understood where automation could save us hours every week. JOHAI made the process simple and clear."},
];
export default function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <p className="mb-4 font-semibold uppercase tracking-[0.25em] text-blue-400">Testimonials</p>
      <h2 className="max-w-4xl text-5xl font-black leading-tight md:text-6xl">Built to help businesses move faster.</h2>
      <div className="mt-16 grid gap-8 md:grid-cols-3">
        {testimonials.map((item) => <div key={item.name} className="rounded-3xl border border-white/10 bg-white/5 p-8"><p className="text-blue-400">★★★★★</p><p className="mt-6 leading-8 text-gray-300">“{item.quote}”</p><div className="mt-8"><p className="font-bold text-white">{item.name}</p><p className="text-sm text-gray-500">{item.role}</p></div></div>)}
      </div>
    </section>
  );
}
