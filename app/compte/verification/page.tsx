import type { Metadata } from "next";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import VerifyPanel from "../../components/VerifyPanel";

export const metadata: Metadata = {
  title: { absolute: "Confirmation | Landpack" },
  robots: { index: false, follow: false },
  alternates: { canonical: "/compte/verification" },
};

export default function VerificationPage() {
  return (
    <>
      <Header />
      <main className="px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <h1 className="font-display text-2xl text-ink sm:text-3xl">Mon compte</h1>
          <span className="mt-2 mb-6 block h-1 w-14 rounded-full bg-kraft" />
          <VerifyPanel />
        </div>
      </main>
      <Footer />
    </>
  );
}
