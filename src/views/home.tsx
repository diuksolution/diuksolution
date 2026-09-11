import {
  Cta,
  Dashboard,
  Features,
  Footer,
  Header,
  Hero,
  Impact,
  Pricing,
  Problem,
  Solutions,
  Testimonials,
  TrustBar,
  Workflow,
} from "@/components/landing";

export function HomeView() {
  return (
    <>
      <Header />
      <main className="w-full pt-16">
        <Hero />
        <TrustBar />
        <Problem />
        <Workflow />
        <Features />
        <Solutions />
        <Dashboard />
        <Impact />
        <Testimonials />
        <Pricing />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
