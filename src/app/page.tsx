import Link from "next/link";
import { FaExternalLinkAlt } from "react-icons/fa";

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
          <Link
            className="flex max-w-xl items-center justify-between gap-4 rounded-xl bg-white/10 p-6 hover:bg-white/20"
            href="/game"
            target="_blank"
          >
            <h3 className="text-2xl font-bold">Conway Game of Life</h3>
            <FaExternalLinkAlt className="text-xl" />
          </Link>
          <Link
            className="flex max-w-xl items-center justify-between gap-4 rounded-xl bg-white/10 p-6 hover:bg-white/20"
            href="/signup"
            target="_blank"
          >
            <h3 className="text-2xl font-bold">E-commerce website</h3>
            <FaExternalLinkAlt className="text-xl" />
          </Link>
        </div>
      </div>
    </main>
  );
}
