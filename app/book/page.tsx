import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingForm from "@/components/BookingForm";

export const metadata = { title: "Book a Session" };

export default function BookPage({ searchParams }: { searchParams: { service?: string } }) {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-5 pb-28 pt-40 md:px-0">
        <h1 className="font-serif text-5xl md:text-6xl">Book a session</h1>
        <p className="mb-12 mt-4 text-stone-600">Three short steps. We reply within one working day.</p>
        <BookingForm initialService={searchParams.service ?? ""} />
      </main>
      <Footer />
    </>
  );
}
