import { StaticPageShell, ProseSection } from '@/components/marketing/page-shell';

export const metadata = {
  title: 'Refund Policy — Unified Automation',
};

export default function RefundsPage() {
  return (
    <StaticPageShell
      eyebrow="Legal"
      title={<>Refund <em className="font-normal italic text-ink-muted">Policy</em></>}
      subtitle="Last updated: May 10, 2026"
    >
      <ProseSection>
        <p>
          We want you to be confident in your enrollment. This policy explains when
          refunds are available, how to request one, and how long processing takes.
        </p>

        <h2>1. The 7-day window</h2>
        <p>
          You can request a full refund within <strong>7 calendar days</strong> of
          enrollment, provided you have completed less than 20% of the track content.
          Both conditions must be met. After either threshold is crossed, the enrollment
          becomes non-refundable.
        </p>
        <p>
          The 7-day window is calculated from the date your payment was successfully
          processed, not from the date you first accessed the content.
        </p>

        <h2>2. What counts as completion</h2>
        <p>
          Track progress is measured by the percentage of lessons marked complete in your
          dashboard. Watching a lesson video to the end automatically marks it complete.
          Skipping ahead within a video does not. Downloading project files counts toward
          completion.
        </p>

        <h2>3. How to request a refund</h2>
        <p>Email <a href="mailto:refunds@unifiedautomation.in">refunds@unifiedautomation.in</a> from the address registered on your account, including:</p>
        <ul>
          <li>Your full name as registered</li>
          <li>The track name or order ID</li>
          <li>A brief reason (helps us improve, but not required for approval)</li>
        </ul>
        <p>
          We aim to confirm receipt within 24 hours and process eligible refunds within
          5-7 business days. The refund will be credited to the original payment method.
          UPI refunds typically arrive within 24 hours of processing; card refunds may
          take 5-10 business days depending on your bank.
        </p>

        <h2>4. Non-refundable cases</h2>
        <p>Refunds are not available in the following situations:</p>
        <ul>
          <li>More than 7 days have passed since enrollment</li>
          <li>You have completed 20% or more of the track</li>
          <li>You have downloaded the certificate of completion</li>
          <li>Your account was terminated for violation of our <a href="/terms">Terms of Service</a></li>
          <li>The track was purchased using a coupon that explicitly stated "non-refundable"</li>
        </ul>

        <h2>5. Hardware kits and physical materials</h2>
        <p>
          For tracks that include shipped hardware kits (ESP32 starter kits, sensor
          bundles, etc.), the hardware portion is refundable only if returned unopened
          within 7 days, in original packaging. Return shipping is the buyer's
          responsibility unless the hardware arrived defective.
        </p>

        <h2>6. Cancellation by us</h2>
        <p>
          In the unlikely event we cancel a cohort or live workshop you paid for, you
          will receive a full refund or, at your option, credit toward a future cohort.
          Cohort start dates posted on the platform are final intent but can shift by up
          to 14 days; this is not grounds for a refund.
        </p>

        <h2>7. Disputes and chargebacks</h2>
        <p>
          We strongly prefer to resolve refund requests directly. Filing a chargeback
          with your bank without first contacting us may result in your account being
          suspended pending resolution and may make you ineligible for future enrollment.
        </p>

        <h2>8. Contact</h2>
        <p>
          For any question about refunds, email{' '}
          <a href="mailto:refunds@unifiedautomation.in">refunds@unifiedautomation.in</a>.
          We respond on business days within 24 hours.
        </p>
      </ProseSection>
    </StaticPageShell>
  );
}
