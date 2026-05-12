import { StaticPageShell, ProseSection } from '@/components/marketing/page-shell';

export const metadata = {
  title: 'Terms of Service — Unified Automation',
};

export default function TermsPage() {
  return (
    <StaticPageShell
      eyebrow="Legal"
      title={<>Terms of <em className="font-normal italic text-ink-muted">Service</em></>}
      subtitle="Last updated: May 10, 2026"
    >
      <ProseSection>
        <p>
          These terms govern your use of the Unified Automation platform ("the Service"),
          operated by Unified Automation Pvt Ltd ("we", "us"), a company registered in
          Tamil Nadu, India. By creating an account or enrolling in any track, you agree
          to these terms.
        </p>

        <h2>1. Eligibility</h2>
        <p>
          You must be at least 16 years old to create an account. If you are under 18,
          you confirm that you have permission from a parent or legal guardian to enroll.
          You are responsible for keeping your account credentials secure and for all
          activity under your account.
        </p>

        <h2>2. Enrollment and access</h2>
        <p>
          When you enroll in a track, you receive access to the course content for the
          duration stated on the course page. Unless explicitly noted otherwise, access
          is for one named individual and may not be shared, resold, or transferred.
        </p>
        <p>
          We reserve the right to revoke access if we detect account sharing, credential
          leakage, redistribution of course material, or other violations of these terms.
        </p>

        <h2>3. Intellectual property</h2>
        <p>
          All course videos, written material, code, project briefs, slide decks, and
          related content remain the property of Unified Automation or its licensors.
          You receive a personal, non-transferable license to access and use the content
          for your own learning. You may not:
        </p>
        <ul>
          <li>Download, record, or screen-capture protected video content</li>
          <li>Reproduce or republish course material publicly</li>
          <li>Use course content to train AI models or build competing products</li>
          <li>Share access credentials with others</li>
        </ul>
        <p>
          Code you write while completing track projects belongs to you. You are free to
          publish your project work on GitHub, include it in your portfolio, and discuss
          it with employers.
        </p>

        <h2>4. Certificates</h2>
        <p>
          Certificates are awarded upon completion of all required modules and a passing
          score on assessments. Certificates carry a unique verification number and a
          public URL. We reserve the right to revoke certificates if completion is found
          to be fraudulent.
        </p>

        <h2>5. Conduct</h2>
        <p>
          You agree to use the platform respectfully. Harassment of mentors, instructors,
          or other learners; submission of plagiarized project work; or attempts to bypass
          paywalls, DRM, or access controls will result in account termination without
          refund.
        </p>

        <h2>6. Payments and refunds</h2>
        <p>
          All payments are processed through Razorpay. Pricing is in Indian Rupees and
          inclusive of applicable GST. Refund eligibility is governed by our{' '}
          <a href="/refunds">Refund Policy</a>.
        </p>

        <h2>7. Limitation of liability</h2>
        <p>
          The Service is provided "as is" without warranty. We do not guarantee specific
          career or employment outcomes. To the extent permitted by law, our total
          liability for any claim arising from your use of the Service is limited to the
          amount you paid for the affected enrollment in the preceding twelve months.
        </p>

        <h2>8. Changes to these terms</h2>
        <p>
          We may update these terms from time to time. Material changes will be notified
          via email and posted on this page with a new "last updated" date. Continued use
          of the Service after changes constitutes acceptance of the updated terms.
        </p>

        <h2>9. Governing law</h2>
        <p>
          These terms are governed by the laws of India. Any disputes shall be subject to
          the exclusive jurisdiction of the courts in Coimbatore, Tamil Nadu.
        </p>

        <h2>10. Contact</h2>
        <p>
          For questions about these terms, write to{' '}
          <a href="mailto:legal@unifiedautomation.in">legal@unifiedautomation.in</a>.
        </p>
      </ProseSection>
    </StaticPageShell>
  );
}
