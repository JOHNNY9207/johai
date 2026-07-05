const columns = [
  {title:"Services",items:["AI Chatbots","Business Automation","AI Websites","CRM Systems"]},
  {title:"Company",items:["About","Contact","Careers","Blog"]},
  {title:"Legal",items:["Privacy Policy","Terms of Service","Security","Compliance"]},
];
export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#05070d] px-6 py-14">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
        <div><h2 className="text-3xl font-black">JOH<span className="text-blue-500">AI</span></h2><p className="mt-5 leading-7 text-gray-400">Building intelligent AI solutions that help businesses automate, grow and scale worldwide.</p></div>
        {columns.map((column) => <div key={column.title}><h3 className="mb-5 text-lg font-bold">{column.title}</h3><div className="space-y-3">{column.items.map((item) => <p key={item} className="cursor-pointer text-gray-400 transition hover:text-white">{item}</p>)}</div></div>)}
      </div>
      <div className="mx-auto mt-12 flex max-w-7xl flex-col items-center justify-between border-t border-white/10 pt-8 text-sm text-gray-500 md:flex-row"><p>© 2026 JOHAI. All rights reserved.</p><p>Designed for the future of AI.</p></div>
    </footer>
  );
}
