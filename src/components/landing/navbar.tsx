import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-linear-to-br from-violet-500 via-blue-500 to-cyan-400 shadow-sm" />
            <span className="text-base font-bold text-slate-900">Hirefy</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
            <Link href="#platform" className="hover:text-slate-950">
              Platform
            </Link>
            <Link href="#features" className="hover:text-slate-950">
              Features
            </Link>
            <Link href="#for-companies" className="hover:text-slate-950">
              For Companies
            </Link>
            <Link href="#faq" className="hover:text-slate-950">
              FAQ
            </Link>
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/login"
              className="rounded-full px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Get started
              <span aria-hidden="true" className="ml-2">
                →
              </span>
            </Link>
          </div>

          <details className="group static md:hidden">
            <summary className="flex h-10 w-10 list-none items-center justify-center rounded-full border border-gray-200 text-slate-700 shadow-sm transition-colors hover:bg-slate-50 [::-webkit-details-marker]:hidden">
              <span className="text-2xl leading-none">≡</span>
            </summary>

            <div className="absolute left-0 top-16  w-screen bg-white p-4 ">
              <nav className="flex flex-col text-sm font-medium text-slate-700">
                <Link href="#platform" className="px-3 py-3 hover:bg-slate-50 hover:text-slate-950">
                  Platform
                </Link>
                <Link href="#features" className="px-3 py-3 hover:bg-slate-50 hover:text-slate-950">
                  Features
                </Link>
                <Link href="#for-companies" className="px-3 py-3 hover:bg-slate-50 hover:text-slate-950">
                  For Companies
                </Link>
                <Link href="#faq" className="px-3 py-3 hover:bg-slate-50 hover:text-slate-950">
                  FAQ
                </Link>
              </nav>

              <div className="mt-4 grid gap-3 border-t border-gray-200 pt-4">
                <Link
                  href="/login"
                  className="rounded-full border border-gray-200 px-4 py-3 text-center text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Get started
                  <span aria-hidden="true" className="ml-2">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}