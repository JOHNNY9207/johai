export default function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-36 pb-24">
      <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-16 items-center">

        {/* LEFT */}
        <div>
          <div className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-5 py-2 text-sm text-blue-300">
            🚀 AI Automation Platform
          </div>

          <h1 className="mt-8 text-6xl lg:text-7xl font-black leading-tight">
            AI Employees
            <br />
            That Work
            <span className="text-blue-500"> 24/7</span>
          </h1>

          <p className="mt-8 max-w-xl text-xl text-gray-400 leading-9">
            Automate customer support, appointment booking, lead qualification,
            CRM updates, emails and repetitive workflows using intelligent AI
            assistants built specifically for your business.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">

            <button className="rounded-xl bg-blue-600 hover:bg-blue-500 transition px-8 py-4 font-semibold">
              Get Free Strategy Call
            </button>

            <button className="rounded-xl border border-white/20 hover:border-blue-500 hover:bg-white/5 transition px-8 py-4">
              ▶ Watch Demo
            </button>

          </div>

          <div className="mt-12 flex items-center gap-10">

            <div>
              <p className="text-4xl font-bold">500+</p>
              <p className="text-gray-500">Automations Built</p>
            </div>

            <div>
              <p className="text-4xl font-bold">24/7</p>
              <p className="text-gray-500">AI Availability</p>
            </div>

            <div>
              <p className="text-4xl font-bold">98%</p>
              <p className="text-gray-500">Customer Satisfaction</p>
            </div>

          </div>
        </div>

        {/* RIGHT */}

        <div className="relative">

          <div className="rounded-3xl border border-white/10 bg-[#111827] p-8 shadow-2xl">

            <div className="flex gap-3 mb-8">
              <div className="h-4 w-4 rounded-full bg-red-400" />
              <div className="h-4 w-4 rounded-full bg-yellow-400" />
              <div className="h-4 w-4 rounded-full bg-green-400" />
            </div>

            <h3 className="text-2xl font-bold mb-8">
              JOHAI AI Assistant
            </h3>

            <div className="space-y-5 text-lg">

              <div className="flex justify-between">
                <span>Answering Customers</span>
                <span className="text-green-400">✓</span>
              </div>

              <div className="flex justify-between">
                <span>Booking Appointments</span>
                <span className="text-green-400">✓</span>
              </div>

              <div className="flex justify-between">
                <span>Sending Follow-ups</span>
                <span className="text-green-400">✓</span>
              </div>

              <div className="flex justify-between">
                <span>Lead Qualification</span>
                <span className="text-green-400">✓</span>
              </div>

              <div className="flex justify-between">
                <span>CRM Automation</span>
                <span className="text-green-400">✓</span>
              </div>

            </div>

            <div className="mt-10 rounded-2xl bg-[#1b2538] p-6">

              <div className="flex justify-between">
                <span>Status</span>
                <span className="text-green-400 font-bold">
                  ● Online
                </span>
              </div>

              <div className="mt-6 h-3 rounded-full bg-gray-700 overflow-hidden">
                <div className="h-full w-[92%] rounded-full bg-blue-500" />
              </div>

              <div className="mt-4 flex justify-between text-gray-400">
                <span>Automation Load</span>
                <span>92%</span>
              </div>

            </div>

          </div>

          <div className="absolute -bottom-10 -left-8 rounded-2xl bg-blue-600 px-6 py-5 shadow-xl">
            <p className="text-3xl font-bold">+37</p>
            <p className="text-sm text-blue-100">
              Meetings Booked Today
            </p>
          </div>

          <div className="absolute -top-8 -right-8 rounded-2xl bg-emerald-500 px-6 py-5 shadow-xl">
            <p className="text-3xl font-bold">24/7</p>
            <p className="text-sm">
              AI Running
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}