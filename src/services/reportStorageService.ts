// src/services/reportStorageService.ts

export interface StoredReport {
  id: string;
  title: string;
  content: string;
  attachment?: string | null;
  attachmentName?: string | null;
  timestamp: number;
  submitterAddress: string;
  txHash: string;
  status: "pending" | "reviewed" | "archived";
  upvotes: number;
  downvotes: number;
  userVote: "up" | "down" | null;
  upvoters: string[];
  downvoters: string[];
}

export class ReportStorageService {
  private static readonly STORAGE_KEY = 'WhistleB_reports';
  private static readonly VOTES_KEY = 'WhistleB_votes';

  /**
   * Store a new report
   */
  static storeReport(
    reportData: {
      title: string;
      content: string;
      attachment?: string | null;
      attachmentName?: string | null;
      timestamp: string;
      submitterAddress: string;
    },
    txHash: string
  ): StoredReport {
    const reports = this.getAllReports();

    const newReport: StoredReport = {
      id: Date.now().toString(),
      title: reportData.title,
      content: reportData.content,
      attachment: reportData.attachment,
      attachmentName: reportData.attachmentName,
      timestamp: new Date(reportData.timestamp).getTime(),
      submitterAddress: reportData.submitterAddress,
      txHash,
      status: "pending",
      upvotes: 0,
      downvotes: 0,
      userVote: null,
      upvoters: [],
      downvoters: [],
    };

    reports.push(newReport);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reports));

    console.log("📝 Report stored successfully:", newReport.id);
    return newReport;
  }

  /**
   * Get all reports
   */
  static getAllReports(): StoredReport[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) as StoredReport[] : [];
    } catch (error) {
      console.error("Failed to load reports:", error);
      return [];
    }
  }

  /**
   * Update report status
   */
  static updateReportStatus(
    reportId: string,
    status: "pending" | "reviewed" | "archived"
  ): void {
    const reports = this.getAllReports();
    const reportIndex = reports.findIndex((r) => r.id === reportId);

    if (reportIndex !== -1) {
      reports[reportIndex].status = status;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reports));
      console.log(`📋 Report ${reportId} status updated to ${status}`);
    }
  }

  /**
   * Vote on a report
   */
  static voteOnReport(
    reportId: string,
    voteType: "up" | "down",
    walletAddress: string
  ): void {
    const reports = this.getAllReports();
    const reportIndex = reports.findIndex((r) => r.id === reportId);

    if (reportIndex === -1) return;

    const report = reports[reportIndex];
    const votes = this.getUserVotes(walletAddress);
    const currentVote = votes[reportId];

    // Remove previous vote
    if (currentVote === "up") {
      report.upvotes = Math.max(0, report.upvotes - 1);
      report.upvoters = report.upvoters.filter((addr) => addr !== walletAddress);
    } else if (currentVote === "down") {
      report.downvotes = Math.max(0, report.downvotes - 1);
      report.downvoters = report.downvoters.filter((addr) => addr !== walletAddress);
    }

    // Apply new vote
    if (currentVote === voteType) {
      delete votes[reportId];
      report.userVote = null;
    } else {
      votes[reportId] = voteType;
      report.userVote = voteType;

      if (voteType === "up") {
        report.upvotes++;
        if (!report.upvoters.includes(walletAddress)) {
          report.upvoters.push(walletAddress);
        }
      } else {
        report.downvotes++;
        if (!report.downvoters.includes(walletAddress)) {
          report.downvoters.push(walletAddress);
        }
      }
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reports));
    this.saveUserVotes(walletAddress, votes);

    console.log(`🗳️ Vote recorded for report ${reportId}: ${voteType}`);
  }

  /**
   * Get user's votes (per wallet)
   */
  private static getUserVotes(walletAddress: string): Record<string, "up" | "down"> {
    try {
      const allVotes = localStorage.getItem(this.VOTES_KEY);
      const votesData = allVotes ? JSON.parse(allVotes) : {};
      return votesData[walletAddress] || {};
    } catch (error) {
      console.error("Failed to load user votes:", error);
      return {};
    }
  }

  /**
   * Save user's votes (per wallet)
   */
  private static saveUserVotes(
    walletAddress: string,
    votes: Record<string, "up" | "down">
  ): void {
    try {
      const allVotes = localStorage.getItem(this.VOTES_KEY);
      const votesData = allVotes ? JSON.parse(allVotes) : {};
      votesData[walletAddress] = votes;
      localStorage.setItem(this.VOTES_KEY, JSON.stringify(votesData));
    } catch (error) {
      console.error("Failed to save user votes:", error);
    }
  }

  /**
   * Load reports with userVote hydrated for a specific wallet
   */
  static loadUserVotesForReports(walletAddress: string): StoredReport[] {
    const reports = this.getAllReports();
    const userVotes = this.getUserVotes(walletAddress);

    return reports.map((report) => ({
      ...report,
      userVote: userVotes[report.id] || null,
    }));
  }

  /**
   * Clear all reports (for testing)
   */
  static clearAllReports(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.VOTES_KEY);
    console.log("🗑️ All reports cleared");
  }
}
