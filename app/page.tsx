import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TrustedCompanies from "@/components/TrustedCompanies";
import About from "@/components/About";
import Features from "@/components/Features";
import InteractiveDemo from "@/components/InteractiveDemo";
import DashboardPreview from "@/components/DashboardPreview";
import Services from "@/components/Services";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import FloatingChat from "@/components/FloatingChat";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#070A12] text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,#2563eb33,transparent_35%),radial-gradient(circle_at_top_left,#7c3aed33,transparent_30%),radial-gradient(circle_at_bottom,#0ea5e933,transparent_25%)]" />
      <Navbar />
      <Hero />
      <TrustedCompanies />
      <About />
      <Features />
      <InteractiveDemo />
      <DashboardPreview />
      <Services />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <FAQ />
      <Contact />
      <Footer />
      <FloatingChat />
    </main>
  );
}
