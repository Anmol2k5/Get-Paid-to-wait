import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | GetPaidToWait",
  description:
    "Learn how GetPaidToWait collects, uses, and protects your data.",
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-zinc-500">
          Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="mt-12 prose-custom space-y-8">
          <section>
            <h2>1. Overview</h2>
            <p>
              GetPaidToWait (&quot;GPTW&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates an ad network for AI
              developer tools. This Privacy Policy explains how we collect, use,
              and protect information when you use our VS Code extension, browser
              extension, CLI integrations, or our website at
              getpaidtowait.com.
            </p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>
            <h3>2.1 Extension Users (Developers)</h3>
            <ul>
              <li>
                <strong>Client ID:</strong> A randomly generated UUID stored
                locally on your machine. This is not linked to your personal
                identity.
              </li>
              <li>
                <strong>Impression Events:</strong> When an ad is displayed, we
                record the event type (impression, click), timestamp, surface
                (overlay/banner), and visible duration.
              </li>
              <li>
                <strong>Editor Metadata:</strong> OS type, editor version, and
                extension version for compatibility and debugging purposes.
              </li>
            </ul>

            <h3>2.2 Advertisers</h3>
            <ul>
              <li>
                <strong>Account Information:</strong> Name and email address
                provided during campaign submission.
              </li>
              <li>
                <strong>Campaign Data:</strong> Ad copy, destination URL, and
                selected package/budget.
              </li>
              <li>
                <strong>Payment Information:</strong> Processed by Dodo Payments.
                We do not store credit card numbers, bank account details, or
                other payment credentials.
              </li>
            </ul>
          </section>

          <section>
            <h2>3. How We Use Information</h2>
            <ul>
              <li>
                <strong>Ad Serving:</strong> Deliver relevant, non-intrusive
                sponsored content during AI tool loading states.
              </li>
              <li>
                <strong>Analytics:</strong> Provide advertisers with aggregate
                impression and click statistics.
              </li>
              <li>
                <strong>Fraud Prevention:</strong> Detect and prevent impression
                farming, click fraud, and other abuse.
              </li>
              <li>
                <strong>Payments:</strong> Process advertiser payments and
                developer revenue sharing.
              </li>
              <li>
                <strong>Service Improvement:</strong> Debug issues, improve ad
                delivery, and enhance user experience.
              </li>
            </ul>
          </section>

          <section>
            <h2>4. Data Sharing</h2>
            <p>
              We do not sell your personal information. We share data only with:
            </p>
            <ul>
              <li>
                <strong>Supabase:</strong> Our database provider, used to store
                campaign and impression data.
              </li>
              <li>
                <strong>Dodo Payments:</strong> Our payment processor for
                advertiser transactions.
              </li>
              <li>
                <strong>Vercel:</strong> Our hosting provider for the web
                dashboard and API.
              </li>
            </ul>
          </section>

          <section>
            <h2>5. Data Retention</h2>
            <p>
              Impression event data is retained for 90 days for analytics
              purposes, then automatically purged. Campaign submissions and
              advertiser information are retained for the duration of the
              campaign plus 12 months for billing and legal compliance.
            </p>
          </section>

          <section>
            <h2>6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>
                <strong>Opt Out:</strong> Disable the extension at any time to
                stop all ad serving and data collection.
              </li>
              <li>
                <strong>Data Deletion:</strong> Request deletion of your data by
                contacting us at support@gptw.ai.
              </li>
              <li>
                <strong>Data Export:</strong> Request a copy of your data in
                machine-readable format.
              </li>
            </ul>
          </section>

          <section>
            <h2>7. Security</h2>
            <p>
              We implement industry-standard security measures including
              encrypted data transmission (TLS), HMAC-signed webhook
              verification, rate limiting, and automated fraud detection.
            </p>
          </section>

          <section>
            <h2>8. Cookies</h2>
            <p>
              Our website uses minimal, functional cookies for admin session
              management. We do not use third-party tracking cookies or
              advertising pixels.
            </p>
          </section>

          <section>
            <h2>9. Children&apos;s Privacy</h2>
            <p>
              Our service is not directed at children under 13. We do not
              knowingly collect information from children under 13.
            </p>
          </section>

          <section>
            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify
              users of material changes via the extension or our website.
            </p>
          </section>

          <section>
            <h2>11. Contact Us</h2>
            <p>
              For privacy-related questions or requests, contact us at:
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
            <a href="/terms" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
              Terms of Service
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
