import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";
import { Navbar } from "./components/Navbar";
import { useWallet } from "./hooks/useWallet";
import { transactionService } from "./services/transactionService";
import { ToastProvider, useToast } from "./components/Toast";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Shield,
  Lock,
  Wallet,
  AlertCircle,
  Key,
  Zap,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

type AppStep = "wallet" | "compose" | "submit";

function AppContent() {
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState<AppStep>("wallet");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    wallet,
    isLoading: walletLoading,
    error: walletError,
    connectLaceWallet,
    disconnectLaceWallet,
    laceWalletState,
  } = useWallet();

  const [moderatorPublicKey, setModeratorPublicKey] = useState("");
  const [reportTitle, setReportTitle] = useState("");
  const [reportContent, setReportContent] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentError, setAttachmentError] = useState("");
  const [txHash, setTxHash] = useState("");

  useEffect(() => {
    console.log("Proof-Speak - Zero-Knowledge Anonymous Reporting System");
    console.log("Flow: Connect Wallet → Compose Report → Generate ZK Proof → Submit to Blockchain");
  }, []);

  const handleNextStep = () => {
    if (currentStep === "wallet") {
      if (!laceWalletState.isConnected) {
        setErrorMessage("Please connect your Midnight Lace wallet to continue");
        return;
      }
      setCurrentStep("compose");
    } else if (currentStep === "compose") {
      if (!moderatorPublicKey.trim()) {
        setErrorMessage("Please enter the moderator's public key");
        return;
      }
      if (!reportTitle.trim() || !reportContent.trim()) {
        setErrorMessage("Please fill in all required fields");
        return;
      }
      setCurrentStep("submit");
    }
    setErrorMessage("");
  };

  const handleWalletConnect = async () => {
    try {
      setErrorMessage("");
      await connectLaceWallet();
      showToast({
        type: "success",
        title: "Wallet Connected Successfully",
        message: "Your Midnight Lace wallet is connected and ready.",
        duration: 4000,
      });
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to connect wallet"
      );
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === "compose") {
      setCurrentStep("wallet");
    } else if (currentStep === "submit") {
      setCurrentStep("compose");
    }
    setErrorMessage("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setAttachmentError("File size must be less than 10MB");
        setAttachment(null);
      } else {
        setAttachmentError("");
        setAttachment(file);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setIsGeneratingProof(true);
      setSubmitStatus("idle");
      setErrorMessage("");

      if (!laceWalletState.isConnected || !wallet) {
        throw new Error(
          "Wallet not connected. Please connect your Midnight Lace wallet."
        );
      }

      // Simulate ZK proof generation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const reportData = {
        moderatorPublicKey,
        title: reportTitle,
        content: reportContent,
        attachment: attachment ? await fileToBase64(attachment) : null,
        attachmentName: attachment ? attachment.name : null,
        timestamp: new Date().toISOString(),
        submitterAddress: wallet.address,
      };

      setIsGeneratingProof(false);
      console.log("ZK Proof generated successfully");
      console.log("Submitting encrypted report to blockchain...");

      const txHash = await transactionService.submitReport(reportData);

      setTxHash(txHash);
      setSubmitStatus("success");

      console.log("Report submitted successfully with transaction hash:", txHash);

      showToast({
        type: "success",
        title: "Report Submitted Successfully",
        message: "Your anonymous report has been delivered securely.",
        duration: 5000,
      });

      setTimeout(() => {
        setCurrentStep("wallet");
        setModeratorPublicKey("");
        setReportTitle("");
        setReportContent("");
        setAttachment(null);
        setSubmitStatus("idle");
        setTxHash("");
      }, 6000);
    } catch (error: unknown) {
      console.error("Submission error:", error);
      setSubmitStatus("error");
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Failed to submit report. Please try again.";
      setErrorMessage(errorMsg);
      setIsGeneratingProof(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case "wallet":
        return "Connect Wallet";
      case "compose":
        return "Compose Encrypted Report";
      case "submit":
        return "Generate ZK Proof & Submit";
      default:
        return "";
    }
  };

  const getStepNumber = (step: AppStep) => {
    switch (step) {
      case "wallet":
        return 1;
      case "compose":
        return 2;
      case "submit":
        return 3;
      default:
        return 0;
    }
  };

  const isStepCompleted = (step: AppStep) => {
    const currentStepNum = getStepNumber(currentStep);
    const stepNum = getStepNumber(step);
    
    if (stepNum < currentStepNum) return true;
    if (step === "wallet" && laceWalletState.isConnected) return true;
    if (step === "compose" && moderatorPublicKey && reportTitle && reportContent) return true;
    
    return false;
  };

  return (
    <div className="min-h-screen text-[#233127] font-outfit relative overflow-hidden animated-gradient-bg">
      {/* Soft pastel gradient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-emerald-200/20 blur-3xl rounded-full floating-blob-1" />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-amber-200/20 blur-3xl rounded-full floating-blob-2" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-emerald-300/15 blur-3xl rounded-full floating-blob-1" />
        <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-lime-200/20 blur-3xl rounded-full floating-blob-2" />
        <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-amber-100/40 blur-3xl rounded-full floating-blob-1" />
      </div>

      <Navbar showHomeButton={true} />

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto pt-[120px] pb-20">
        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm border border-emerald-200/60"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-emerald-700/80">Zero-Knowledge Privacy</span>
          </motion.div>
          
          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 via-lime-700 to-amber-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            Anonymous Reporting
          </motion.h1>
          <motion.p
            className="text-base md:text-lg text-[#445547]/80 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Connect your Midnight Lace wallet, encrypt your report with the moderator's key, 
            and submit securely—your identity stays protected through cryptographic proofs.
          </motion.p>
        </motion.div>

        {/* Step Indicator */}
        <motion.div
          className="glass-card rounded-3xl mb-12 step-indicator-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            {/* Step 1: Wallet */}
            <div
              className={`flex flex-col items-center transition-all duration-500 ${
                currentStep === "wallet"
                  ? "text-emerald-600"
                  : isStepCompleted("wallet")
                  ? "text-emerald-500"
                  : "text-emerald-900/30"
              }`}
            >
              <motion.div
                className={`step-number w-14 h-14 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-500 ${
                  currentStep === "wallet"
                    ? "bg-gradient-to-br from-emerald-300/40 to-lime-200/50 shadow-lg active"
                    : isStepCompleted("wallet")
                    ? "bg-gradient-to-br from-emerald-200/50 to-emerald-300/50 shadow-lg"
                    : "bg-emerald-900/5"
                } ${
                  currentStep === "wallet" || isStepCompleted("wallet")
                    ? "text-emerald-950"
                    : "text-emerald-700/60"
                }`}
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 0.3 }}
              >
                {isStepCompleted("wallet") && currentStep !== "wallet" ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <Wallet className="w-6 h-6" />
                )}
              </motion.div>
              <span
                className={`mt-3 text-xs md:text-sm font-medium ${
                  currentStep === "wallet"
                    ? "text-emerald-700"
                    : isStepCompleted("wallet")
                    ? "text-emerald-800/70"
                    : "text-emerald-900/40"
                }`}
              >
                Connect Wallet
              </span>
            </div>

            {/* Connector 1 */}
            <div
              className={`step-connector flex-1 mx-5 ${
                isStepCompleted("wallet") ? "completed" : ""
              }`}
            />

            {/* Step 2: Compose */}
            <div
              className={`flex flex-col items-center transition-all duration-500 ${
                currentStep === "compose"
                  ? "text-emerald-600"
                  : isStepCompleted("compose")
                  ? "text-emerald-500"
                  : "text-emerald-900/30"
              }`}
            >
              <motion.div
                className={`step-number w-14 h-14 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-500 ${
                  currentStep === "compose"
                    ? "bg-gradient-to-br from-emerald-300/40 to-lime-200/50 shadow-lg active"
                    : isStepCompleted("compose")
                    ? "bg-gradient-to-br from-emerald-200/50 to-emerald-300/50 shadow-lg"
                    : "bg-emerald-900/5"
                } ${
                  currentStep === "compose" || isStepCompleted("compose")
                    ? "text-emerald-950"
                    : "text-emerald-700/60"
                }`}
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 0.3 }}
              >
                {isStepCompleted("compose") && currentStep !== "compose" ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <FileText className="w-6 h-6" />
                )}
              </motion.div>
              <span
                className={`mt-3 text-xs md:text-sm font-medium ${
                  currentStep === "compose"
                    ? "text-emerald-700"
                    : isStepCompleted("compose")
                    ? "text-emerald-800/70"
                    : "text-emerald-900/40"
                }`}
              >
                Compose Report
              </span>
            </div>

            {/* Connector 2 */}
            <div
              className={`step-connector flex-1 mx-5 ${
                isStepCompleted("compose") ? "completed" : ""
              }`}
            />

            {/* Step 3: Submit */}
            <div
              className={`flex flex-col items-center transition-all duration-500 ${
                currentStep === "submit" ? "text-emerald-600" : "text-emerald-900/30"
              }`}
            >
              <motion.div
                className={`step-number w-14 h-14 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-500 ${
                  currentStep === "submit"
                    ? "bg-gradient-to-br from-emerald-300/40 to-lime-200/50 shadow-lg active"
                    : "bg-emerald-900/5"
                } ${
                  currentStep === "submit" ? "text-emerald-950" : "text-emerald-700/60"
                }`}
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 0.3 }}
              >
                <Shield className="w-6 h-6" />
              </motion.div>
              <span
                className={`mt-3 text-xs md:text-sm font-medium ${
                  currentStep === "submit" ? "text-emerald-700" : "text-emerald-900/40"
                }`}
              >
                ZK Proof & Submit
              </span>
            </div>
          </div>
        </motion.div>

        {/* Main Content Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            className="glass-card rounded-3xl p-8 sm:p-12 space-y-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 via-lime-700 to-amber-700">
              {getStepTitle()}
            </h2>

            {/* STEP 1: WALLET CONNECTION */}
            {currentStep === "wallet" && (
              <div className="space-y-7">
                <div className="wallet-card rounded-2xl p-6 flex items-start space-x-4">
                  <Wallet className="w-6 h-6 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-[#233127]/90 font-semibold mb-2 text-lg">
                      Connect Your Midnight Lace Wallet
                    </h3>
                    <p className="text-[#445547]/80 text-sm leading-relaxed">
                      Connect your Midnight Lace wallet to authenticate and submit
                      your anonymous report securely on the Midnight blockchain.
                    </p>
                  </div>
                </div>

                {(errorMessage || walletError) && (
                  <div className="alert-box alert-error flex items-start space-x-4 p-5 rounded-2xl border">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1">Connection Error</h3>
                      <p className="text-sm opacity-90">
                        {errorMessage || walletError}
                      </p>
                    </div>
                  </div>
                )}

                {laceWalletState.isConnected && wallet ? (
                  <div className="space-y-6">
                    <div className="wallet-card wallet-connected rounded-2xl p-6 flex items-start space-x-4">
                      <CheckCircle2 className="w-7 h-7 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="text-emerald-700 font-semibold mb-3 text-lg">
                          Wallet Connected Successfully
                        </h3>
                        <p className="text-emerald-800/70 text-sm font-mono break-all bg-emerald-900/5 px-4 py-3 rounded-xl">
                          {wallet.address}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4">
                      <motion.button
                        onClick={disconnectLaceWallet}
                        className="btn-secondary-glass inline-flex items-center gap-2 px-6 py-3 text-[#445547]/90 text-sm font-medium rounded-xl"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Wallet className="w-4 h-4" />
                        Disconnect Wallet
                      </motion.button>

                      <motion.button
                        onClick={handleNextStep}
                        className="btn-primary-enhanced inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold rounded-xl"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ duration: 0.2 }}
                      >
                        Next Step
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {(walletLoading || laceWalletState.isConnecting) && (
                      <div className="flex items-center justify-center p-12">
                        <div className="flex items-center space-x-4">
                          <div className="spinner spinner-glow h-8 w-8" />
                          <p className="text-emerald-700 font-medium">
                            Connecting to Midnight Lace wallet...
                          </p>
                        </div>
                      </div>
                    )}

                    {!walletLoading && !laceWalletState.isConnecting && (
                      <div className="text-center py-8">
                        <motion.button
                          onClick={handleWalletConnect}
                          className="btn-primary-enhanced inline-flex items-center gap-3 px-12 py-5 text-lg font-semibold rounded-2xl"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Wallet className="w-6 h-6" />
                          Connect Midnight Lace Wallet
                        </motion.button>
                        <p className="mt-5 text-[#445547]/70 text-sm">
                          Make sure you have the Midnight Lace wallet extension
                          installed
                        </p>
                        <a
                          href="https://chromewebstore.google.com/detail/hgeekaiplokcnmakghbdfbgnlfheichg?utm_source=item-share-cb"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-3 text-emerald-700 hover:text-emerald-800 text-sm underline transition-colors"
                        >
                          Click here to install
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: COMPOSE REPORT */}
            {currentStep === "compose" && (
              <div className="space-y-7">
                {/* Moderator Public Key */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#233127]/90 mb-3">
                    <Key className="w-4 h-4 text-emerald-600" />
                    Moderator Public Key *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter the moderator's public key for encrypted delivery"
                    value={moderatorPublicKey}
                    onChange={(e) => setModeratorPublicKey(e.target.value)}
                    className="moderator-key-input input-enhanced w-full px-5 py-4 rounded-2xl text-[#233127]/90 placeholder-[#445547]/50 focus:outline-none transition-all"
                  />
                  <p className="mt-3 text-xs text-[#445547]/70 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5" />
                    Your report will be encrypted with this key before submission
                  </p>
                </div>

                {/* Report Title */}
                <div>
                  <label className="block text-sm font-semibold text-[#233127]/90 mb-3">
                    Report Title *
                  </label>
                  <input
                    type="text"
                    placeholder="Brief description of the issue"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    className="input-enhanced w-full px-5 py-4 rounded-2xl text-[#233127]/90 placeholder-[#445547]/50 focus:outline-none transition-all"
                  />
                </div>

                {/* Report Details */}
                <div>
                  <label className="block text-sm font-semibold text-[#233127]/90 mb-3">
                    Report Details *
                  </label>
                  <textarea
                    placeholder="Provide detailed information about the issue..."
                    value={reportContent}
                    onChange={(e) => setReportContent(e.target.value)}
                    rows={10}
                    className="input-enhanced w-full px-5 py-4 rounded-2xl text-[#233127]/90 placeholder-[#445547]/50 focus:outline-none transition-all resize-none"
                  />
                </div>

                {/* File Attachment */}
                <div>
                  <label className="block text-sm font-semibold text-[#233127]/90 mb-3">
                    Attachment (Optional)
                  </label>
                  <div
                    className={`file-upload-wrapper ${
                      attachment ? "has-file" : ""
                    }`}
                  >
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                      className="block w-full text-sm text-[#445547]/90 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-emerald-50/80 file:text-emerald-800 hover:file:bg-emerald-100/90 file:transition-all file:duration-300 file:cursor-pointer cursor-pointer"
                    />
                    <p className="mt-4 text-xs text-[#445547]/70">
                      Attach evidence such as documents, screenshots, or images
                      (max 10MB)
                    </p>
                  </div>
                  {attachmentError && (
                    <p className="mt-3 text-sm text-rose-600 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {attachmentError}
                    </p>
                  )}
                  {attachment && (
                    <div className="mt-4 inline-flex items-center gap-3 px-5 py-3 bg-emerald-100/60 border border-emerald-300/70 rounded-xl">
                      <FileText className="w-5 h-5 text-emerald-700" />
                      <span className="text-sm text-emerald-800 font-medium">
                        {attachment.name}
                      </span>
                      <span className="text-xs text-emerald-700/70">
                        ({(attachment.size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                  )}
                </div>

                {errorMessage && (
                  <div className="alert-box alert-error flex items-start space-x-4 p-5 rounded-2xl border">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{errorMessage}</p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-6">
                  <motion.button
                    onClick={handlePreviousStep}
                    className="btn-secondary-glass inline-flex items-center gap-2 px-7 py-3.5 text-[#445547]/90 text-sm font-medium rounded-xl"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </motion.button>
                  <motion.button
                    onClick={handleNextStep}
                    className="btn-primary-enhanced inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold rounded-xl"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                  >
                    Next Step
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW & SUBMIT */}
            {currentStep === "submit" && (
              <div className="space-y-7">
                {submitStatus === "success" ? (
                  <div className="alert-box alert-success flex items-start space-x-5 p-7 rounded-2xl border">
                    <CheckCircle2 className="w-8 h-8 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-4">
                        Report Submitted Successfully!
                      </h3>
                      <p className="text-sm opacity-90 mb-5 leading-relaxed">
                        Your anonymous report has been encrypted with the
                        moderator's public key, a zero-knowledge proof has been
                        generated, and the transaction has been submitted to the
                        Midnight blockchain.
                      </p>
                      {txHash && (
                        <div className="mt-5">
                          <p className="text-xs opacity-80 mb-3 font-semibold">
                            Transaction Hash:
                          </p>
                          <div className="tx-hash-display">{txHash}</div>
                        </div>
                      )}
                      <p className="text-sm opacity-80 mt-5">
                        The moderator will review your report soon. Your identity
                        remains cryptographically protected.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="alert-box alert-info flex items-start space-x-4 p-6 rounded-2xl border">
                      <Shield className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold mb-2 text-emerald-800">
                          Review Before Submission
                        </h3>
                        <p className="text-sm opacity-90">
                          Please review your report carefully. Once submitted with
                          a ZK proof, it cannot be edited.
                        </p>
                      </div>
                    </div>

                    {/* Review Card */}
                    <div className="glass-card-static rounded-2xl p-7 space-y-6">
                      <div>
                        <h3 className="text-xs font-semibold text-[#445547]/70 mb-3 uppercase tracking-wider">
                          Moderator Public Key
                        </h3>
                        <p className="text-sm text-[#233127]/90 font-mono break-all bg-emerald-900/5 px-4 py-3 rounded-xl">
                          {moderatorPublicKey}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-xs font-semibold text-[#445547]/70 mb-3 uppercase tracking-wider">
                          Title
                        </h3>
                        <p className="text-sm text-[#233127]/90">{reportTitle}</p>
                      </div>

                      <div>
                        <h3 className="text-xs font-semibold text-[#445547]/70 mb-3 uppercase tracking-wider">
                          Details
                        </h3>
                        <p className="text-sm text-[#233127]/90 whitespace-pre-wrap leading-relaxed">
                          {reportContent}
                        </p>
                      </div>

                      {attachment && (
                        <div>
                          <h3 className="text-xs font-semibold text-[#445547]/70 mb-3 uppercase tracking-wider">
                            Attachment
                          </h3>
                          <div className="inline-flex items-center gap-3 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                            <FileText className="w-4 h-4 text-emerald-700" />
                            <span className="text-sm text-emerald-800 font-medium">
                              {attachment.name}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Security Features */}
                    <div className="space-y-3">
                      <div className="security-feature">
                        <Lock className="security-feature-icon text-emerald-600" />
                        <span className="text-sm text-[#233127]/80">
                          End-to-end encrypted with moderator's public key
                        </span>
                      </div>
                      <div className="security-feature">
                        <Shield className="security-feature-icon text-emerald-700" />
                        <span className="text-sm text-[#233127]/80">
                          Zero-knowledge proof ensures complete anonymity
                        </span>
                      </div>
                      <div className="security-feature">
                        <Zap className="security-feature-icon text-amber-600" />
                        <span className="text-sm text-[#233127]/80">
                          Immutable record on Midnight blockchain
                        </span>
                      </div>
                    </div>

                    {laceWalletState.isConnected && wallet && (
                      <div className="wallet-card wallet-connected rounded-2xl p-5 flex items-center space-x-4">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                        <div>
                          <p className="text-emerald-700 text-sm font-semibold">
                            Wallet Connected
                          </p>
                          <p className="text-emerald-800/70 text-xs font-mono mt-1">
                            {wallet.address.slice(0, 20)}...
                            {wallet.address.slice(-12)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* ZK Proof Generation Status */}
                    {isGeneratingProof && (
                      <div className="space-y-5">
                        <div className="progress-bar">
                          <div
                            className="progress-bar-fill"
                            style={{ width: "75%" }}
                          />
                        </div>

                        <div className="alert-box alert-info flex items-start space-x-5 p-6 rounded-2xl border zk-generating">
                          <div className="spinner spinner-glow h-7 w-7 mt-0.5 flex-shrink-0" />
                          <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2 text-emerald-800">
                              <Zap className="w-5 h-5" />
                              Generating Zero‑Knowledge Proof
                            </h3>
                            <p className="text-sm opacity-90 leading-relaxed">
                              Your report is being encrypted locally in your
                              browser and a cryptographic zero-knowledge proof is
                              being constructed. This ensures your anonymity while
                              proving the validity of your submission.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {isSubmitting && !isGeneratingProof && (
                      <div className="alert-box alert-info flex items-start space-x-5 p-6 rounded-2xl border">
                        <div className="spinner spinner-glow h-7 w-7 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold mb-2 text-emerald-800">
                            Broadcasting Transaction
                          </h3>
                          <p className="text-sm opacity-90">
                            Please sign the transaction in your Midnight Lace
                            wallet to submit your encrypted report to the
                            blockchain...
                          </p>
                        </div>
                      </div>
                    )}

                    {errorMessage && (
                      <div className="alert-box alert-error flex items-start space-x-4 p-5 rounded-2xl border">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <p className="text-sm">{errorMessage}</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-6">
                      <motion.button
                        onClick={handlePreviousStep}
                        disabled={isSubmitting}
                        className="btn-secondary-glass inline-flex items-center gap-2 px-7 py-3.5 text-[#445547]/90 text-sm font-medium rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Previous
                      </motion.button>
                      <motion.button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="btn-primary-enhanced inline-flex items-center gap-2 px-8 py-4 text-sm font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ duration: 0.2 }}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="spinner h-4 w-4" />
                            {isGeneratingProof
                              ? "Generating Proof..."
                              : "Signing Transaction..."}
                          </>
                        ) : (
                          <>
                            <Shield className="w-5 h-5" />
                            Generate ZK Proof & Submit
                          </>
                        )}
                      </motion.button>
                    </div>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Flow Summary Footer */}
        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-xs md:text-sm text-[#445547]/70 leading-relaxed">
            <span className="text-emerald-700 font-medium">Connect Wallet</span> →{" "}
            <span className="text-emerald-800 font-medium">
              Compose Encrypted Report
            </span>{" "}
            →{" "}
            <span className="text-lime-700 font-medium">
              Generate ZK Proof
            </span>{" "}
            →{" "}
            <span className="text-emerald-700 font-medium">
              Submit to Blockchain
            </span>{" "}
            →{" "}
            <span className="text-amber-700 font-medium">
              Anonymously Delivered
            </span>{" "}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;