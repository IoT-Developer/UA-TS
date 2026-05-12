import { StaticPageShell, ProseSection } from '@/components/marketing/page-shell';

export const metadata = {
  title: 'Privacy Policy — Unified Automation',
};

export default function PrivacyPage() {
  return (
    <StaticPageShell
      eyebrow="Legal"
      title={<>Privacy <em className="font-normal italic text-ink-muted">Policy</em></>}
      subtitle="Last updated: May 10, 2026"
    >
      <ProseSection>
        <p>
          This policy explains what data Unified Automation Pvt Ltd ("we") collects when
          you use our platform, how we use it, and your rights under the Indian Digital
          Personal Data Protection Act, 2023.
        </p>

        <h2>1. What we collect</h2>
        <p>When you create an account or enroll in a track, we collect:</p>
        <ul>
          <li>Identity data — name, email address, profile photo (if provided via Google sign-in)</li>
          <li>Education data — college, branch, year of study, when you choose to share these</li>
          <li>Payment data — Razorpay handles card and UPI details directly; we receive only payment status, transaction ID, and amount</li>
          <li>Learning activity — courses enrolled, lessons completed, quiz scores, certificates earned</li>
          <li>Technical data — IP address, browser, device type, pages visited (via privacy-respecting analytics)</li>
        </ul>

        <h2>2. How we use it</h2>
        <ul>
          <li>To deliver the tracks you enrolled in and track your progress</li>
          <li>To issue certificates and respond to verification requests</li>
          <li>To process payments and send transactional emails (receipts, reminders)</li>
          <li>To improve the platform — which lessons are skipped, where learners drop off</li>
          <li>To recommend internships and refer you to hiring partners (only with your consent)</li>
        </ul>
        <p>
          <strong>We do not sell your data.</strong> We do not run third-party
          advertising on the platform. We do not use your learning activity to train AI
          models.
        </p>

        <h2>3. Who we share with</h2>
        <p>We share data only with service providers necessary to operate the platform:</p>
        <ul>
          <li>Clerk — authentication</li>
          <li>Razorpay — payments</li>
          <li>VdoCipher — secure video delivery</li>
          <li>Resend — transactional email</li>
          <li>Neon / AWS — database and hosting</li>
        </ul>
        <p>
          Each of these providers is contractually obligated to protect your data and use
          it only for the purposes we direct.
        </p>

        <h2>4. Cookies and analytics</h2>
        <p>
          We use a small number of essential cookies for sign-in sessions and to remember
          your preferences. We use a privacy-respecting analytics tool (Plausible /
          PostHog) that does not use cookies for cross-site tracking.
        </p>

        <h2>5. Your rights</h2>
        <p>Under the DPDP Act, 2023, you have the right to:</p>
        <ul>
          <li>Access the data we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request erasure of your data, subject to legal retention requirements</li>
          <li>Withdraw consent for non-essential processing at any time</li>
          <li>Nominate someone to exercise these rights on your behalf</li>
        </ul>
        <p>
          To exercise any of these rights, email{' '}
          <a href="mailto:privacy@unifiedautomation.in">privacy@unifiedautomation.in</a>.
          We respond within 30 days.
        </p>

        <h2>6. Data retention</h2>
        <p>
          We retain your account and learning history while your account is active. If
          you delete your account, we retain a minimal record of completed certificates
          (so verification continues to work for employers) but anonymize your identity
          data within 90 days. Payment records are retained for 7 years as required by
          Indian tax law.
        </p>

        <h2>7. Security</h2>
        <p>
          We use encryption in transit (HTTPS) and at rest, role-based access control for
          our team, and audit logs for sensitive actions. Despite this, no system is
          perfectly secure. If we detect a breach affecting your data, we will notify you
          and the Data Protection Board of India within 72 hours.
        </p>

        <h2>8. Children</h2>
        <p>
          Our platform is intended for users 16 and older. If you are under 18, a parent
          or guardian must provide consent to your enrollment.
        </p>

        <h2>9. Updates to this policy</h2>
        <p>
          We will post any changes here with a new "last updated" date. Material changes
          will be notified via email.
        </p>

        <h2>10. Grievance officer</h2>
        <p>
          As required by Indian law, our designated Grievance Officer is reachable at{' '}
          <a href="mailto:grievance@unifiedautomation.in">grievance@unifiedautomation.in</a>.
          We acknowledge complaints within 24 hours and resolve them within 15 days.
        </p>
      </ProseSection>
    </StaticPageShell>
  );
}
