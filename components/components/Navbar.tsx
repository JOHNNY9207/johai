const links = [
  { href: "#demo", label: "Demo" },
  { href: "#services", label: "Services" },
  { href: "#pricing", label: "Pricing" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  return (
    <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
      <a href="#" className="text-3xl font-black tracking-tight">JOH<span className="text-blue-500">AI</span></a>
      <div className="hidden gap-8 text-sm text-gray-300 md:flex">
        {links.map((link) => <a key={link.href} href={link.href} className="transition hover:text-white">{link.label}</a>)}
      </div>
      <div className="flex items-center gap-3">
        <select className="rounded-full border border-white/10 bg-[#101827] px-3 py-2 text-sm text-white">
          <option>🇺🇸 EN</option><option>🇫🇷 FR</option><option>🇭🇹 HT</option><option>🇪🇸 ES</option>
        </select>
        <a href="#contact" className="rounded-full bg-white px-5 py-2 text-sm font-bold text-black transition hover:bg-blue-100">Free AI Audit</a>
      </div>
    </nav>
  );
}
