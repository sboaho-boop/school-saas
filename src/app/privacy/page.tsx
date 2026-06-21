import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft size={16} />
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: June 2026</p>

        <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Introduction</h2>
            <p>
              EduPlatform (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting the privacy and
              security of your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard
              your information when you use our school management platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Data We Collect</h2>
            <p>We collect the following categories of personal data:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Account Information:</strong> name, email address, phone number, password (hashed)</li>
              <li><strong>Student Data:</strong> name, date of birth, class, parent contact details, attendance records, grades, wallet transactions</li>
              <li><strong>Staff Data:</strong> name, email, phone, role, department, employment history</li>
              <li><strong>Usage Data:</strong> login timestamps, IP addresses, browser user agent, audit logs of actions performed</li>
              <li><strong>Payment Data:</strong> subscription plan details, transaction references (we do not store card numbers)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Legal Basis for Processing (GDPR &amp; Data Protection Act 2012 (Act 843))</h2>
            <p>We process your personal data based on the following legal grounds:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Consent:</strong> You have explicitly consented by accepting this Privacy Policy during registration</li>
              <li><strong>Contractual Necessity:</strong> Processing is necessary to provide our school management services</li>
              <li><strong>Legal Obligation:</strong> We may process data to comply with applicable laws and regulations</li>
              <li><strong>Legitimate Interests:</strong> For security, fraud prevention, and improving our services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. How We Use Your Data</h2>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>To provide and maintain the school management platform</li>
              <li>To process attendance, grading, fee management, and wallet transactions</li>
              <li>To send SMS notifications for attendance, payments, and important alerts</li>
              <li>To generate reports and analytics for school administration</li>
              <li>To communicate with you about your account, billing, and support requests</li>
              <li>To comply with legal obligations and regulatory requirements</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Data Sharing and Disclosure</h2>
            <p>We do not sell your personal data. We may share data only:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>With Hubtel (our payment processor) for subscription billing — limited to transaction amounts and references</li>
              <li>With Hubtel SMS for sending notification messages to provided phone numbers</li>
              <li>With our hosting providers (Railway, Vercel) who process data on our behalf under strict data processing agreements</li>
              <li>When required by law or to protect our legal rights</li>
            </ul>
            <p className="mt-2">All third-party processors are contractually bound to protect your data and process it only in accordance with our instructions.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Data Security</h2>
            <p>We implement appropriate technical and organizational measures including:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Encryption of data in transit via HTTPS/TLS</li>
              <li>Password hashing using bcrypt</li>
              <li>JWT-based authentication with httpOnly cookies</li>
              <li>Role-based access control (teaching, non-teaching, headteacher, admin, accountant)</li>
              <li>Rate limiting to prevent abuse</li>
              <li>Audit logging of all create, update, and delete actions</li>
              <li>Two-factor authentication option for enhanced account security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. Data Retention</h2>
            <p>
              We retain your personal data for as long as your account is active or as needed to provide our services.
              Upon account deletion or anonymization, we remove or anonymize personal data within 30 days,
              except where retention is required by law (e.g., financial transaction records must be kept for 6 years under Ghanaian law).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">8. Your Rights</h2>
            <p>Under the Data Protection Act 2012 (Act 843) and applicable privacy laws, you have the right to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong>Rectification:</strong> Request correction of inaccurate or incomplete data</li>
              <li><strong>Erasure:</strong> Request deletion or anonymization of your personal data (&quot;right to be forgotten&quot;)</li>
              <li><strong>Restriction:</strong> Request restriction of processing of your personal data</li>
              <li><strong>Objection:</strong> Object to processing of your personal data for certain purposes</li>
              <li><strong>Portability:</strong> Request transfer of your data to another service provider</li>
              <li><strong>Withdraw Consent:</strong> Withdraw your consent at any time (without affecting the lawfulness of prior processing)</li>
            </ul>
            <p className="mt-2">
              To exercise these rights, visit your Settings page — Data &amp; Privacy tab, or contact us at{' '}
              <a href="mailto:sboaho@gmail.com" className="text-primary hover:underline">sboaho@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">9. Children&apos;s Data</h2>
            <p>
              We collect data about children (students) only as part of our school management service, with consent from
              the school acting as the data controller. Parents or legal guardians may request access to their child&apos;s
              data or deletion through the school administration.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">10. International Data Transfers</h2>
            <p>
              Your data is hosted on servers in the United States (Railway, Vercel) and may be processed in other
              jurisdictions where our service providers operate. We ensure appropriate safeguards are in place through
              data processing agreements and standard contractual clauses.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">11. Data Protection Officer &amp; Contact</h2>
            <p>
              If you have questions, concerns, or complaints about our data practices or wish to exercise your rights,
              please contact our Data Protection Officer:
            </p>
            <div className="mt-2 bg-muted p-4 rounded-lg space-y-1">
              <p><strong>EduPlatform</strong></p>
              <p>Email: <a href="mailto:sboaho@gmail.com" className="text-primary hover:underline">sboaho@gmail.com</a></p>
              <p>Phone: <a href="tel:+233502262294" className="text-primary hover:underline">050 226 2294</a></p>
              <p>WhatsApp: <a href="https://wa.me/447735310744" className="text-primary hover:underline">+44 7735 310744</a></p>
              <p>Location: Accra, Ghana</p>
            </div>
            <p className="mt-2">
              You also have the right to lodge a complaint with the Data Protection Commission (DPC) of Ghana
              at <a href="https://www.dpc.gov.gh" className="text-primary hover:underline">www.dpc.gov.gh</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">12. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Significant changes will be notified via email
              or through the platform. Continued use of the service after changes constitutes acceptance of the
              updated policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
