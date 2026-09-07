import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft size={16} />
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold mb-2">Refund Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: September 2026</p>

        <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Scope</h2>
            <p>
              This Refund Policy applies to purchases made through EduPlatform (also referred to as
              &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), including school subscription plans
              (Starter, Professional, Enterprise), Teacher Kofi tutoring plans, and NFC hardware orders
              (cards, terminals, and USB readers).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. School Subscription Plans</h2>
            <p>
              School plans are billed monthly in Ghana Cedis by mobile money or card. Subscriptions renew
              automatically until cancelled.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>You may cancel anytime; access continues until the end of the current billing period.</li>
              <li>Unused portions of a current billing period are not refunded after the period has started.</li>
              <li>If you were charged by mistake or charged twice, we will refund the full duplicate amount on request.</li>
              <li>Verified billing errors are corrected or refunded within 7 business days.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Teacher Kofi Plans</h2>
            <p>
              Teacher Kofi plans are billed monthly in US Dollars and are sold separately from school plans.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Plans may be cancelled at any time from your account.</li>
              <li>Unused portions of a current billing period are not refunded after the period has started.</li>
              <li>Duplicate or erroneous charges are fully refunded on request.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. NFC Cards &amp; Hardware Orders</h2>
            <p>
              NFC cards, card terminals, and USB readers are ordered directly from EduPlatform. Because cards and
              terminals are supplied in bulk and may be encoded with your school&apos;s details, the following
              terms apply:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Unopened, unencoded items may be returned within 14 days of delivery for a refund after inspection, excluding any delivery charges.</li>
              <li>Encoded cards (cards that have been written with student or staff data) are custom items and are not returnable unless faulty.</li>
              <li>Items received damaged or defective will be replaced or refunded free of charge.</li>
              <li>Cash refunds are returned to the original payment method, or credited to your school wallet where a payment method is unavailable.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. How to Request a Refund</h2>
            <p>
              To request a refund, contact us with your order or subscription reference:
            </p>
            <div className="mt-2 bg-muted p-4 rounded-lg space-y-1">
              <p>Email: <a href="mailto:sboaho@gmail.com" className="text-primary hover:underline">sboaho@gmail.com</a></p>
              <p>Phone: <a href="tel:+233556674353" className="text-primary hover:underline">055 667 4353</a></p>
              <p>WhatsApp: <a href="https://wa.me/447735310744" className="text-primary hover:underline">+44 7735 310744</a></p>
            </div>
            <p className="mt-2">
              We aim to respond within 2 business days and to process approved refunds within 7 business days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Contact</h2>
            <p>
              If you have any questions about this Refund Policy, contact us via email at{' '}
              <a href="mailto:sboaho@gmail.com" className="text-primary hover:underline">sboaho@gmail.com</a>{' '}
              or on WhatsApp at{' '}
              <a href="https://wa.me/447735310744" className="text-primary hover:underline">+44 7735 310744</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. Changes to This Policy</h2>
            <p>
              We may update this Refund Policy from time to time. Significant changes will be reflected here and,
              where possible, notified to you. Continued use of the service after changes constitutes acceptance
              of the updated policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}