import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Breadcrumb from "../components/Breadcrumb";
import CartPanel from "../components/CartPanel";

export const metadata: Metadata = {
  title: { absolute: "Mon panier | Landpack" },
  robots: { index: false, follow: false },
  alternates: { canonical: "/panier" },
};

export default function PanierPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Mon panier" }]} />
        <h1 className="mt-5 font-display text-2xl text-ink sm:text-3xl lg:text-4xl">Mon panier</h1>
        <span className="mt-2 mb-6 block h-1 w-14 rounded-full bg-kraft" />
        <CartPanel />
      </main>
      <Footer />
    </>
  );
}
