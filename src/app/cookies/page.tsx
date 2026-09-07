import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft size={16} />
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold mb-2">Cookie Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: September 2026</p>

        <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. What Are Cookies?</h2>
            <p>
              Cookies are small text files placed on your device when you visit a website. They are widely used to
              keep you signed in, remember preferences, and help sites work correctly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Cookies We Use</h2>
            <p>
              EduPlatform (also referred to as &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) uses only strictly
              necessary cookies for authentication. We do not use advertising, analytics, or tracking cookies.
            </p>
            <div className="mt-3 space-y-3">
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-semibold text-foreground">edu_token</p>
                <p className="mt-1">Logs you into the school management dashboards. Strictly necessary; set as an httponly, secure cookie that expires after 7 days.</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-semibold text-foreground">edu_super_token</p>
                <p className="mt-1">Logs the platform owner into the super-admin console. Strictly necessary; set as an httponly, secure cookie that expires after 24 hours.</p>
              </div>
            </div>
            <p className="mt-3">
              These cookies cannot be switched off because the platform cannot function without them.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Browser Local Storage</h2>
            <p>We also use browser local storage (not cookies) for the following:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Language preference</strong> (<span className="font-mono">eduplatform-lang</span>) so the platform opens in your chosen language</li>
              <li><strong>Theme preference</strong> (<span className="font-mono">theme</span>) so your light or dark setting is remembered</li>
              <li><strong>Session tokens</strong> for the driver app, Teacher Kofi, and super-admin console, together with basic account details cached for convenience</li>
            </ul>
            <p className="mt-2">
              This data stays on your device and is only read by EduPlatform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Third-Party Storage</h2>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Payments:</strong> when you complete a subscription payment, our payment providers (Hubtel, Paystack) may place their own cookies on their checkout pages. Those cookies are governed by the providers&apos; own policies.</li>
              <li><strong>Video:</strong> the demo video on our website is hosted by YouTube and embedded in an iframe. YouTube may set cookies when the video is played, governed by YouTube&apos;s privacy policy.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Managing Cookies</h2>
            <p>
              Strictly necessary cookies cannot be disabled without breaking the platform. You can clear cookies and
              local storage at any time through your browser settings; if you do, you will need to sign in again and
              your language and theme preferences will reset.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Contact</h2>
            <p>
              Questions about this Cookie Policy can be sent to{' '}
              <a href="mailto:sboaho@gmail.com" className="text-primary hover:underline">sboaho@gmail.com</a> or on
              WhatsApp at{' '}
              <a href="https://wa.me/447735310744" className="text-primary hover:underline">+44 7735 310744</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. Changes to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time. Significant changes will be reflected here.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}