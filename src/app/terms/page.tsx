import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | GetPaidToWait",
  description:
    "Terms and conditions for using the GetPaidToWait ad network and extensions.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6">
          <a href="/" className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-xs font-bold text-zinc-950">
              $
            </span>
            <span className="text-sm font-semibold tracking-tight text-zinc-100">
              GetPaidToWait
            </span>
          </a>
          <a
            href="/"
            className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
          >
            Back to home
          </a>
        </div>
      </nav>

      <div className="pt-28 pb-20 mx-auto max-w-3xl px-6">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-100 md:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-3 text-sm text-zinc-500">
          Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="mt-12 prose-custom space-y-8">
          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By installing the GetPaidToWait (&quot;GPTW&quot;) extension, using our
              website, or submitting an advertising campaign, you agree to be
              bound by these Terms of Service. If you do not agree, please
              uninstall the extension and discontinue use of our services.
            </p>
          </section>

          <section>
            <h2>2. Service Description</h2>
            <p>
              GPTW operates an ad network that displays tasteful, context-aware
              sponsored content during AI tool loading states in VS Code, browser
              extensions, and CLI integrations. Developers earn revenue from
              impressions served during their coding sessions. Advertisers pay to
              reach this engaged developer audience.
            </p>
          </section>

          <section>
            <h2>3. Developer Terms</h2>
            <h3>3.1 Eligibility</h3>
            <p>
              You must be at least 18 years old or the age of majority in your
              jurisdiction to participate in revenue sharing.
            </p>

            <h3>3.2 Revenue Sharing</h3>
            <p>
              Developers receive up to 50% of ad revenue generated from
              impressions served during their sessions. Revenue is calculated
              based on verified, non-fraudulent impressions only.
            </p>

            <h3>3.3 Prohibited Conduct</h3>
            <ul>
              <li>
                <strong>Impression Farming:</strong> Artificially generating ad
                impressions through automated tools, scripts, or repeated
                deliberate triggering of loading states.
              </li>
              <li>
                <strong>Click Fraud:</strong> Clicking on ads with the intent to
                inflate click counts rather than genuine interest.
              </li>
              <li>
                <strong>Interference:</strong> Modifying the extension to alter
                impression tracking, bypass fraud detection, or manipulate
                revenue calculations.
              </li>
            </ul>
            <p>
              Violation of these terms will result in account suspension,
              forfeiture of unpaid earnings, and permanent blocking from the
              network.
            </p>
          </section>

          <section>
            <h2>4. Advertiser Terms</h2>
            <h3>4.1 Campaign Submission</h3>
            <p>
              All ad campaigns are subject to review and approval. We reserve the
              right to reject any campaign that violates our content policy or
              these terms.
            </p>

            <h3>4.2 Content Policy</h3>
            <p>Advertisements must not contain:</p>
            <ul>
              <li>Misleading, deceptive, or false claims</li>
              <li>Adult, violent, or offensive content</li>
              <li>Malware, phishing, or security threats</li>
              <li>Cryptocurrency scams or pump-and-dump schemes</li>
              <li>Competing ad networks or similar services</li>
              <li>Content that violates any applicable law or regulation</li>
            </ul>

            <h3>4.3 Payment Terms</h3>
            <ul>
              <li>
                Payments are processed via Dodo Payments. All prices are in USD.
              </li>
              <li>
                Campaigns are activated only after successful payment and
                approval.
              </li>
              <li>
                Refunds are available within 7 days of purchase if fewer than 10%
                of purchased impressions have been served.
              </li>
            </ul>

            <h3>4.4 Impression Delivery</h3>
            <p>
              We make best-effort delivery of the purchased impression count.
              Delivery timelines depend on active user volume and are not
              guaranteed within specific timeframes. Impression counts are
              tracked in real-time and visible in the advertiser dashboard.
            </p>
          </section>

          <section>
            <h2>5. Intellectual Property</h2>
            <p>
              The GPTW extension, website, APIs, and all associated branding are
              owned by ShiftKeys, Inc. Advertisers retain ownership of their ad
              copy and creative content. By submitting a campaign, advertisers
              grant us a limited license to display their content through our
              network.
            </p>
          </section>

          <section>
            <h2>6. Limitation of Liability</h2>
            <p>
              GPTW is provided &quot;as is&quot; without warranties of any kind, express or
              implied. We are not liable for:
            </p>
            <ul>
              <li>
                Loss of revenue due to service interruptions or technical issues
              </li>
              <li>Actions taken by advertisers or their linked websites</li>
              <li>
                Any indirect, incidental, or consequential damages arising from
                use of our service
              </li>
            </ul>
            <p>
              Our total liability to you shall not exceed the amount you paid us
              in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2>7. Termination</h2>
            <p>
              We may suspend or terminate your access to the service at any time
              for violation of these terms or for any reason at our discretion.
              Developers may uninstall the extension at any time. Advertisers may
              request campaign cancellation subject to the refund policy above.
            </p>
          </section>

          <section>
            <h2>8. Modifications</h2>
            <p>
              We reserve the right to modify these Terms of Service at any time.
              Material changes will be communicated via the extension update
              notes or our website. Continued use after modifications constitutes
              acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2>9. Governing Law</h2>
            <p>
              These Terms are governed by and construed in accordance with the
              laws of the State of Delaware, United States, without regard to
              conflict of law principles.
            </p>
          </section>

          <section>
            <h2>10. Contact</h2>
            <p>
              For questions about these Terms of Service, contact us at:
            </p>
            <p className="font-medium text-zinc-200">
              support@gptw.ai
            </p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8">
        <div className="mx-auto max-w-3xl px-6 flex items-center justify-between">
          <p className="text-xs text-zinc-600">
            &copy; {new Date().getFullYear()} ShiftKeys, Inc.
          </p>
          <div className="flex gap-4">
            <a href="/privacy" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
              Privacy Policy
            </a>
            <a href="/" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
              Home
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
