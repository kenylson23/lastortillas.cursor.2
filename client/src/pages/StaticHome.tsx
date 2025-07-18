import Navigation from "../components/Navigation";
import Hero from "../components/Hero";
import SimpleMenuShowcase from "../components/SimpleMenuShowcase";
import About from "../components/About";
import Features from "../components/Features";
import OurLocations from "../components/OurLocations";
import Contact from "../components/Contact";
import Footer from "../components/Footer";

export default function StaticHome() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Hero />
      <SimpleMenuShowcase />
      <About />
      <Features />
      <OurLocations />
      <Contact />
      <Footer />
    </div>
  );
}