import { Reveal } from "@/components/Reveal";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary to-primary-dark md:flex md:flex-col md:items-center md:justify-center md:p-12">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(176,141,87,0.25),transparent_60%)]"
        />
        <Reveal className="relative flex flex-col items-center text-center">
          <img src="/logo-on-navy.png" alt="USSU crest" className="h-24 w-24" />
          <h1 className="mt-6 font-display text-3xl uppercase tracking-wide text-white">USSU Portal</h1>
          <p className="mt-3 max-w-xs text-sm text-white/80">
            Student, staff &amp; admin access for Uttarakhand State Sports University.
          </p>
        </Reveal>
      </div>

      <div className="flex items-center justify-center bg-surface p-6 sm:p-10">
        <Reveal className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">{children}</Reveal>
      </div>
    </div>
  );
}
