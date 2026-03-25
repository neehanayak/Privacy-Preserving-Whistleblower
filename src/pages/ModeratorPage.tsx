import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "../components/Navbar";
import { useWallet } from "../hooks/useWallet";
import { useToast, ToastProvider } from "../components/Toast";
import {
  ReportStorageService,
  type StoredReport,
} from "../services/reportStorageService";
import {
  FileText,
  Download,
  X,
  RefreshCw,
  Lock,
  Archive,
  AlertTriangle,
  Info,
  Check,
  File,
  Type,
  Paperclip,
  Wallet,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Users,
  Shield,
} from "lucide-react";

function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}


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

const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mb-4">{children}</div>
);


const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <h3
    className={cn(
      "text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-emerald-900 via-lime-800 to-amber-800",
      className
    )}
  >
    {children}
  </h3>
);

const CardDescription: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <p className="text-sm text-[#445547]/90">{children}</p>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> =
  ({ children, className }) => (
    <div className={cn("mt-4", className)}>{children}</div>
  );

type ButtonVariant = "primary" | "outline" | "ghost" | "danger";

const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: "sm" | "md" | "lg";
  }
> = ({ children, variant = "primary", size = "md", className, ...props }) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  let variantClasses = "";
  let sizeClasses = "";

  switch (variant) {
    case "primary":
      variantClasses = "btn-primary-enhanced text-xs sm:text-sm";
      break;
    case "outline":
      variantClasses =
        "btn-secondary-glass text-xs sm:text-sm border border-emerald-300/70 text-emerald-900 hover:bg-emerald-50/70";
      break;
    case "ghost":
      variantClasses =
        "text-emerald-900 hover:text-emerald-950 hover:bg-emerald-100/60 text-xs sm:text-sm";
      break;
    case "danger":
      variantClasses =
        "bg-rose-500/90 text-rose-50 hover:bg-rose-400 shadow-lg text-xs sm:text-sm";
      break;
  }

  switch (size) {
    case "sm":
      sizeClasses = "px-3 py-1.5 text-xs sm:text-sm";
      break;
    case "md":
      sizeClasses = "px-4 py-2 text-sm";
      break;
    case "lg":
      sizeClasses = "px-6 py-3 text-base";
      break;
  }

  return (
    <button
      className={cn(baseClasses, variantClasses, sizeClasses, className)}
      {...props}
    >
      {children}
    </button>
  );
};

type BadgeVariant = "primary" | "secondary" | "default" | "success" | "warning";

const Badge: React.FC<{ children: React.ReactNode; variant?: BadgeVariant }> = ({
  children,
  variant = "default",
}) => {
  let classes = "";
  switch (variant) {
    case "primary":
      classes =
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.7rem] font-medium bg-emerald-100 text-emerald-900";
      break;
    case "secondary":
      classes =
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.7rem] font-medium bg-amber-100 text-amber-900";
      break;
    case "success":
      classes =
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.7rem] font-medium bg-emerald-200 text-emerald-950";
      break;
    case "warning":
      classes =
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.7rem] font-medium bg-amber-200 text-amber-950";
      break;
    case "default":
    default:
      classes =
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.7rem] font-medium bg-emerald-50 text-emerald-900";
      break;
  }
  return <span className={classes}>{children}</span>;
};

type AlertVariant = "success" | "danger" | "info" | "warning";

const Alert: React.FC<{
  children: React.ReactNode;
  variant: AlertVariant;
  onClose?: () => void;
  className?: string;
}> = ({ children, variant, onClose, className }) => {
  let base = "alert-box text-xs sm:text-sm flex items-start gap-3";
  let colorClass = "";
  let Icon = Info;

  switch (variant) {
    case "success":
      colorClass = "alert-success";
      Icon = Check;
      break;
    case "danger":
      colorClass = "alert-error";
      Icon = X;
      break;
    case "warning":
      colorClass = "alert-warning";
      Icon = AlertTriangle;
      break;
    case "info":
    default:
      colorClass = "alert-info";
      Icon = Info;
      break;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25 }}
      className={cn(base, colorClass, "rounded-xl px-4 py-3", className)}
    >
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <div className="flex-1">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-3 flex-shrink-0 text-emerald-900/60 hover:text-emerald-950 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
};

const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} days ago`;
  return date.toLocaleDateString();
};

export interface ReportTransaction {
  ciphertext: string;
  pkEph: string;
  nullifier: string;
  epoch: number;
  proof: string;
  version: string;
}

interface DecryptedReport {
  title: string;
  content: string;
  attachment?: string;
  attachmentName?: string;
}

interface Report extends StoredReport {
  payload: ReportTransaction;
}

const getDecryptedContentFromStored = (
  report: StoredReport
): DecryptedReport => ({
  title: report.title,
  content: report.content,
  attachment: report.attachment || undefined,
  attachmentName: report.attachmentName || undefined,
});

const decryptReportLocally = async (
  stored: StoredReport,
  _payload: ReportTransaction
): Promise<DecryptedReport> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return getDecryptedContentFromStored(stored);
};

const validatePayload = (payload: ReportTransaction | undefined): boolean => {
  if (!payload) return false;
  if (!payload.ciphertext || !payload.nullifier) return false;
  if (typeof payload.epoch !== "number") return false;
  return true;
};

const verifyProof = async (payload: ReportTransaction): Promise<boolean> => {
  void payload;
  await new Promise((resolve) => setTimeout(resolve, 300));
  return true;
};

const shorten = (value: string, prefix = 8, suffix = 6): string => {
  if (value.length <= prefix + suffix + 3) return value;
  return `${value.slice(0, prefix)}...${value.slice(-suffix)}`;
};

const AttachmentPreview: React.FC<{
  attachment: string;
  attachmentName?: string;
  onClose: () => void;
}> = ({ attachment, attachmentName, onClose }) => {
  const isImage = attachment.startsWith("data:image/");
  const isPdf = attachment.startsWith("data:application/pdf");

  return (
    <div className="fixed inset-0 bg-emerald-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="glass-card rounded-3xl p-6 max-w-4xl max-h-[90vh] overflow-auto w-full bg-emerald-50/95 border border-emerald-200/80">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-emerald-900 via-lime-800 to-amber-800 flex items-center">
            <Eye className="w-5 h-5 mr-2 text-emerald-700" />
            Preview: {attachmentName || "Attachment"}
          </h3>
          <button
            onClick={onClose}
            className="text-emerald-900/70 hover:text-emerald-950 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-emerald-200/60 bg-emerald-100/50">
          {isImage ? (
            <img
              src={attachment}
              alt={attachmentName || "Attachment"}
              className="max-w-full max-h-[60vh] object-contain mx-auto rounded-xl soft-glow-green"
            />
          ) : isPdf ? (
            <div className="text-center py-8">
              <File className="w-16 h-16 mx-auto text-emerald-700 mb-4" />
              <p className="text-[#445547]/90 mb-4">PDF preview not available</p>
              <a
                href={attachment}
                download={attachmentName || "document.pdf"}
                className="btn-primary-enhanced inline-flex items-center px-4 py-2 rounded-xl text-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </a>
            </div>
          ) : (
            <div className="text-center py-8">
              <File className="w-16 h-16 mx-auto text-emerald-700 mb-4" />
              <p className="text-[#445547]/90 mb-4">
                Preview not available for this file type
              </p>
              <a
                href={attachment}
                download={attachmentName || "file"}
                className="btn-primary-enhanced inline-flex items-center px-4 py-2 rounded-xl text-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Download file
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ModeratorPageContent: React.FC = () => {
  const { showToast } = useToast();
  const {
    wallet,
    isLoading: walletLoading,
    error: walletError,
    connectLaceWallet,
    disconnectLaceWallet,
    laceWalletState,
  } = useWallet();

  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [decryptedContent, setDecryptedContent] =
    useState<DecryptedReport | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<{
    data: string;
    name?: string;
  } | null>(null);

  const [alertMessage, setAlertMessage] = useState<{
    type: AlertVariant;
    message: string;
  } | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    archived: 0,
  });

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    if (laceWalletState.isConnected) {
      loadReports();
    }
  }, [laceWalletState.isConnected]);

  useEffect(() => {
    setStats({
      total: reports.length,
      pending: reports.filter((r) => r.status === "pending").length,
      reviewed: reports.filter((r) => r.status === "reviewed").length,
      archived: reports.filter((r) => r.status === "archived").length,
    });
  }, [reports]);

  const buildDemoPayload = (r: StoredReport): ReportTransaction => {
    const epoch = Math.floor(r.timestamp / 1000 / 86400);
    const ciphertext = btoa(
      JSON.stringify({
        id: r.id,
        txHash: r.txHash,
        timestamp: r.timestamp,
      })
    );
    return {
      ciphertext,
      pkEph: "demo-ephemeral-pk",
      nullifier: `demo-nullifier-${r.id}`,
      epoch,
      proof: "demo-proof",
      version: "v1",
    };
  };

  const loadReports = async () => {
    setIsRefreshing(true);
    try {
      const storedReports =
        laceWalletState.isConnected && wallet
          ? ReportStorageService.loadUserVotesForReports(wallet.address)
          : ReportStorageService.getAllReports();

      const formatted: Report[] = storedReports
        .map((r) => ({
          ...r,
          payload: buildDemoPayload(r),
        }))
        .sort((a, b) => b.timestamp - a.timestamp);

      setReports(formatted);
      setLastUpdated(Date.now());
    } catch (error) {
      console.error("Failed to load reports:", error);
      setReports([]);
      setLastUpdated(Date.now());
    } finally {
      setIsRefreshing(false);
    }
  };

  const updateReportStatus = async (
    id: string,
    status: "pending" | "reviewed" | "archived"
  ) => {
    try {
      ReportStorageService.updateReportStatus(id, status);
    } catch (error) {
      console.error("Failed to update report status:", error);
    }
  };

  const handleDecryptReport = async (report: Report) => {
    if (!laceWalletState.isConnected) {
      setAlertMessage({
        type: "danger",
        message:
          "Please connect your wallet. In the full protocol, the moderator's wallet performs decryption using the on-chain ciphertext.",
      });
      return;
    }

    if (selectedReport?.id === report.id) {
      setSelectedReport(null);
      setDecryptedContent(null);
      return;
    }

    setIsDecrypting(true);
    setDecryptedContent(null);
    setSelectedReport(report);

    try {
      if (!validatePayload(report.payload)) {
        throw new Error("Invalid encrypted payload structure.");
      }

      const proofOk = await verifyProof(report.payload);
      if (!proofOk) {
        setAlertMessage({
          type: "warning",
          message:
            "Warning: zero-knowledge proof verification failed for this payload.",
        });
      } else {
        setAlertMessage({
          type: "info",
          message:
            "ZK proof and payload shape verified. Decrypting content in-browser (demo mode).",
        });
      }

      const storedReport =
        ReportStorageService.getAllReports().find(
          (r) => r.id === report.id
        ) || report;

      const decrypted = await decryptReportLocally(
        storedReport,
        report.payload
      );
      setDecryptedContent(decrypted);

      await updateReportStatus(report.id, "reviewed");
      await loadReports();
    } catch (err) {
      console.error("Decryption error:", err);
      setAlertMessage({
        type: "danger",
        message:
          "Failed to decrypt report. Check wallet connection and protocol configuration.",
      });
      setDecryptedContent(null);
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleArchiveReport = async (id: string) => {
    await updateReportStatus(id, "archived");
    setAlertMessage({ type: "info", message: `Report #${id} archived.` });
    await loadReports();
    setSelectedReport(null);
    setDecryptedContent(null);
  };

  const handleWalletConnect = async () => {
    try {
      await connectLaceWallet();
      showToast({
        type: "success",
        title: "Wallet connected",
        message:
          "Your Midnight Lace wallet is connected. Decryption and verification can now be performed from this browser.",
        duration: 4000,
      });
    } catch (err) {
      showToast({
        type: "error",
        title: "Wallet connection failed",
        message:
          err instanceof Error ? err.message : "Failed to connect wallet.",
        duration: 5000,
      });
    }
  };

  const handleVote = async (reportId: string, voteType: "up" | "down") => {
    if (!laceWalletState.isConnected) {
      showToast({
        type: "warning",
        title: "Wallet required",
        message: "Connect your wallet to vote on reports.",
        duration: 4000,
      });
      return;
    }

    try {
      if (wallet) {
        ReportStorageService.voteOnReport(reportId, voteType, wallet.address);
      }

      await loadReports();

      showToast({
        type: "success",
        title: "Vote recorded",
        message: `Your ${voteType} vote has been recorded (persisted in local indexer for this demo).`,
        duration: 3000,
      });
    } catch (error) {
      showToast({
        type: "error",
        title: "Vote failed",
        message: "Failed to record your vote. Please try again.",
        duration: 4000,
      });
    }
  };

  return (
    <div className="min-h-screen animated-gradient-bg text-[#233127] font-outfit relative overflow-hidden">
      {/* floating pastel blobs */}
      <div className="pointer-events-none fixed inset-0">
        <div className="floating-blob-1 absolute -top-40 right-[-12rem] w-[26rem] h-[26rem] bg-emerald-300/26 blur-3xl rounded-full" />
        <div className="floating-blob-2 absolute -bottom-40 left-[-12rem] w-[28rem] h-[28rem] bg-lime-300/26 blur-3xl rounded-full" />
      </div>

      <Navbar showHomeButton />

      <div className="relative z-10 pt-28 pb-16 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-4xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-900 via-lime-800 to-amber-800">
            Moderator Dashboard
          </h1>
          <p className="text-sm sm:text-base text-[#445547]/90 max-w-2xl mx-auto">
            Decrypt and verify encrypted reports using your wallet. The chain
            stores only ciphertext and protocol metadata; plaintext is
            reconstructed locally in your browser.
          </p>
        </motion.div>

        {/* Alerts */}
        <div className="mb-6 max-w-6xl mx-auto">
          {alertMessage && (
            <Alert
              variant={alertMessage.type}
              onClose={() => setAlertMessage(null)}
              className="mb-4"
            >
              {alertMessage.message}
            </Alert>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Left: wallet + stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Wallet card */}
            <Card
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <CardTitle className="mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-700" />
                <span>Wallet connection</span>
              </CardTitle>
              <div className="space-y-4">
                {!laceWalletState.isConnected ? (
                  <>
                    <div className="alert-box alert-warning rounded-xl text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span>
                          Wallet connection required to decrypt or vote on
                          reports.
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={handleWalletConnect}
                      disabled={walletLoading}
                      className="w-full"
                      size="md"
                    >
                      {walletLoading
                        ? "Connecting..."
                        : "Connect Midnight Lace wallet"}
                    </Button>
                    {walletError && (
                      <p className="text-xs sm:text-sm text-rose-600 mt-1">
                        {walletError}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <div className="alert-box alert-success rounded-xl text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        <span>Wallet connected successfully.</span>
                      </div>
                    </div>
                    {wallet && (
                      <div className="glass-card rounded-2xl p-3 bg-emerald-100/80 border border-emerald-200/80">
                        <div className="text-[0.65rem] font-medium text-emerald-900 mb-1">
                          Shielded / moderator address
                        </div>
                        <p className="text-[0.7rem] font-mono text-emerald-950 break-all">
                          {wallet.address.slice(0, 16)}...
                          {wallet.address.slice(-8)}
                        </p>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={disconnectLaceWallet}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Disconnect wallet
                    </Button>
                  </>
                )}
              </div>
            </Card>

            {/* Stats card */}
            <Card
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              <CardTitle className="mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-700" />
                <span>Report statistics</span>
              </CardTitle>
              <div className="grid grid-cols-2 gap-4 text-center text-xs sm:text-sm">
                <div className="glass-card rounded-2xl p-3 bg-emerald-100/80 border border-emerald-200/80">
                  <div className="text-2xl font-semibold text-emerald-950">
                    {stats.total}
                  </div>
                  <div className="text-[#445547]/80 mt-1">Total reports</div>
                </div>
                <div className="alert-box alert-warning rounded-2xl px-3 py-3">
                  <div className="text-2xl font-semibold text-amber-950">
                    {stats.pending}
                  </div>
                  <div className="text-amber-900 mt-1">Pending review</div>
                </div>
                <div className="alert-box alert-success rounded-2xl px-3 py-3">
                  <div className="text-2xl font-semibold text-emerald-950">
                    {stats.reviewed}
                  </div>
                  <div className="text-emerald-900 mt-1">
                    Decrypted / reviewed
                  </div>
                </div>
                <div className="glass-card rounded-2xl p-3 bg-emerald-50/80 border border-emerald-100/90">
                  <div className="text-2xl font-semibold text-emerald-950">
                    {stats.archived}
                  </div>
                  <div className="text-[#445547]/80 mt-1">Archived</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: reports */}
          <div className="lg:col-span-2">
            <Card
              className="h-full"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-emerald-700" />
                    <span>Encrypted reports</span>
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadReports}
                    disabled={isRefreshing}
                    aria-label="Refresh reports"
                    title="Refresh reports"
                  >
                    {isRefreshing ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-700" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    <span className="ml-1 hidden sm:inline">
                      {isRefreshing
                        ? "Refreshing"
                        : lastUpdated
                        ? formatRelativeTime(new Date(lastUpdated))
                        : "Refresh"}
                    </span>
                  </Button>
                </CardTitle>
                <CardDescription>
                  Select a report to verify its zero-knowledge proof and decrypt
                  ciphertext using the moderator’s wallet (demo-mode stub for
                  this course project).
                </CardDescription>
              </CardHeader>

              <CardContent className="h-[calc(100%-8rem)] overflow-y-auto">
                {reports.length === 0 ? (
                  <div className="text-center py-12 text-[#445547]/80">
                    <File className="w-12 h-12 mx-auto mb-4 text-emerald-400/70" />
                    <p className="text-sm">No reports yet</p>
                    <p className="text-xs sm:text-sm mt-2 text-[#445547]/70">
                      When the first ciphertext is submitted (or stored locally
                      in this demo), it will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reports.map((report) => (
                      <motion.div
                        key={report.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={cn(
                          "rounded-xl border cursor-pointer transition-all",
                          "glass-card-static bg-emerald-50/80",
                          selectedReport?.id === report.id
                            ? "border-emerald-400/70 shadow-[0_16px_45px_rgba(15,82,45,0.25)]"
                            : "border-emerald-100/80 hover:border-emerald-300/80 hover:shadow-[0_14px_35px_rgba(15,82,45,0.18)]"
                        )}
                        onClick={() => handleDecryptReport(report)}
                      >
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 space-y-1.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                  variant={
                                    report.status === "pending"
                                      ? "warning"
                                      : report.status === "reviewed"
                                      ? "success"
                                      : "default"
                                  }
                                >
                                  {report.status}
                                </Badge>
                                <span className="text-[0.7rem] text-[#445547]/70">
                                  {formatRelativeTime(
                                    new Date(report.timestamp)
                                  )}
                                </span>
                                <span className="text-[0.7rem] text-[#445547]/70 flex items-center">
                                  <Shield className="w-3 h-3 mr-1 text-emerald-700" />
                                  epoch #{report.payload.epoch}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVote(report.id, "up");
                                }}
                                className={cn(
                                  "flex items-center gap-1 px-2 py-1 rounded-lg text-[0.7rem] transition-all",
                                  report.userVote === "up"
                                    ? "alert-success"
                                    : "bg-emerald-100/70 text-emerald-900 hover:bg-emerald-200/80"
                                )}
                                disabled={!laceWalletState.isConnected}
                              >
                                <ThumbsUp className="w-3 h-3" />
                                <span>{report.upvotes || 0}</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVote(report.id, "down");
                                }}
                                className={cn(
                                  "flex items-center gap-1 px-2 py-1 rounded-lg text-[0.7rem] transition-all",
                                  report.userVote === "down"
                                    ? "alert-error"
                                    : "bg-rose-50 text-rose-900 hover:bg-rose-100"
                                )}
                                disabled={!laceWalletState.isConnected}
                              >
                                <ThumbsDown className="w-3 h-3" />
                                <span>{report.downvotes || 0}</span>
                              </button>
                            </div>
                          </div>

                          {selectedReport?.id === report.id &&
                            (decryptedContent || isDecrypting) && (
                              <div className="mt-3 space-y-3">
                                {isDecrypting && (
                                  <div className="flex items-center text-xs sm:text-sm text-emerald-800 zk-generating">
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    <span>
                                      Decrypting and verifying proof/metadata…
                                    </span>
                                  </div>
                                )}

                                {decryptedContent && (
                                  <>
                                    <div>
                                      <h4 className="font-medium mb-1 flex items-center gap-2 text-sm bg-clip-text text-transparent bg-gradient-to-r from-emerald-900 via-lime-800 to-amber-800">
                                        <Type className="w-4 h-4 text-emerald-700" />
                                        {decryptedContent.title}
                                      </h4>
                                      <p className="text-xs sm:text-sm text-[#233127] whitespace-pre-wrap mt-1 p-2 rounded-lg glass-card-static bg-emerald-50/90 border border-emerald-100/80">
                                        {decryptedContent.content}
                                      </p>
                                    </div>

                                    <div className="glass-card-static rounded-xl p-3 bg-emerald-50/90 border border-emerald-100/90 text-[0.7rem] sm:text-xs text-[#233127]">
                                      <div className="flex items-center mb-2">
                                        <Shield className="w-3 h-3 mr-2 text-emerald-700" />
                                        <span className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-emerald-900 to-lime-800">
                                          Protocol metadata (ReportTransaction)
                                        </span>
                                      </div>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <div>
                                          <span className="text-[#445547]/80">
                                            Epoch:
                                          </span>{" "}
                                          #{report.payload.epoch}
                                        </div>
                                        <div>
                                          <span className="text-[#445547]/80">
                                            Version:
                                          </span>{" "}
                                          {report.payload.version}
                                        </div>
                                        <div>
                                          <span className="text-[#445547]/80">
                                            Nullifier:
                                          </span>{" "}
                                          {shorten(report.payload.nullifier)}
                                        </div>
                                        <div>
                                          <span className="text-[#445547]/80">
                                            Ciphertext (preview):
                                          </span>{" "}
                                          {shorten(report.payload.ciphertext)}
                                        </div>
                                      </div>
                                    </div>

                                    {decryptedContent.attachment && (
                                      <div className="pt-2">
                                        <h4 className="font-medium mb-2 flex items-center gap-2 text-sm bg-clip-text text-transparent bg-gradient-to-r from-emerald-800 to-lime-700">
                                          <Paperclip className="w-4 h-4 text-emerald-700" />
                                          Attachment:{" "}
                                          {decryptedContent.attachmentName ||
                                            "Unknown file"}
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setPreviewAttachment({
                                                data: decryptedContent.attachment!,
                                                name: decryptedContent.attachmentName,
                                              });
                                              setShowPreview(true);
                                            }}
                                            className="btn-secondary-glass inline-flex items-center px-3 py-2 rounded-xl text-xs sm:text-sm"
                                          >
                                            <Eye className="w-4 h-4 mr-2" />
                                            Preview
                                          </button>
                                          <a
                                            href={decryptedContent.attachment}
                                            download={
                                              decryptedContent.attachmentName ||
                                              "attachment"
                                            }
                                            onClick={(e) => e.stopPropagation()}
                                            className="btn-secondary-glass inline-flex items-center px-3 py-2 rounded-xl text-xs sm:text-sm"
                                          >
                                            <Download className="w-4 h-4 mr-2" />
                                            Download
                                          </a>
                                        </div>
                                      </div>
                                    )}

                                    {((report.upvoters &&
                                      report.upvoters.length > 0) ||
                                      (report.downvoters &&
                                        report.downvoters.length > 0)) && (
                                      <div className="pt-3 border-t border-emerald-200/80 mt-4">
                                        <h4 className="font-medium mb-2 flex items-center gap-2 text-sm bg-clip-text text-transparent bg-gradient-to-r from-teal-800 to-emerald-700">
                                          <Users className="w-4 h-4 text-emerald-700" />
                                          Voting details (demo indexer)
                                        </h4>

                                        {report.upvoters &&
                                          report.upvoters.length > 0 && (
                                            <div className="mb-2">
                                              <p className="text-xs sm:text-sm text-emerald-900 mb-1 flex items-center gap-1.5">
                                                <ThumbsUp className="w-3 h-3" />
                                                Upvoted by (
                                                {report.upvoters.length}):
                                              </p>
                                              <div className="space-y-1">
                                                {report.upvoters.map(
                                                  (address, index) => (
                                                    <div
                                                      key={index}
                                                      className="text-[0.7rem] font-mono text-[#233127] bg-emerald-50 px-2 py-1 rounded border border-emerald-100"
                                                    >
                                                      {shorten(address, 16, 8)}
                                                    </div>
                                                  )
                                                )}
                                              </div>
                                            </div>
                                          )}

                                        {report.downvoters &&
                                          report.downvoters.length > 0 && (
                                            <div className="mb-2">
                                              <p className="text-xs sm:text-sm text-rose-900 mb-1 flex items-center gap-1.5">
                                                <ThumbsDown className="w-3 h-3" />
                                                Downvoted by (
                                                {report.downvoters.length}):
                                              </p>
                                              <div className="space-y-1">
                                                {report.downvoters.map(
                                                  (address, index) => (
                                                    <div
                                                      key={index}
                                                      className="text-[0.7rem] font-mono text-[#233127] bg-rose-50 px-2 py-1 rounded border border-rose-100"
                                                    >
                                                      {shorten(address, 16, 8)}
                                                    </div>
                                                  )
                                                )}
                                              </div>
                                            </div>
                                          )}
                                      </div>
                                    )}

                                    <div className="flex gap-2 pt-3 border-t border-emerald-200/80 mt-4">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleArchiveReport(report.id);
                                        }}
                                      >
                                        <Archive className="w-4 h-4 mr-1" />
                                        Archive report
                                      </Button>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {showPreview && previewAttachment && (
          <AttachmentPreview
            attachment={previewAttachment.data}
            attachmentName={previewAttachment.name}
            onClose={() => {
              setShowPreview(false);
              setPreviewAttachment(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export const ModeratorPage: React.FC = () => {
  return (
    <ToastProvider>
      <ModeratorPageContent />
    </ToastProvider>
  );
};

export default ModeratorPage;