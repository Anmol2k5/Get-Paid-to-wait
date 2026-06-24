"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  HiCheck,
  HiX,
  HiEye,
  HiShieldCheck,
  HiShieldExclamation,
  HiRefresh,
  HiSearch,
  HiChevronLeft,
  HiChevronRight,
  HiLockClosed,
  HiBan,
  HiClock,
} from "react-icons/hi";

interface Campaign {
  id: string;
  advertiser_name: string;
  advertiser_email: string;
  ad_text: string;
  click_url: string;
  budget_cents: number;
  payment_status: string;
  approval_status: string;
  rejection_reason?: string;
  reviewed_at?: string;
  total_impressions?: number;
  total_clicks?: number;
  created_at: string;
}

interface FraudBlock {
  id: string;
  block_type: string;
  block_value: string;
  reason: string;
  created_at: string;
}

const STATUS_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  pending_approval: { bg: "bg-yellow-500/10", text: "text-yellow-400", label: "Pending" },
  approved: { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "Approved" },
  rejected: { bg: "bg-red-500/10", text: "text-red-400", label: "Rejected" },
};

const PAYMENT_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  pending_payment: { bg: "bg-yellow-500/10", text: "text-yellow-400", label: "Pending" },
  paid: { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "Paid" },
  payment_failed: { bg: "bg-red-500/10", text: "text-red-400", label: "Failed" },
};

export default function AdminClient() {
  const reduce = useReducedMotion();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState<"campaigns" | "fraud">("campaigns");

  // Campaign state
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");

  // Detail modal
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Fraud state
  const [fraudBlocks, setFraudBlocks] = useState<FraudBlock[]>([]);
  const [fraudLoading, setFraudLoading] = useState(false);
  const [newBlockType, setNewBlockType] = useState<"ip" | "client_id">("client_id");
  const [newBlockValue, setNewBlockValue] = useState("");
  const [newBlockReason, setNewBlockReason] = useState("");

  // Auth check
  useEffect(() => {
    const saved = localStorage.getItem("gptw_admin_token");
    if (saved) setToken(saved);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.error || "Authentication failed");
        return;
      }

      setToken(data.token);
      localStorage.setItem("gptw_admin_token", data.token);
    } catch {
      setAuthError("Network error. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("gptw_admin_token");
  };

  // Fetch campaigns
  const fetchCampaigns = useCallback(async () => {
    if (!token) return;
    setLoading(true);

    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (statusFilter) params.set("status", statusFilter);
      if (paymentFilter) params.set("payment", paymentFilter);

      const res = await fetch(`/api/admin/campaigns?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        handleLogout();
        return;
      }

      const data = await res.json();
      setCampaigns(data.campaigns || []);
      setTotal(data.total || 0);
    } catch {
      console.error("Failed to fetch campaigns");
    } finally {
      setLoading(false);
    }
  }, [token, page, statusFilter, paymentFilter]);

  useEffect(() => {
    if (token) fetchCampaigns();
  }, [token, fetchCampaigns]);

  // Update campaign status
  const updateStatus = async (id: string, status: string, reason?: string) => {
    setActionLoading(true);
    try {
      const body: Record<string, string> = { id, approval_status: status };
      if (reason) body.rejection_reason = reason;

      const res = await fetch("/api/admin/campaigns", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        fetchCampaigns();
        setSelectedCampaign(null);
        setRejectReason("");
      }
    } catch {
      console.error("Failed to update campaign");
    } finally {
      setActionLoading(false);
    }
  };

  // Fetch fraud blocks
  const fetchFraudBlocks = useCallback(async () => {
    if (!token) return;
    setFraudLoading(true);
    try {
      const res = await fetch("/api/admin/fraud", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFraudBlocks(data.blocks || []);
      }
    } catch {
      console.error("Failed to fetch fraud blocks");
    } finally {
      setFraudLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token && activeTab === "fraud") fetchFraudBlocks();
  }, [token, activeTab, fetchFraudBlocks]);

  const addBlock = async () => {
    if (!newBlockValue.trim()) return;
    try {
      await fetch("/api/admin/fraud", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          block_type: newBlockType,
          block_value: newBlockValue.trim(),
          reason: newBlockReason.trim() || "Manual block by admin",
        }),
      });
      setNewBlockValue("");
      setNewBlockReason("");
      fetchFraudBlocks();
    } catch {
      console.error("Failed to add block");
    }
  };

  const removeBlock = async (blockType: string, blockValue: string) => {
    try {
      await fetch("/api/admin/fraud", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ block_type: blockType, block_value: blockValue }),
      });
      fetchFraudBlocks();
    } catch {
      console.error("Failed to remove block");
    }
  };

  // Stats
  const pendingCount = campaigns.filter((c) => c.approval_status === "pending_approval").length;
  const approvedCount = campaigns.filter((c) => c.approval_status === "approved").length;
  const totalRevenue = campaigns
    .filter((c) => c.payment_status === "paid")
    .reduce((acc, c) => acc + c.budget_cents, 0);

  // ── Auth gate ──
  if (!token) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-8">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-lg font-bold text-zinc-950 mb-4">
              $
            </span>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
              GPTW Admin
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Enter admin password to continue
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin password"
                required
                autoFocus
                className="block w-full rounded-xl border border-white/[0.08] bg-zinc-900 pl-10 pr-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 transition-colors focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
              />
            </div>

            {authError && (
              <p className="text-sm text-red-400 text-center">{authError}</p>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full h-11 rounded-xl bg-accent text-sm font-semibold text-zinc-950 transition-all hover:bg-accent/90 active:scale-[0.98] disabled:opacity-50"
            >
              {authLoading ? "Authenticating..." : "Sign In"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // ── Admin Dashboard ──
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-xs font-bold text-zinc-950">
                $
              </span>
              <span className="text-sm font-semibold tracking-tight text-zinc-100">
                GPTW Admin
              </span>
            </a>
            <span className="inline-flex h-5 items-center rounded-full bg-red-500/10 px-2 text-[10px] font-semibold uppercase tracking-wider text-red-400">
              Admin Panel
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => activeTab === "campaigns" ? fetchCampaigns() : fetchFraudBlocks()}
              className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              <HiRefresh className="h-4 w-4" />
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-20 pb-12 mx-auto max-w-[1400px] px-6">
        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Campaigns", value: total, icon: HiEye },
            { label: "Pending Review", value: pendingCount, icon: HiClock },
            { label: "Approved", value: approvedCount, icon: HiShieldCheck },
            { label: "Revenue", value: `$${(totalRevenue / 100).toFixed(2)}`, icon: HiCheck },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-white/[0.06] bg-surface p-5"
            >
              <div className="flex items-center gap-2 text-zinc-500 mb-2">
                <stat.icon className="h-4 w-4" />
                <span className="text-[11px] font-medium uppercase tracking-[0.12em]">
                  {stat.label}
                </span>
              </div>
              <div className="text-2xl font-semibold tracking-tight text-zinc-100">
                {stat.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-1 mb-6 border-b border-white/[0.06]">
          {(["campaigns", "fraud"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
                activeTab === tab
                  ? "text-accent border-accent"
                  : "text-zinc-500 border-transparent hover:text-zinc-300"
              }`}
            >
              {tab === "campaigns" ? "Campaigns" : "Fraud Protection"}
            </button>
          ))}
        </div>

        {/* ── Campaigns Tab ── */}
        {activeTab === "campaigns" && (
          <>
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-2 text-sm text-zinc-300 focus:border-accent/50 focus:outline-none"
              >
                <option value="">All Approval Status</option>
                <option value="pending_approval">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={paymentFilter}
                onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
                className="rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-2 text-sm text-zinc-300 focus:border-accent/50 focus:outline-none"
              >
                <option value="">All Payment Status</option>
                <option value="pending_payment">Pending</option>
                <option value="paid">Paid</option>
                <option value="payment_failed">Failed</option>
              </select>
            </div>

            {/* Campaign table */}
            <div className="rounded-xl border border-white/[0.06] bg-surface overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-20 text-sm text-zinc-500">
                  Loading campaigns...
                </div>
              ) : campaigns.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-sm text-zinc-500">
                  <HiSearch className="h-8 w-8 mb-3 text-zinc-700" />
                  No campaigns found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        {["Advertiser", "Ad Copy", "Budget", "Payment", "Approval", "Impressions", "Date", "Actions"].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((c) => {
                        const sBadge = STATUS_BADGES[c.approval_status] || STATUS_BADGES.pending_approval;
                        const pBadge = PAYMENT_BADGES[c.payment_status] || PAYMENT_BADGES.pending_payment;
                        return (
                          <tr
                            key={c.id}
                            className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium text-zinc-200">
                                {c.advertiser_name}
                              </div>
                              <div className="text-[11px] text-zinc-600 truncate max-w-[160px]">
                                {c.advertiser_email}
                              </div>
                            </td>
                            <td className="px-4 py-3 max-w-[200px]">
                              <div className="text-sm text-zinc-300 truncate">
                                {c.ad_text}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-zinc-200">
                              ${(c.budget_cents / 100).toFixed(2)}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${pBadge.bg} ${pBadge.text}`}>
                                {pBadge.label}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${sBadge.bg} ${sBadge.text}`}>
                                {sBadge.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-zinc-400">
                              {c.total_impressions ?? 0}
                            </td>
                            <td className="px-4 py-3 text-[11px] text-zinc-600 whitespace-nowrap">
                              {new Date(c.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => { setSelectedCampaign(c); setRejectReason(""); }}
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-300 transition-colors"
                                  title="View details"
                                >
                                  <HiEye className="h-3.5 w-3.5" />
                                </button>
                                {c.approval_status === "pending_approval" && (
                                  <>
                                    <button
                                      onClick={() => updateStatus(c.id, "approved")}
                                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                                      title="Approve"
                                    >
                                      <HiCheck className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => { setSelectedCampaign(c); setRejectReason(""); }}
                                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                                      title="Reject"
                                    >
                                      <HiX className="h-3.5 w-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {total > 20 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
                  <span className="text-[11px] text-zinc-600">
                    Page {page} of {Math.ceil(total / 20)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page <= 1}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] text-zinc-400 hover:text-zinc-200 disabled:opacity-30"
                    >
                      <HiChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page >= Math.ceil(total / 20)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] text-zinc-400 hover:text-zinc-200 disabled:opacity-30"
                    >
                      <HiChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Fraud Tab ── */}
        {activeTab === "fraud" && (
          <>
            {/* Add new block */}
            <div className="rounded-xl border border-white/[0.06] bg-surface p-6 mb-6">
              <h3 className="text-sm font-semibold text-zinc-200 mb-4 flex items-center gap-2">
                <HiShieldExclamation className="h-4 w-4 text-red-400" />
                Add Block Rule
              </h3>
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500 block mb-1.5">
                    Type
                  </label>
                  <select
                    value={newBlockType}
                    onChange={(e) => setNewBlockType(e.target.value as "ip" | "client_id")}
                    className="rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-2 text-sm text-zinc-300 focus:border-accent/50 focus:outline-none"
                  >
                    <option value="client_id">Client ID</option>
                    <option value="ip">IP Address</option>
                  </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500 block mb-1.5">
                    Value
                  </label>
                  <input
                    value={newBlockValue}
                    onChange={(e) => setNewBlockValue(e.target.value)}
                    placeholder={newBlockType === "ip" ? "192.168.1.1" : "client-uuid-here"}
                    className="block w-full rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-accent/50 focus:outline-none"
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500 block mb-1.5">
                    Reason
                  </label>
                  <input
                    value={newBlockReason}
                    onChange={(e) => setNewBlockReason(e.target.value)}
                    placeholder="Reason for blocking..."
                    className="block w-full rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-accent/50 focus:outline-none"
                  />
                </div>
                <button
                  onClick={addBlock}
                  className="h-9 rounded-lg bg-red-500/10 border border-red-500/20 px-4 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <HiBan className="h-4 w-4 inline mr-1.5" />
                  Block
                </button>
              </div>
            </div>

            {/* Block list */}
            <div className="rounded-xl border border-white/[0.06] bg-surface overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <h3 className="text-sm font-semibold text-zinc-200">
                  Active Blocks ({fraudBlocks.length})
                </h3>
              </div>

              {fraudLoading ? (
                <div className="flex items-center justify-center py-12 text-sm text-zinc-500">
                  Loading...
                </div>
              ) : fraudBlocks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-sm text-zinc-500">
                  <HiShieldCheck className="h-8 w-8 mb-3 text-emerald-500/30" />
                  No active blocks. The network is clean.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        {["Type", "Value", "Reason", "Blocked At", "Actions"].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {fraudBlocks.map((b) => (
                        <tr
                          key={b.id}
                          className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-400">
                              {b.block_type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-mono text-zinc-300">
                            {b.block_value}
                          </td>
                          <td className="px-4 py-3 text-sm text-zinc-400 max-w-[300px] truncate">
                            {b.reason}
                          </td>
                          <td className="px-4 py-3 text-[11px] text-zinc-600 whitespace-nowrap">
                            {new Date(b.created_at).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => removeBlock(b.block_type, b.block_value)}
                              className="inline-flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-300 transition-colors"
                            >
                              <HiX className="h-3 w-3" />
                              Unblock
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-zinc-900 p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-lg font-semibold text-zinc-100">
                  Campaign Details
                </h3>
                <p className="text-[11px] text-zinc-600 font-mono mt-1">
                  {selectedCampaign.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedCampaign(null)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-300"
              >
                <HiX className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              {[
                ["Advertiser", selectedCampaign.advertiser_name],
                ["Email", selectedCampaign.advertiser_email],
                ["Ad Copy", selectedCampaign.ad_text],
                ["Click URL", selectedCampaign.click_url],
                ["Budget", `$${(selectedCampaign.budget_cents / 100).toFixed(2)}`],
                ["Impressions", String(selectedCampaign.total_impressions ?? 0)],
                ["Clicks", String(selectedCampaign.total_clicks ?? 0)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-start gap-4">
                  <span className="text-sm text-zinc-500 shrink-0">{label}</span>
                  <span className="text-sm text-zinc-200 text-right break-all">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {selectedCampaign.rejection_reason && (
              <div className="mt-4 rounded-lg bg-red-500/5 border border-red-500/10 px-3 py-2">
                <span className="text-[11px] font-medium uppercase text-red-400">Rejection Reason</span>
                <p className="text-sm text-zinc-300 mt-1">
                  {selectedCampaign.rejection_reason}
                </p>
              </div>
            )}

            {/* Actions */}
            {selectedCampaign.approval_status === "pending_approval" && (
              <div className="mt-6 space-y-3">
                <div>
                  <label className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500 block mb-1.5">
                    Rejection Reason (optional)
                  </label>
                  <input
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g. Ad copy violates content policy..."
                    className="block w-full rounded-lg border border-white/[0.08] bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-accent/50 focus:outline-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => updateStatus(selectedCampaign.id, "approved")}
                    disabled={actionLoading}
                    className="flex-1 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                  >
                    <HiCheck className="h-4 w-4 inline mr-1" />
                    Approve
                  </button>
                  <button
                    onClick={() => updateStatus(selectedCampaign.id, "rejected", rejectReason)}
                    disabled={actionLoading}
                    className="flex-1 h-10 rounded-lg bg-red-500/10 border border-red-500/20 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                  >
                    <HiX className="h-4 w-4 inline mr-1" />
                    Reject
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
