"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  HiArrowRight,
  HiCheck,
  HiExternalLink,
  HiSearch,
} from "react-icons/hi";

const supabaseUrl = "https://rcfbgkdysropbfrkvure.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjZmJna2R5c3JvcGJmcmt2dXJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyMzEyNjQsImV4cCI6MjA5NjgwNzI2NH0.d7P60IdQQWjuRtFPyjLLihVKDI7zccZn_XbICsMyiAI";

const packages = [
  {
    id: "starter",
    name: "Starter",
    price: 15,
    display: "$15.00",
    cents: 1500,
    impressions: "10,000",
    cpm: "$1.50",
    desc: "Perfect for testing copy or launching early stage projects.",
    features: ["CPM: ~$1.50", "Multiple AI platforms", "Custom Call-To-Action", "Basic click tracking"],
  },
  {
    id: "growth",
    name: "Growth",
    price: 60,
    display: "$60.00",
    cents: 6000,
    impressions: "50,000",
    cpm: "$1.20",
    desc: "Scale your campaign and drive consistent traffic to your developer tools.",
    features: ["CPM: ~$1.20 (Save 20%)", "High priority serving", "Detailed impression graphs", "Priority developer support"],
    popular: true,
  },
  {
    id: "pro",
    name: "Scale",
    price: 100,
    display: "$100.00",
    cents: 10000,
    impressions: "100,000",
    cpm: "$1.00",
    desc: "High-volume campaign optimized for developer acquisition.",
    features: ["CPM: ~$1.00 (Save 33%)", "Highest priority serving", "Dedicated advertiser console", "Dodo invoice billing"],
  },
];

let supabaseClient: any = null;
function getSupabase() {
  if (!supabaseClient && typeof window !== "undefined") {
    const { createClient } = (window as any).__supabase;
    if (createClient) {
      supabaseClient = createClient(supabaseUrl, supabaseKey);
    }
  }
  return supabaseClient;
}

export default function AdvertiseClient() {
  const reduce = useReducedMotion();
  const [selectedPkg, setSelectedPkg] = useState("growth");
  const [adText, setAdText] = useState("");
  const [advName, setAdvName] = useState("");
  const [advEmail, setAdvEmail] = useState("");
  const [clickUrl, setClickUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusId, setStatusId] = useState("");
  const [statusData, setStatusData] = useState<any>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("gptw_last_submission_id");
    if (saved) setStatusId(saved);

    // Check for payment success redirect from Dodo
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      setPaymentSuccess(true);
      const subId = params.get("submission_id");
      if (subId) {
        setStatusId(subId);
        localStorage.setItem("gptw_last_submission_id", subId);
      }
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    script.onload = () => {
      const win = window as any;
      win.__supabase = win.supabase;
    };
    document.head.appendChild(script);
  }, []);

  const pkg = packages.find((p) => p.id === selectedPkg) ?? packages[1];

  const updatePreviewLink = useCallback(() => {
    const link = document.getElementById("preview-ad-link");
    if (link) {
      link.textContent = adText.trim() || "Your sponsored text goes here...";
      (link as HTMLAnchorElement).href = clickUrl.trim() || "#";
    }
  }, [adText, clickUrl]);

  useEffect(() => {
    updatePreviewLink();
  }, [updatePreviewLink]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = getSupabase();
    if (!client) {
      alert("Supabase failed to load. Please refresh.");
      return;
    }

    setSubmitting(true);

    try {
      // Step 1: Create the campaign record in Supabase
      const { data, error } = await client
        .from("ad_submissions")
        .insert([
          {
            advertiser_name: advName,
            advertiser_email: advEmail,
            ad_text: adText,
            click_url: clickUrl,
            budget_cents: pkg.cents,
            payment_status: "pending_payment",
            approval_status: "pending_approval",
          },
        ])
        .select();

      if (error) throw error;
      if (!data || data.length === 0) throw new Error("No submission data returned.");

      const submissionId = data[0].id;
      localStorage.setItem("gptw_last_submission_id", submissionId);

      // Step 2: Create Dodo Payments checkout session via our API
      const checkoutRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId,
          packageId: pkg.id,
          email: advEmail,
        }),
      });

      if (!checkoutRes.ok) {
        const errData = await checkoutRes.json().catch(() => ({}));
        throw new Error(errData.error || `Checkout failed: ${checkoutRes.status}`);
      }

      const { checkoutUrl } = await checkoutRes.json();

      if (!checkoutUrl) {
        throw new Error("No checkout URL returned from payment service.");
      }

      // Step 3: Redirect to Dodo Payments checkout
      setTimeout(() => {
        window.location.href = checkoutUrl;
      }, 800);
    } catch (err: any) {
      console.error("Submission failed:", err);
      alert(`Failed to create campaign: ${err.message || err.details || err}`);
    } finally {
      setSubmitting(false);
    }
  };

  const checkStatus = async () => {
    const client = getSupabase();
    if (!client) {
      alert("Supabase failed to load. Please refresh.");
      return;
    }

    const id = statusId.trim();
    if (!id) {
      alert("Please enter a Submission/Campaign ID.");
      return;
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      alert("Invalid submission ID format.");
      return;
    }

    setStatusLoading(true);
    setStatusData(null);

    try {
      const { data, error } = await client
        .from("ad_submissions")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        alert("Campaign not found.");
        return;
      }

      setStatusData(data);
    } catch (err: any) {
      console.error("Status fetch failed:", err);
      alert(`Error: ${err.message || err}`);
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Payment Success Banner */}
      {paymentSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-center gap-3 bg-emerald-500/90 backdrop-blur-sm px-4 py-3 text-sm font-semibold text-zinc-950"
        >
          <HiCheck className="h-5 w-5" />
          Payment received! Your campaign is now under review and will be live within 24 hours.
          <button
            onClick={() => setPaymentSuccess(false)}
            className="ml-4 rounded-lg bg-zinc-950/20 px-3 py-1 text-xs font-medium text-zinc-950 hover:bg-zinc-950/30 transition-colors"
          >
            Dismiss
          </button>
        </motion.div>
      )}
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
          <div className="flex items-center gap-6">
            <a
              href="/"
              className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
            >
              Back to home
            </a>
            <span className="inline-flex h-7 items-center rounded-full border border-accent/20 bg-accent-soft px-3 text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
              GPTW Ads Network
            </span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(52,211,153,0.08),transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(52,211,153,0.04),transparent_50%)]" />

        <div className="relative mx-auto max-w-[1400px] px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="mb-6 inline-flex h-7 items-center rounded-full border border-accent/20 bg-accent-soft px-3 text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
                GPTW Ads Network
              </span>
              <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tighter text-zinc-100 md:text-5xl lg:text-6xl">
                Advertise Directly to{" "}
                <span className="text-accent">AI Developers</span>
              </h1>
              <p className="mt-6 max-w-md text-base leading-relaxed text-zinc-400">
                Tasteful, context-aware sponsored slots injected directly into
                Claude, ChatGPT, and Gemini load/thinking indicators. Capture
                attention when developers are waiting.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#packages"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-accent px-6 text-sm font-semibold text-zinc-950 transition-all hover:bg-accent/90 active:scale-[0.98]"
                >
                  Get Started Now
                  <HiArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#packages"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-6 text-sm font-medium text-zinc-300 transition-all hover:bg-white/[0.08] active:scale-[0.98]"
                >
                  View Packages
                </a>
              </div>
            </motion.div>

            {/* Preview Card */}
            <motion.div
              initial={reduce ? false : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative hidden lg:block"
            >
              <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-900/50 p-1">
                <div className="flex h-full w-full flex-col rounded-xl border border-white/[0.04] bg-zinc-950 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-500/60" />
                    <span className="h-3 w-3 rounded-full bg-yellow-500/60" />
                    <span className="h-3 w-3 rounded-full bg-green-500/60" />
                    <span className="ml-2 text-[11px] text-zinc-600 font-mono">
                      Claude Code / Gemini Preview
                    </span>
                  </div>
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                      <span className="text-accent">&gt;</span>
                      <span>How do I configure OAuth in Supabase?</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 text-sm text-zinc-500">&gt;</span>
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-48 rounded bg-zinc-800" />
                        <div className="h-3 w-36 rounded bg-zinc-800" />
                        <div className="h-3 w-52 rounded bg-zinc-800" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-accent/20 bg-accent-soft px-4 py-3">
                      <span className="inline-flex h-5 items-center rounded bg-accent px-1.5 text-[9px] font-bold uppercase text-zinc-950">
                        ad
                      </span>
                      <a
                        id="preview-ad-link"
                        href="#"
                        className="flex-1 text-sm text-zinc-200 underline underline-offset-2 truncate"
                      >
                        Your sponsored text goes here...
                      </a>
                      <span className="text-[11px] text-accent font-medium whitespace-nowrap">
                        Learn more &rarr;
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-center text-[11px] text-zinc-600">
                    Real-time render preview of your ad container.
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="packages"
        className="border-t border-white/[0.06] py-24 md:py-32"
      >
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-100 md:text-4xl">
              Simple, Fixed-Impression Pricing
            </h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-400">
              Choose the package that fits your campaign goals. Zero hidden fees.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {packages.map((pkg, i) => (
              <motion.div
                key={pkg.id}
                initial={reduce ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                onClick={() => setSelectedPkg(pkg.id)}
                className={`group relative cursor-pointer rounded-xl border p-8 text-center transition-all ${
                  selectedPkg === pkg.id
                    ? "border-accent/50 bg-accent/5 shadow-lg shadow-accent/5"
                    : "border-white/[0.06] bg-surface hover:border-white/[0.12]"
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex h-6 items-center rounded-full bg-accent px-3 text-[10px] font-bold uppercase tracking-wide text-zinc-950">
                    Most Popular
                  </span>
                )}
                <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                  {pkg.name}
                </span>
                <div className="mt-4 text-4xl font-semibold tracking-tight text-zinc-100">
                  {pkg.display}
                </div>
                <div className="mt-1 text-sm font-medium text-accent">
                  {pkg.impressions.toLocaleString()} Impressions
                </div>
                <p className="mt-4 text-sm leading-relaxed text-zinc-400">
                  {pkg.desc}
                </p>
                <ul className="mt-6 space-y-2 border-t border-white/[0.06] pt-6 text-left">
                  {pkg.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm text-zinc-400"
                    >
                      <HiCheck className="h-4 w-4 flex-shrink-0 text-accent" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div
                  className={`mt-6 inline-flex h-10 w-full items-center justify-center rounded-lg text-sm font-semibold transition-all ${
                    selectedPkg === pkg.id
                      ? "bg-accent text-zinc-950"
                      : "border border-white/[0.08] bg-white/[0.04] text-zinc-300"
                  }`}
                >
                  {selectedPkg === pkg.id ? "Selected" : "Select Plan"}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section
        id="submit"
        className="border-t border-white/[0.06] py-24 md:py-32"
      >
        <div className="mx-auto max-w-2xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-100 md:text-4xl">
              Submit Your Campaign
            </h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-400">
              Once submitted, you will pay securely via Dodo Payments. Ads are reviewed
              and live within 24 hours.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-12 rounded-xl border border-white/[0.06] bg-surface p-8"
          >
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="advName"
                  className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500"
                >
                  Advertiser Name
                </label>
                <input
                  id="advName"
                  type="text"
                  required
                  value={advName}
                  onChange={(e) => setAdvName(e.target.value)}
                  placeholder="e.g. Acme Dev Corp"
                  className="mt-2 block w-full rounded-lg border border-white/[0.08] bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 transition-colors focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                />
              </div>
              <div>
                <label
                  htmlFor="advEmail"
                  className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500"
                >
                  Contact Email
                </label>
                <input
                  id="advEmail"
                  type="email"
                  required
                  value={advEmail}
                  onChange={(e) => setAdvEmail(e.target.value)}
                  placeholder="e.g. sponsor@acme.com"
                  className="mt-2 block w-full rounded-lg border border-white/[0.08] bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 transition-colors focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                />
              </div>
            </div>

            <div className="mt-6">
              <label
                htmlFor="adText"
                className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500"
              >
                Ad Copy (max 50 chars)
              </label>
              <div className="relative mt-2">
                <input
                  id="adText"
                  type="text"
                  required
                  maxLength={50}
                  value={adText}
                  onChange={(e) => setAdText(e.target.value)}
                  placeholder="e.g. Issue tracking that ships fast — Linear"
                  className="block w-full rounded-lg border border-white/[0.08] bg-zinc-900 px-4 py-2.5 pr-14 text-sm text-zinc-100 placeholder-zinc-600 transition-colors focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono text-zinc-600">
                  {50 - adText.length}
                </span>
              </div>
              <p className="mt-1.5 text-[11px] text-zinc-600">
                Keep it short, direct, and developer-friendly.
              </p>
            </div>

            <div className="mt-6">
              <label
                htmlFor="clickUrl"
                className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500"
              >
                Click / Destination URL
              </label>
              <input
                id="clickUrl"
                type="url"
                required
                value={clickUrl}
                onChange={(e) => setClickUrl(e.target.value)}
                placeholder="https://yourtool.com?ref=gptw"
                className="mt-2 block w-full rounded-lg border border-white/[0.08] bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 transition-colors focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
              />
            </div>

            <div className="mt-6 flex items-center justify-between rounded-lg border border-accent/20 bg-accent-soft px-4 py-3">
              <span className="text-sm text-zinc-400">Selected Plan:</span>
              <span className="text-sm font-semibold text-accent">
                {pkg.name} Package ({pkg.display})
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 text-sm font-semibold text-zinc-950 transition-all hover:bg-accent/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Creating Campaign..."
                : "Submit Campaign & Pay via Dodo"}
            </button>
          </form>
        </div>
      </section>

      {/* Status Checker */}
      <section className="border-t border-white/[0.06] py-24 md:py-32">
        <div className="mx-auto max-w-lg px-6">
          <div className="rounded-xl border border-white/[0.06] bg-surface p-8 text-center">
            <h3 className="text-xl font-semibold tracking-tight text-zinc-100">
              Check Campaign Status
            </h3>
            <p className="mt-2 text-sm text-zinc-400">
              Input your Campaign/Submission ID to check real-time payment and
              approval status.
            </p>

            <div className="mt-6 flex gap-3">
              <input
                type="text"
                value={statusId}
                onChange={(e) => setStatusId(e.target.value)}
                placeholder="Paste your submission ID here..."
                className="block flex-1 rounded-lg border border-white/[0.08] bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 transition-colors focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
              />
              <button
                onClick={checkStatus}
                disabled={statusLoading}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-zinc-950 transition-all hover:bg-accent/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <HiSearch className="h-4 w-4" />
                Track
              </button>
            </div>

            {statusLoading && (
              <div className="mt-6 text-sm text-zinc-400">Looking up...</div>
            )}

            {statusData && (
              <div className="mt-6 space-y-3 rounded-lg border border-white/[0.06] bg-zinc-900/50 p-4 text-left">
                <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                  <span className="text-sm text-zinc-500">Name</span>
                  <span className="text-sm font-medium text-zinc-200">
                    {statusData.advertiser_name}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                  <span className="text-sm text-zinc-500">Ad Copy</span>
                  <span className="text-sm font-medium text-zinc-200">
                    {statusData.ad_text}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                  <span className="text-sm text-zinc-500">Payment</span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${
                      statusData.payment_status === "paid"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-yellow-500/10 text-yellow-400"
                    }`}
                  >
                    {statusData.payment_status === "paid"
                      ? "Paid"
                      : "Pending Payment"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-500">Approval</span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${
                      statusData.approval_status === "approved"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : statusData.approval_status === "rejected"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-yellow-500/10 text-yellow-400"
                    }`}
                  >
                    {statusData.approval_status === "approved"
                      ? "Approved"
                      : statusData.approval_status === "rejected"
                        ? "Rejected"
                        : "Pending Approval"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-12">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <p className="text-xs text-zinc-600">
            &copy; {new Date().getFullYear()} ShiftKeys, Inc. Built for
            transparency and supporting developers.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="https://kickbacks.ai"
              className="text-xs text-zinc-500 transition-colors hover:text-zinc-300"
            >
              Partner Site
            </a>
            <a
              href="mailto:support@gptw.ai"
              className="text-xs text-zinc-500 transition-colors hover:text-zinc-300"
            >
              Advertiser Support
            </a>
            <a
              href="/"
              className="text-xs text-zinc-500 transition-colors hover:text-zinc-300"
            >
              GetPaidToWait Home
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
