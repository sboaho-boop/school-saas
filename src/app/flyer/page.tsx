import Link from 'next/link';

export default function FlyerPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-950 via-indigo-900 to-indigo-950 text-white">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-indigo-300">
          Launching Soon
        </p>

        <h1 className="mt-3 text-center text-3xl font-extrabold sm:text-4xl">
          EduPlatform Software Services
        </h1>

        <p className="mt-Ang mt-1 text-center text-lg font-semibold text-indigo-200">
          School Management, Solved.
        </p>

        <div className="mt-6 rounded-2xl bg-white/10 p-4 text-center">
          <p className="text-2xl font-bold">Public Launch Date</p>
          <p className="mt-1 text-3xl font-extrabold text-emerald-300">
            Monday, 28 September 2026
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-white/10 p-5">
            <p className="text-lg font-bold">Everything a school needs</p>
            <ul className="mt-2 space-y-1 text-sm text-indigo-100">
              <li>- Fee billing + payments Hubtel wallet</li>
              <li>- Live online lessons &amp; classrooms</li>
              <li>- Attendance, exams &amp; report cards</li>
              <li>- Staff, students &amp; library management</li>
            </ul>
          </div>
          <div className="rounded-xl bg-white/10 p-5">
            <p className="text-lg font-bold">Built for Ghanaian schools</p>
            <ul className="mt-2 space-y-1 text-sm text-indigo-100">
              <li>- Mobile money (MoMo) payments, 0% fee</li>
              <li>- Works on cheap phones &amp; offline guides</li>
              <li>- Local: Twi, Ga, Ewe, Fante, English</li>
              <li>- Free to set up for your school</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-indigo-400/40 bg-indigo-900/60 p-5 text-center">
          <p className="text-sm text-indigo-200">
            Optional add-on: NFC student ID cards &amp; wristbands
          </p>
          <p className="mt-1 text-xs text-indigo-300">
            Free tier needs no cards by default - cards are only printed when your school orders them.
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/register"
            className="inline-block rounded-xl bg-emerald-500 px-8 py-3 text-lg font-bold text-emerald-950 shadow-lg hover:bg-emerald-400"
          >
            Register Your School Free
          </Link>
          <p className="mt-3 text-xs text-indigo-300">
            eduplatformsoftware.com
          </p>
        </div>
      </div>
    </main>
  );
}
