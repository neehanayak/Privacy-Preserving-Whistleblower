import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "../components/Navbar";
import {
  BarChart3,
  Activity,
  Calendar,
  Clock,
  FileText,
  AlertTriangle,
  RefreshCw,
  Info,
  Shield,
  Zap,
} from "lucide-react";

// --- UTILITY FUNCTIONS ---
function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}

// --- PASTEL GLASS COMPONENTS ---
const Card: React.FC<
  React.ComponentProps<typeof motion.div> & { className?: string }
> = ({ children, className, ...props }) => (
  <motion.div
    className={cn(
      "glass-card rounded-3xl p-6 bg-emerald-50/80 border border-emerald-100/80",
      className
    )}
    {...props}
  >
    {children}
  </motion.div>
);


const CardTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <h3
    className={cn(
      "text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-emerald-900 via-lime-800 to-amber-800",
      className
    )}
  >
    {children}
  </h3>
);


const mockStatsData = {
  totalReports: 1247,
  currentEpoch: Math.floor(Date.now() / 1000 / 86400),
  pendingReports: 120,
  reviewedReports: 1000,
  archivedReports: 127,
  reportsToday: 12,
  contractMode: true,
};

const contractManager = {
  isUsingContract: () => true,
  getAdapter: () => ({
    getContractState: async () => ({
      currentEpoch: mockStatsData.currentEpoch,
    }),
    listReports: async () => [],
  }),
};

const syncManager = {
  getProvider: () => ({
    listReports: async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const reports = [];
      for (let i = 0; i < mockStatsData.totalReports; i++) {
        let status: "pending" | "reviewed" | "archived" = "reviewed";
        if (i < mockStatsData.pendingReports) status = "pending";
        else if (
          i <
          mockStatsData.pendingReports + mockStatsData.reviewedReports
        )
          status = "reviewed";
        else status = "archived";

        reports.push({
          status,
          timestamp: Date.now() - Math.floor(Math.random() * 30 * 86400 * 1000),
        });
      }
      return reports;
    },
  }),
};


interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  color,
}) => {
  const isPositive =
    change.startsWith("+") ||
    change.includes("Active") ||
    change.includes("On-chain");
  const isNegative = change.startsWith("-");
  const changeClasses = isPositive
    ? "text-emerald-700"
    : isNegative
    ? "text-rose-700"
    : "text-[#445547]";

  return (
    <Card className="p-6 h-full flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div
          className={cn(
            `w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg`
          )}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        <p className="text-xs sm:text-sm font-medium text-[#445547]/90 text-right">
          {title}
        </p>
      </div>

      <div className="mt-auto">
        {/* value -> gradient text */}
        <div className="text-2xl sm:text-3xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-emerald-900 via-lime-800 to-amber-800">
          {value}
        </div>
        <div className={cn("text-xs sm:text-sm flex items-center", changeClasses)}>
          {isPositive && <span className="mr-1">▲</span>}
          {isNegative && <span className="mr-1">▼</span>}
          <span className="text-[#445547]/70 mr-1">|</span>
          <span className="font-medium">{change}</span>
        </div>
      </div>
    </Card>
  );
};

// --- PROGRESS BAR (SAGE + BEIGE) ---
interface ProgressBarProps {
  label: string;
  percentage: number;
  color: "gray" | "green" | "yellow" | "brand" | "red";
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  percentage,
  color = "gray",
}) => {
  const colorClasses = {
    gray: "bg-[#8B9D83]/70",
    green: "bg-emerald-500/90",
    yellow: "bg-amber-500/90",
    brand: "bg-lime-500/90",
    red: "bg-rose-500/90",
  };

  return (
    <div>
      <div className="flex justify-between text-xs sm:text-sm mb-1">
        <span className="text-[#445547]/90">{label}</span>
        <span className="text-emerald-950 font-medium">{percentage}%</span>
      </div>
      <div className="w-full bg-emerald-100/60 rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`${colorClasses[color]} h-2 rounded-full shadow-sm`}
        />
      </div>
    </div>
  );
};


export const StatisticsPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalReports: 0,
    currentEpoch: 0,
    pendingReports: 0,
    reviewedReports: 0,
    archivedReports: 0,
    reportsToday: 0,
    contractMode: false,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const contractAdapter = contractManager.getAdapter();
      const contractState = await contractAdapter.getContractState();

      const mockReports = await syncManager.getProvider().listReports();
      const reports = mockReports.length > 0 ? mockReports : [];

      const contractMode = contractManager.isUsingContract();

      const currentEpoch = contractMode
        ? contractState.currentEpoch
        : Math.floor(Date.now() / 1000 / 86400);

      const todayReports = reports.filter((r: any) => {
        const reportEpoch = Math.floor(r.timestamp / 1000 / 86400);
        return reportEpoch === currentEpoch;
      });

      const pending = reports.filter((r: any) => r.status === "pending").length;
      const reviewed = reports.filter(
        (r: any) => r.status === "reviewed"
      ).length;
      const archived = reports.filter(
        (r: any) => r.status === "archived"
      ).length;

      setStats({
        totalReports: reports.length,
        currentEpoch,
        pendingReports: pending,
        reviewedReports: reviewed,
        archivedReports: archived,
        reportsToday: todayReports.length,
        contractMode,
      });
      setLastUpdated(Date.now());
    } catch (error) {
      console.error("Failed to load statistics:", error);
      setError(
        "Failed to load statistics. Check network or local configuration."
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const getTimeRemaining = () => {
    const now = Date.now();
    const epochStart = Math.floor(now / 1000 / 86400) * 86400 * 1000;
    const epochEnd = epochStart + 86400 * 1000;
    const remaining = epochEnd - now;
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m remaining`;
  };

  const getStatusPercentages = () => {
    const total = stats.totalReports || 1;
    return {
      pending: Math.round((stats.pendingReports / total) * 100),
      reviewed: Math.round((stats.reviewedReports / total) * 100),
      archived: Math.round((stats.archivedReports / total) * 100),
    };
  };

  const percentages = getStatusPercentages();

  return (
    <div className="min-h-screen animated-gradient-bg text-[#233127] font-outfit relative overflow-hidden">
      {/* Floating pastel blobs */}
      <div className="pointer-events-none fixed inset-0">
        <div className="floating-blob-1 absolute -top-40 right-[-12rem] w-[26rem] h-[26rem] bg-emerald-300/26 blur-3xl rounded-full" />
        <div className="floating-blob-2 absolute -bottom-40 left-[-12rem] w-[28rem] h-[28rem] bg-lime-300/26 blur-3xl rounded-full" />
      </div>

      <Navbar showHomeButton={true} />

      <div className="relative z-10 pt-32 pb-16 px-4 max-w-6xl mx-auto">
        {/* Header with sage/amber gradient */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-4xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-900 via-lime-800 to-amber-800">
            Platform Statistics
          </h1>
          <p className="text-sm sm:text-base text-[#445547]/90 max-w-2xl mx-auto">
            Privacy-preserving insights into system usage and report status.
          </p>
          {lastUpdated && (
            <p className="text-xs sm:text-sm text-[#445547]/70 mt-2">
              Last updated: {new Date(lastUpdated).toLocaleTimeString()}
            </p>
          )}
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 alert-box alert-error rounded-xl max-w-lg mx-auto"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-xs sm:text-sm">{error}</span>
            </div>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
          <StatCard
            title="Total Reports"
            value={stats.totalReports.toLocaleString()}
            change={stats.contractMode ? "On-chain Mode" : "Local Mode"}
            icon={FileText}
            color="from-emerald-500 to-lime-500"
          />
          <StatCard
            title="Reports Today"
            value={stats.reportsToday.toString()}
            change="Rate Limited"
            icon={Activity}
            color="from-teal-500 to-emerald-500"
          />
          <StatCard
            title="Current Epoch"
            value={stats.currentEpoch.toString()}
            change={getTimeRemaining()}
            icon={Calendar}
            color="from-lime-500 to-amber-500"
          />
          <StatCard
            title="Pending Review"
            value={stats.pendingReports.toLocaleString()}
            change={`${percentages.pending}% of total`}
            icon={Clock}
            color="from-amber-500 to-orange-500"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Report Status Distribution */}
          <motion.div
            className="md:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="p-6 sm:p-8 h-full">
              <CardTitle className="mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-700" />
                <span>Report Status Distribution</span>
              </CardTitle>
              <div className="space-y-4">
                <ProgressBar
                  label="Reviewed/Verified"
                  percentage={percentages.reviewed}
                  color="green"
                />
                <ProgressBar
                  label="Pending Review"
                  percentage={percentages.pending}
                  color="yellow"
                />
                <ProgressBar
                  label="Archived"
                  percentage={percentages.archived}
                  color="gray"
                />
                <p className="text-[0.7rem] sm:text-xs text-[#445547]/70 mt-4">
                  Total Reports: {stats.totalReports.toLocaleString()}
                </p>
              </div>
            </Card>
          </motion.div>

          {/* System Health */}
          <motion.div
            className="md:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="p-6 sm:p-8 h-full">
              <CardTitle className="mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-700" />
                <span>System Health</span>
              </CardTitle>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
                  <span className="text-xs sm:text-sm text-[#445547]/90 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    Smart Contract Mode
                  </span>
                  <span
                    className={`text-xs sm:text-sm font-medium ${
                      stats.contractMode ? "text-emerald-700" : "text-amber-700"
                    }`}
                  >
                    {stats.contractMode ? "Active (On-chain)" : "Local (Mock)"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
                  <span className="text-xs sm:text-sm text-[#445547]/90">
                    Epoch Duration
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-emerald-950">
                    24 Hours
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
                  <span className="text-xs sm:text-sm text-[#445547]/90">
                    Rate Limit
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-emerald-950">
                    1 per Identity/Epoch
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs sm:text-sm text-[#445547]/90">
                    Privacy Level
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-lime-700">
                    Maximum (ZK-Proofs)
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Info & Refresh */}
        <motion.div
          className="mt-8 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="alert-box alert-info rounded-xl">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                {/* About title -> gradient */}
                <h3 className="font-semibold text-sm sm:text-base bg-clip-text text-transparent bg-gradient-to-r from-teal-700 to-emerald-700">
                  About These Statistics
                </h3>
                <p className="text-xs sm:text-sm text-[#445547]/90 mt-1">
                  Statistics are aggregated using zero-knowledge principles.
                  **No individual report details or reporter identities are ever
                  exposed.** Data sources:{" "}
                  {stats.contractMode
                    ? "Smart Contract Events & Sync Provider."
                    : "Local Mock Data & Sync Provider."}
                </p>
              </div>
            </div>
          </div>

          {/* Refresh button */}
          <div className="flex justify-center">
            <button
              onClick={loadStats}
              disabled={isRefreshing}
              aria-busy={isRefreshing}
              aria-label="Refresh statistics"
              title="Refresh statistics"
              className="btn-secondary-glass inline-flex items-center px-4 py-2 rounded-xl text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRefreshing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin text-emerald-700" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              {isRefreshing ? "Refreshing Data..." : "Refresh Statistics"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StatisticsPage;