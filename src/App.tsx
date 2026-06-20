import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Eye,
  ShieldCheck,
  Wallet,
  Send,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MapPin,
  Sparkles,
  RefreshCw,
  Plus,
  Clock,
  ArrowRight,
  TrendingUp,
  Image as ImageIcon,
  User,
  ExternalLink,
  ChevronRight,
  RotateCcw,
  Video,
  FileVideo,
  Trash2,
  Cpu
} from "lucide-react";
import { Gig, Submission, TreasuryState, AuditLog } from "./types";
import { TEST_PROOF_BUNDLES, TestProofBundle } from "./data";

const COMMERCIAL_CATEGORIES = [
  {
    icon: "🗺️",
    title: "Ground-Truth Data",
    desc: "Collect real-time high-fidelity raw photos, geo-checkins, and street views to update local maps and train automated models.",
    why: "AI models cannot traverse local alleys or inspect spatial nuances. Crowdsourcing acts as a physical sensory array.",
    motive: "Training sets & high-fidelity maps are license-sold to autonomous vehicle fleets or logistics networks.",
    proof: "Signed cryptographic GPS tracking coupled with raw high-res footage or panning visual snapshots.",
    template: "Collect ground-truth video proof of active roadwork near Connaught Place Outer Circle, New Delhi. Record a slow 15-second panorama showcasing construction safety board visibility."
  },
  {
    icon: "🏪",
    title: "Retail & Brand Auditing",
    desc: "Verify package placement, vertical shelving slots, and check pricing tags in major local supermarkets or regional hubs.",
    why: "Web crawlers cannot confirm real-time brick-and-mortar checkout layouts or verify that retail partner stores respect agreements.",
    motive: "Brands pay for real-time compliance validation, ensuring competitor placements didn't hijack paid shelving.",
    proof: "Gemini visual multiclass detection checking logo alignment and product counts.",
    template: "Audit the dairy shelves at DMart Express on Powai main street, Mumbai. Submit a bright, face-on shelf photo verifying if the 'Amul Gold' milk cartons are placed on the prominent middle row."
  },
  {
    icon: "📦",
    title: "Last-Mile Verification",
    desc: "Perform physical site audits, verify parcel locker parameters, or inspect delivery disputes on-the-scene.",
    why: "On-chain networks can route ledger entries, but cannot verify local damage claims, secure property bounds, or valid physical presences.",
    motive: "Drastically lowers customer claim frauds and offers verifiable proof-of-status for cargo routing operations.",
    proof: "Metadata timestamp with geographical coordinates fencing and condition analysis.",
    template: "Verify structural state and locking security of the delivery safe-box at Regent Hill Station, Bengaluru. Capture a close-up picture of the digital lock dial to prove it is free of physical tampering."
  },
  {
    icon: "🧪",
    title: "Civic & Enviro Sensing",
    desc: "Measure flood gauges, read local civic boards, inspect trash levels, and record environmental hazard statuses.",
    why: "Static weather sensors decay and satellites lack granular detail. Humans serve as elastic mobile sensors.",
    motive: "Dynamic updates feed into smart-city operations and ESG rating models for sustainable real-estate evaluations.",
    proof: "Physical visual gauge readout combined with dual-worker consensus verification.",
    template: "Report environmental state at Yamuna River Ghat #3, Delhi. Take a clear photograph showing the actual paint water level markers on the central pier column, detailing current level in text."
  },
  {
    icon: "🔑",
    title: "Physical Proxy Ops",
    desc: "Deploy physical assets, paste localized discount QR panels, or deliver secure tokens to physical storefronts.",
    why: "Agents can settle digital currencies instantly, but they cannot paste high-durability adhesive materials or interact with local shopkeepers.",
    motive: "Bridges the gap between on-chain agent marketing campaigns and physical retail store traffic generation.",
    proof: "Photo of QR code successfully pasted inside partner store with matching store facade signature.",
    template: "Paste raw promotional discount QR sticker at the counter of Cafe BrewCraft in Pune. Upload a clear photograph showing the sticker applied on the main wood counter board with store logo visible in background."
  }
];

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function App() {
  // State
  const [view, setView] = useState<"operations" | "worker">("operations");
  const [opsSubTab, setOpsSubTab] = useState<"live" | "intelligence">("live");
  const [activeCategoryTab, setActiveCategoryTab] = useState<number>(0);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [treasury, setTreasury] = useState<TreasuryState>({ balance: 350, paid: 0, activeContracts: 0 });
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [selectedGigId, setSelectedGigId] = useState<string>("gig-1");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>("");

  // Create/Draft Gig form state
  const [businessGoal, setBusinessGoal] = useState("");
  const [isGeneratingGig, setIsGeneratingGig] = useState(false);
  const [draftGig, setDraftGig] = useState<{
    title: string;
    description: string;
    requirements: string[];
    payout_monad: number;
    estimated_hours: number;
  } | null>(null);

  // Field worker form state
  const [workerName, setWorkerName] = useState("Jane Doe");
  const [locationValue, setLocationValue] = useState("19.0896° N, 72.8656° E (Mumbai T2 departures)");
  const [textProofValue, setTextProofValue] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<{ url: string; name: string; type: string }[]>([]);
  const [photoBase64, setPhotoBase64] = useState("");
  const [photoDisplayUrl, setPhotoDisplayUrl] = useState("");
  const [imageUploadStatus, setImageUploadStatus] = useState("");
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);

  // MetaMask Web3 Integration hooks
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<string | null>(null);
  const [walletNetwork, setWalletNetwork] = useState<string | null>(null);
  const [paymentSystem, setPaymentSystem] = useState<'simulated' | 'metamask'>(() => {
    return (localStorage.getItem("gigboss_payment_system") as 'simulated' | 'metamask') || 'simulated';
  });
  const [workerAddress, setWorkerAddress] = useState("");
  const [isPayingOnChain, setIsPayingOnChain] = useState<string | null>(null);
  const [autoPayAttempted, setAutoPayAttempted] = useState<Record<string, boolean>>({});

  const [autoConfirmMode, setAutoConfirmMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("gigboss_auto_confirm_mode");
    return saved !== null ? saved === "true" : true;
  });

  // Toggle local ledger system
  const togglePaymentSystem = (system: 'simulated' | 'metamask') => {
    setPaymentSystem(system);
    localStorage.setItem("gigboss_payment_system", system);
    showNotification("success", `Switched ledger system to: ${system === 'metamask' ? 'Monad Web3 MetaMask Core' : 'Simulated Corporate Treasury'}`);
  };

  const toggleAutoConfirmMode = (enabled: boolean) => {
    setAutoConfirmMode(enabled);
    localStorage.setItem("gigboss_auto_confirm_mode", String(enabled));
    showNotification("success", enabled 
      ? "🤖 AI Sovereignty Enabled: Gigs will automatically sign & confirm on-chain!" 
      : "Manual signature required: MetaMask prompts will be triggered."
    );
  };

  // MetaMask status polling & events
  useEffect(() => {
    checkIfWalletIsConnected();
    
    if (window.ethereum) {
      const handleAccounts = (accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletConnected(true);
          setWalletAddress(accounts[0]);
          fetchWalletBalance(accounts[0]);
        } else {
          setWalletConnected(false);
          setWalletAddress(null);
          setWalletBalance(null);
        }
      };

      const handleChain = (chainId: string) => {
        updateNetworkName(chainId);
        if (walletAddress) {
          fetchWalletBalance(walletAddress);
        }
      };

      window.ethereum.on("accountsChanged", handleAccounts);
      window.ethereum.on("chainChanged", handleChain);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccounts);
          window.ethereum.removeListener("chainChanged", handleChain);
        }
      };
    }
  }, [walletAddress]);

  const updateNetworkName = (hexChainId: string) => {
    const chainIdInt = parseInt(hexChainId, 16);
    if (chainIdInt === 1) setWalletNetwork("Ethereum Mainnet");
    else if (chainIdInt === 11155111) setWalletNetwork("Sepolia Testnet");
    else if (chainIdInt === 10143) setWalletNetwork("Monad Testnet");
    else setWalletNetwork(`EVM Chain (ID: ${chainIdInt})`);
  };

  const checkIfWalletIsConnected = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setWalletConnected(true);
          setWalletAddress(accounts[0]);
          fetchWalletBalance(accounts[0]);
          const chainId = await window.ethereum.request({ method: "eth_chainId" });
          updateNetworkName(chainId);
        }
      } catch (err) {
        console.error("Wallet discovery failed:", err);
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      showNotification("error", "MetaMask was not detected. Please install the MetaMask extension!");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length > 0) {
        setWalletConnected(true);
        setWalletAddress(accounts[0]);
        fetchWalletBalance(accounts[0]);
        const chainId = await window.ethereum.request({ method: "eth_chainId" });
        updateNetworkName(chainId);
        showNotification("success", `MetaMask Connected: ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`);
      }
    } catch (err: any) {
      showNotification("error", "Connection failed: " + err.message);
    }
  };

  const fetchWalletBalance = async (address: string) => {
    if (!window.ethereum) return;
    try {
      const balanceHex = await window.ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"]
      });
      const balanceWei = BigInt(balanceHex);
      const balanceEth = (Number(balanceWei) / 1e18).toFixed(4);
      setWalletBalance(balanceEth);
    } catch (err) {
      console.error("Balance querying failed:", err);
    }
  };

  const autofillWorkerAddress = () => {
    if (walletAddress) {
      setWorkerAddress(walletAddress);
      showNotification("success", "Auto-filled receiving EVM address with connected MetaMask wallet!");
    } else {
      showNotification("info", "Connect MetaMask in the operations ledger above to auto-detect addresses.");
      connectWallet();
    }
  };

  const handleOnChainPayment = async (sub: Submission) => {
    if (!window.ethereum) {
      showNotification("error", "No MetaMask injector found. Install MetaMask.");
      return;
    }
    if (!walletAddress) {
      showNotification("error", "Please connect MetaMask first to dispatch payments on-chain.");
      return;
    }

    const gig = gigs.find(g => g.id === sub.gigId);
    if (!gig) {
      showNotification("error", "Target agreement metadata missing.");
      return;
    }

    const payoutAmount = gig.payout_monad;
    // Payout standard Hardhat Account 2 or user custom address
    const recipient = sub.workerAddress || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

    setIsPayingOnChain(sub.id);
    showNotification("info", `Prompting signature for transaction. Sending ${payoutAmount} tMONAD/ETH directly to worker address ${recipient}...`);

    try {
      // Hex of payoutAmount * 1e18
      const weiAmountStr = "0x" + BigInt(Math.floor(payoutAmount * 1e18)).toString(16);

      const transactionParameters = {
        to: recipient,
        from: walletAddress,
        value: weiAmountStr,
      };

      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      });

      if (txHash) {
        showNotification("info", "Broadcasting Monad payload... Confirming transaction with autonomous auditor.");

        const response = await fetch(`/api/submissions/${sub.id}/pay`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            txHash,
            walletAddress,
          }),
        });

        if (response.ok) {
          showNotification("success", `Tx Consolidated! Dispensed onchain payload of ${payoutAmount} tMONAD to ${recipient}`);
          fetchInitialData();
          if (walletAddress) fetchWalletBalance(walletAddress);
        } else {
          showNotification("error", "Transaction verified but backend ledger confirmation failed.");
        }
      }
    } catch (err: any) {
      console.error(err);
      showNotification("error", "Payment cancelled: " + (err.message || "User declined signature."));
    } finally {
      setIsPayingOnChain(null);
    }
  };

  const handleAutonomousPayment = async (sub: Submission) => {
    setIsPayingOnChain(sub.id);
    showNotification("info", "🤖 Prompting autonomous key-signature from Sovereign Operator Wallet...");
    try {
      const response = await fetch(`/api/submissions/${sub.id}/pay-autonomous`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (response.ok) {
        showNotification("success", "🤖 Autonomous key-signing completed successfully! Broadcasted directly to Monad gateway.");
        fetchInitialData();
        if (walletAddress) fetchWalletBalance(walletAddress);
      } else {
        showNotification("error", "Failed to compile transaction on-chain autonomously.");
      }
    } catch (err: any) {
      console.error(err);
      showNotification("error", "Autonomous transaction failed: " + err.message);
    } finally {
      setIsPayingOnChain(null);
    }
  };

  // Automatically trigger on-chain payment with MetaMask when a submission becomes approved, without asking for permission
  useEffect(() => {
    // Find any APPROVED submission that has not completed payout yet
    const pendingPaymentSub = submissions.find(s => 
      s.status === "APPROVED" && 
      s.evaluation && 
      !s.evaluation.payout_trigger && 
      (s.payoutMode === "metamask" || paymentSystem === "metamask")
    );

    if (pendingPaymentSub) {
      if (!autoPayAttempted[pendingPaymentSub.id] && isPayingOnChain !== pendingPaymentSub.id) {
        // Immediately set flag to avoid double-invoking
        setAutoPayAttempted(prev => ({ ...prev, [pendingPaymentSub.id]: true }));
        
        if (autoConfirmMode) {
          // AI Sovereignty Model - Auto Sign & Auto Confirm autonomously on-chain
          handleAutonomousPayment(pendingPaymentSub);
        } else {
          // Manual prompt model
          if (walletConnected && walletAddress) {
            handleOnChainPayment(pendingPaymentSub);
          }
        }
      }
    }
  }, [submissions, paymentSystem, walletConnected, walletAddress, autoPayAttempted, isPayingOnChain, autoConfirmMode]);

  // Poll for changes periodically to update audit evaluations
  useEffect(() => {
    fetchInitialData();
    const interval = setInterval(fetchInitialData, 4000);
    return () => clearInterval(interval);
  }, []);

  const fetchInitialData = async () => {
    try {
      const [gigsRes, subRes, trRes, logRes] = await Promise.all([
        fetch("/api/gigs"),
        fetch("/api/submissions"),
        fetch("/api/treasury"),
        fetch("/api/logs")
      ]);

      if (gigsRes.ok && subRes.ok && trRes.ok && logRes.ok) {
        const gigsData = await gigsRes.json();
        const subsData = await subRes.json();
        const trData = await trRes.json();
        const logsData = await logRes.json();

        setGigs(gigsData);
        setSubmissions(subsData);
        setTreasury(trData);
        setLogs(logsData);

        // Auto-select first active submission if none selected yet
        if (subsData.length > 0 && !selectedSubmissionId) {
          setSelectedSubmissionId(subsData[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load server data:", err);
    }
  };

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Draft new gig outline using Gemini
  const handleAiDraftGig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessGoal.trim()) {
      showNotification("error", "Please write a business operational goal first.");
      return;
    }

    setIsGeneratingGig(true);
    setDraftGig(null);

    try {
      const response = await fetch("/api/generate-gig", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: businessGoal })
      });

      if (!response.ok) {
        throw new Error("Agency rejected generation parameters.");
      }

      const data = await response.json();
      if (data.gigDetails) {
        // AI generated Details
        setDraftGig({
          title: data.gigDetails.title || "Verify operational integrity",
          description: data.gigDetails.description || "",
          requirements: data.gigDetails.requirements || [],
          payout_monad: Number(data.gigDetails.payout_monad) || 12.5,
          estimated_hours: Number(data.gigDetails.estimated_hours) || 1.5
        });
        showNotification("success", "GigBoss-AI formulated a detailed task specification!");
      }
    } catch (err: any) {
      showNotification("error", "AI Draft Generation failed: " + err.message);
    } finally {
      setIsGeneratingGig(false);
    }
  };

  // Authorize and fund contract
  const handlePublishGig = async () => {
    if (!draftGig) return;

    try {
      const response = await fetch("/api/gigs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draftGig)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          showNotification("success", `Treasury successfully locked ${draftGig.payout_monad} MONAD for "${draftGig.title}"`);
          setDraftGig(null);
          setBusinessGoal("");
          fetchInitialData();
        }
      } else {
        const errorData = await response.json();
        showNotification("error", errorData.error || "Execution failed.");
      }
    } catch (err: any) {
      showNotification("error", "Publish failed: " + err.message);
    }
  };

  // Human submission submit
  const handleWorkerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGigId) {
      showNotification("error", "Please select an open contract to satisfy.");
      return;
    }
    if (!workerName.trim()) {
      showNotification("error", "Worker Identity signature is required.");
      return;
    }
    if (!textProofValue.trim()) {
      showNotification("error", "Please provide textual observations or verification proof.");
      return;
    }

    setIsSubmittingProof(true);

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gigId: selectedGigId,
          workerName,
          textProof: textProofValue,
          locationMetadata: locationValue,
          photoUrl: photoBase64,
          files: uploadedFiles,
          workerAddress,
          payoutMode: paymentSystem
        })
      });

      if (response.ok) {
        const resData = await response.json();
        showNotification("success", "Proof submitted to the GigBoss-AI automated auditor!");
        // Clear inputs
        setTextProofValue("");
        setPhotoBase64("");
        setPhotoDisplayUrl("");
        setUploadedFiles([]);
        setImageUploadStatus("");
        // Switch back to operations view to let the user see the auditor's mind at work!
        setView("operations");
        if (resData.submissionId) {
          setSelectedSubmissionId(resData.submissionId);
        }
        fetchInitialData();
      } else {
        const errData = await response.json();
        showNotification("error", errData.error || "Submission failure.");
      }
    } catch (err: any) {
      showNotification("error", "Submission error: " + err.message);
    } finally {
      setIsSubmittingProof(false);
    }
  };

  // Reset core database state
  const handleResetDatabaseState = async () => {
    if (window.confirm("Restore demo database state with active and simulated presets? This resets balance to 350 MONAD.")) {
      try {
        const response = await fetch("/api/reset-state", { method: "POST" });
        if (response.ok) {
          showNotification("success", "System state rejuvenated to pristine preseeds.");
          const resMap = await response.json();
          setGigs(resMap.gigs);
          setSubmissions(resMap.submissions);
          setTreasury(resMap.treasury);
          setLogs(resMap.auditLogs);
          if (resMap.submissions.length > 0) {
            setSelectedSubmissionId(resMap.submissions[0].id);
          }
        }
      } catch (err) {
        showNotification("error", "Failed to reset.");
      }
    }
  };

  // Inject beautiful Unsplash test proof bundles for mock evaluation
  const injectSandboxProof = (bundle: TestProofBundle) => {
    setTextProofValue(bundle.textProof);
    setLocationValue(bundle.locationMetadata);
    setPhotoBase64(bundle.base64Data);
    setPhotoDisplayUrl(bundle.imageDisplayUrl);
    setUploadedFiles([
      {
        url: bundle.base64Data,
        name: bundle.name + " Snap",
        type: "image/png"
      }
    ]);
    setImageUploadStatus(`Loaded demo asset: ${bundle.name}`);
    showNotification("info", `Injected Proof Template: ${bundle.name}`);
  };

  // Handle multiple files upload (images or videos)
  const handleLocalFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setImageUploadStatus(`Processing ${files.length} file(s)...`);

    const newFiles: { url: string; name: string; type: string }[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        showNotification("error", `File "${file.name}" is not a valid image or video.`);
        continue;
      }

      // Convert to Base64 data URL
      const promise = new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            resolve(event.target.result as string);
          } else {
            reject(new Error("Empty result"));
          }
        };
        reader.onerror = () => reject(reader.error || new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });

      try {
        const dataUrl = await promise;
        newFiles.push({
          url: dataUrl,
          name: file.name,
          type: file.type,
        });
      } catch (err) {
        console.error("Error reading file:", err);
        showNotification("error", `Could not parse "${file.name}"`);
      }
    }

    if (newFiles.length > 0) {
      setUploadedFiles(prev => {
        const updated = [...prev, ...newFiles];
        // For backwards compatibility, set first element if any
        const firstImg = updated.find(f => f.type.startsWith("image/")) || updated[0];
        setPhotoBase64(firstImg.url);
        setPhotoDisplayUrl(firstImg.url);
        setImageUploadStatus(`Loaded ${newFiles.length} file(s) successfully. Total: ${updated.length} file(s).`);
        return updated;
      });
      showNotification("success", `Loaded ${newFiles.length} evidence file(s).`);
    } else {
      setImageUploadStatus("Upload aborted or failed.");
    }
  };

  // Remove an uploaded file by index
  const removeUploadedFile = (indexToRemove: number) => {
    setUploadedFiles(prev => {
      const updated = prev.filter((_, idx) => idx !== indexToRemove);
      if (updated.length > 0) {
        const firstImg = updated.find(f => f.type.startsWith("image/")) || updated[0];
        setPhotoBase64(firstImg.url);
        setPhotoDisplayUrl(firstImg.url);
        setImageUploadStatus(`Total: ${updated.length} file(s).`);
      } else {
        setPhotoBase64("");
        setPhotoDisplayUrl("");
        setImageUploadStatus("");
      }
      return updated;
    });
    showNotification("info", "Attachment removed.");
  };

  // UI calculations
  const selectedSub = submissions.find(s => s.id === selectedSubmissionId);
  const selectedGigForSub = selectedSub ? gigs.find(g => g.id === selectedSub.gigId) : null;

  return (
    <div id="root-container" className="flex flex-col min-h-screen w-full bg-[#f5f2ed] font-sans text-[#2d2a26] antialiased">
      {/* Toast Notification */}
      {notification && (
        <div id="system-toast" className={`fixed top-4 right-4 z-[9999] flex items-center p-4 rounded-xl shadow-lg border max-w-md animate-bounce ${
          notification.type === 'success' 
            ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
            : notification.type === 'error'
              ? 'bg-rose-50 text-rose-900 border-rose-200'
              : 'bg-amber-50 text-amber-900 border-amber-200'
        }`}>
          <div className="mr-3">
            {notification.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
            {notification.type === 'error' && <XCircle className="h-5 w-5 text-rose-600" />}
            {notification.type === 'info' && <AlertCircle className="h-5 w-5 text-amber-600" />}
          </div>
          <div className="text-xs font-semibold">{notification.message}</div>
        </div>
      )}

      {/* App Header */}
      <header id="app-header" className="h-16 border-b border-[#e5e0d5] flex items-center justify-between px-4 sm:px-8 bg-white sticky top-0 z-40 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#5a6a4a] rounded flex items-center justify-center shadow-sm">
            <div className="w-4 h-4 border-2 border-white rounded-full"></div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight uppercase">
              GigBoss<span className="text-[#5a6a4a]">AI</span>
            </h1>
            <span className="text-[9px] font-mono tracking-widest text-[#a09c94] uppercase font-bold hidden sm:inline">Autonomous Systems Corporation</span>
          </div>
          <span className="hidden md:inline-flex ml-2 px-2 py-0.5 rounded text-[9px] bg-[#e5e0d5] font-bold text-[#5a5a40] uppercase tracking-widest">
            Autonomous Mode Active
          </span>
        </div>

        {/* View Switch Overlay */}
        <div className="flex bg-[#f5f2ed] p-1 rounded-lg border border-[#e5e0d5]">
          <button
            id="btn-nav-ops"
            onClick={() => setView("operations")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
              view === "operations"
                ? "bg-white text-[#2d2a26] shadow-sm font-semibold"
                : "text-[#a09c94] hover:text-[#5a6a4a]"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Operations Control</span>
            <span className="sm:hidden">Ops</span>
          </button>
          <button
            id="btn-nav-work"
            onClick={() => setView("worker")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
              view === "worker"
                ? "bg-white text-[#2d2a26] shadow-sm font-semibold"
                : "text-[#a09c94] hover:text-[#5a6a4a]"
            }`}
          >
            <Briefcase className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Worker Portal</span>
            <span className="sm:hidden">Worker</span>
          </button>
        </div>

        {/* Treasury Summary */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase text-[#a09c94] font-bold tracking-widest">
              {paymentSystem === 'metamask' ? 'Wallet Balance' : 'Available Treasury'}
            </span>
            <span className="text-sm sm:text-base font-mono font-bold text-[#2d2a26]">
              {paymentSystem === 'metamask' && walletConnected && walletBalance !== null
                ? `${parseFloat(walletBalance).toFixed(4)}`
                : treasury.balance.toFixed(2)
              } <span className="text-[#5a6a4a] text-xs">MONAD</span>
            </span>
          </div>
          <button
            id="btn-reseed-state"
            onClick={handleResetDatabaseState}
            title="Reset system to preseeds"
            className="p-1.5 rounded-lg border border-[#e5e0d5] bg-[#fcfaf7] hover:bg-[#e5e0d5] text-[#2d2a26] transition-all hover:scale-105"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* VIEW 1: OPERATIONS SYSTEM - THE AGENT MIND */}
        {view === "operations" && (
          <div id="ops-view-container" className="flex-1 flex flex-col xl:flex-row overflow-y-auto xl:overflow-hidden p-4 sm:p-6 lg:p-8 gap-6">
            
            {/* Left rail - Active Gigs, Prompt Generator or Physical API Hub */}
            <div className="flex-1 flex flex-col gap-6 max-h-full xl:overflow-y-auto">
              
              {/* Web3 Billing Ledger settings console */}
              <div id="web3-ledger-console" className="bg-white border border-[#e5e0d5] rounded-xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-[#5a6a4a]" />
                    <h3 className="text-xs uppercase font-bold text-[#2d2a26] tracking-widest font-mono">Operations Billing Ledger Model</h3>
                  </div>
                  <p className="text-[11px] text-[#5a5a40]">
                    Verify model compliance details and route corporate payments either autonomously (Simulated Ledger) or with MetaMask.
                  </p>
                  <div className="flex gap-2 pt-1.5">
                    <button
                      onClick={() => togglePaymentSystem('simulated')}
                      className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                        paymentSystem === 'simulated'
                          ? "bg-[#2d2a26] text-white border-transparent"
                          : "bg-stone-50 text-stone-500 hover:text-stone-700 border-stone-200"
                      }`}
                    >
                      🏛️ Simulated Ledger (Fallback)
                    </button>
                    <button
                      onClick={() => togglePaymentSystem('metamask')}
                      className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                        paymentSystem === 'metamask'
                          ? "bg-[#e07a5f] text-white border-transparent shadow-sm"
                          : "bg-stone-50 text-stone-500 hover:text-stone-700 border-stone-200"
                      }`}
                    >
                      🦊 MetaMask tMONAD Core
                    </button>
                  </div>
                  
                  {paymentSystem === 'metamask' && (
                    <div className="flex flex-col gap-1.5 pt-2 border-t border-dashed border-[#e5e0d5] mt-2 sm:max-w-md">
                      <label id="auto-confirm-checkbox-label" className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          id="auto-confirm-checkbox"
                          type="checkbox"
                          checked={autoConfirmMode}
                          onChange={(e) => toggleAutoConfirmMode(e.target.checked)}
                          className="rounded border-amber-300 text-amber-600 focus:ring-amber-500 h-3.5 w-3.5 transition-all accent-amber-600 bg-amber-50"
                        />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 font-mono flex items-center gap-1">
                          🤖 Zero-Click Autonomous Auto-Confirm
                        </span>
                      </label>
                      <p className="text-[9px] text-[#8a7f6a] leading-normal font-sans">
                        Bypasses browser MetaMask popup confirmations entirely! Publishing approved work logs autonomously with Sovereign key-signatures directly to the Monad network.
                      </p>
                    </div>
                  )}
                </div>

                {paymentSystem === 'metamask' ? (
                  <div className="w-full md:w-auto bg-[#faf8f5] p-3 rounded-lg border border-[#e5e0d5] flex flex-col justify-center text-left font-mono text-[10px] min-w-[210px]">
                    {walletConnected && walletAddress ? (
                      <div className="space-y-1 w-full">
                        <div className="flex items-center justify-between gap-4 font-bold text-stone-700 border-b border-[#e5e0d5] pb-1">
                          <span className="text-[9px] uppercase tracking-wider text-stone-400">STATUS:</span>
                          <span className="text-emerald-700 uppercase tracking-widest text-[9px] flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            CONNECTED
                          </span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-[#a09c94]">Address:</span>
                          <span className="font-semibold text-stone-800">
                            {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#a09c94]">Network:</span>
                          <span className="font-semibold text-stone-800">{walletNetwork || "Querying..."}</span>
                        </div>
                        <div className="flex justify-between font-bold text-stone-800 bg-[#5a6a4a]/10 px-1.5 py-1 rounded mt-1">
                          <span className="text-[#5a6a4a]">Web3 Balance:</span>
                          <span>{walletBalance !== null ? `${walletBalance} ETH/tMONAD` : "Querying..."}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-2.5 flex flex-col items-center gap-2 w-full">
                        <span className="text-[#a09c94] uppercase tracking-widest text-[9px] font-bold">Web3 Core Locked</span>
                        <button
                          onClick={connectWallet}
                          className="w-full py-1.5 px-3 bg-[#e07a5f] hover:bg-[#c96348] text-white rounded font-bold uppercase text-[9px] tracking-wider transition-all cursor-pointer"
                        >
                          Connect MetaMask
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full md:w-auto bg-stone-50 p-3 rounded-lg border border-dashed border-stone-200 flex flex-col items-center justify-center text-center font-mono text-[10px] min-w-[210px] text-stone-400">
                    <span className="uppercase tracking-widest text-[8px] font-bold text-[#5a6a4a]">Simulated Active Vault</span>
                    <span className="mt-1 font-semibold text-stone-600">Balance: {treasury.balance.toFixed(2)} MONAD</span>
                    <span className="text-[9px] text-stone-400 italic">Settles automatically on client pre-authorizations</span>
                  </div>
                )}
              </div>

              {/* Strategic Hub Nav */}
              <div className="bg-white border border-[#e5e0d5] rounded-xl p-3 flex justify-between items-center shadow-sm">
                <div className="flex gap-2">
                  <button
                    onClick={() => setOpsSubTab("live")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      opsSubTab === "live"
                        ? "bg-[#5a6a4a] text-white shadow-sm"
                        : "text-[#a09c94] hover:text-[#5a6a4a] bg-transparent"
                    }`}
                  >
                    Active Terminal
                  </button>
                  <button
                    onClick={() => setOpsSubTab("intelligence")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      opsSubTab === "intelligence"
                        ? "bg-[#5a6a4a] text-white shadow-sm"
                        : "text-[#a09c94] hover:text-[#5a6a4a] bg-transparent"
                    }`}
                  >
                    Physical API Hub
                  </button>
                </div>
                <div className="hidden sm:block text-[10px] bg-[#5a6a4a]/5 border border-[#e5e0d5]/80 px-2 py-1 text-[#5a6a4a] rounded font-mono uppercase font-bold text-right">
                  Mempool: Active
                </div>
              </div>

              {opsSubTab === "live" ? (
                <>
                  {/* Strategic Goals Panel (Drafting) */}
                  <div id="panel-drafting-goal" className="bg-[#fcfaf7] border border-[#e5e0d5] rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3 border-b border-[#e5e0d5] pb-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-[#5a6a4a]" />
                        <h3 className="text-xs uppercase font-bold text-[#2d2a26] tracking-widest font-mono">Commission New Operational Goal</h3>
                      </div>
                      <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-mono font-medium">Gemini Ultra Engine</span>
                    </div>
                    
                    <p className="text-xs text-[#5a5a40] mb-4 leading-relaxed">
                      Enter a real-world task or auditing mission. GigBoss-AI will calculate a fair payout estimate, breakdown of precise requirements, and build a ready-to-publish smart contract draft.
                    </p>

                    <form onSubmit={handleAiDraftGig} className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-[#a09c94] uppercase tracking-wide mb-1">Business Goal / Inspection Target</label>
                        <textarea
                          id="input-business-goal"
                          value={businessGoal}
                          onChange={(e) => setBusinessGoal(e.target.value)}
                          placeholder="e.g., We need to check if the new clean coffee shop at 22 Baker St in London has our branding stickers on the front pane."
                          rows={2}
                          className="w-full text-xs p-3 rounded-lg border border-[#e5e0d5] bg-white focus:outline-none focus:ring-1 focus:ring-[#5a6a4a] text-[#2d2a26]"
                        />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] italic text-[#a09c94]">Example: Verify if a store shelf displays correct vertical packaging counts.</span>
                        <button
                          id="btn-ai-draft"
                          type="submit"
                          disabled={isGeneratingGig || !businessGoal.trim()}
                          className="flex items-center gap-2 px-4 py-2 bg-[#5a6a4a] hover:bg-[#4a583c] text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm disabled:opacity-50"
                        >
                          {isGeneratingGig ? (
                            <>
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              Analyzing Goal...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3.5 w-3.5" />
                              Draft with Gemini
                            </>
                          )}
                        </button>
                      </div>
                    </form>

                    {/* Interactive AI Preview Output */}
                    {draftGig && (
                      <div id="ai-draft-proposal" className="mt-4 p-4 bg-[#f9f7f2] border-dashed border-2 border-[#d6d1c7] rounded-lg animate-fade-in space-y-3">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#e5e0d5] pb-3">
                          <div className="flex-1 w-full">
                            <span className="text-[9px] bg-[#5a6a4a] text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">AI Proposed Contract</span>
                            <div className="mt-1">
                              <label className="block text-[8px] uppercase font-bold text-[#a09c94] mb-0.5">Agreement Name</label>
                              <input
                                type="text"
                                value={draftGig.title}
                                onChange={(e) => setDraftGig(prev => prev ? { ...prev, title: e.target.value } : null)}
                                className="w-full text-xs font-serif italic text-[#2d2a26] font-semibold bg-white border border-[#e5e0d5] px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-[#5a6a4a]"
                              />
                            </div>
                          </div>
                          
                          <div className="shrink-0 w-full md:w-auto">
                            <label className="block text-[9px] text-[#a09c94] uppercase font-bold mb-1 md:text-right">Set Reward Amount</label>
                            <div className="flex items-center gap-1.5 justify-start md:justify-end">
                              <input
                                id="input-custom-payout"
                                type="number"
                                step="0.5"
                                min="0.1"
                                value={draftGig.payout_monad}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value);
                                  setDraftGig(prev => prev ? { ...prev, payout_monad: isNaN(val) ? 0 : val } : null);
                                }}
                                className="w-20 text-xs font-mono font-bold text-[#5a6a4a] bg-white border border-[#e5e0d5] px-2 py-1 rounded text-right focus:outline-none focus:ring-1 focus:ring-[#5a6a4a]"
                              />
                              <span className="text-xs font-mono font-bold text-[#5a6a4a]">MONAD</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[8px] uppercase font-bold text-[#a09c94] mb-0.5">Contract Scope & Description</label>
                          <textarea
                            value={draftGig.description}
                            onChange={(e) => setDraftGig(prev => prev ? { ...prev, description: e.target.value } : null)}
                            rows={2}
                            className="w-full text-xs text-[#2d2a26] bg-white border border-[#e5e0d5] px-2 py-1.5 rounded focus:outline-none focus:ring-1 focus:ring-[#5a6a4a] resize-y"
                          />
                        </div>
                        
                        <div className="space-y-1.5">
                          <span className="block text-[10px] uppercase font-bold text-[#a09c94]">Field Directives Checklist:</span>
                          <div className="bg-white/60 p-2 rounded border border-[#e5e0d5]/60 space-y-1.5">
                            {draftGig.requirements.map((req, i) => (
                              <div key={i} className="flex gap-2 items-start text-xs text-[#2d2a26]">
                                <span className="text-[#5a6a4a] font-bold font-mono">[{i+1}]</span>
                                <span>{req}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-3 justify-end pt-3 border-t border-[#e5e0d5]">
                          <button
                            onClick={() => setDraftGig(null)}
                            className="px-3 py-1.5 text-xs text-[#a09c94] hover:text-[#2d2a26] font-bold uppercase transition-all"
                          >
                            Discard Draft
                          </button>
                          <button
                            id="btn-authorize-payout"
                            onClick={handlePublishGig}
                            className="px-4 py-2 bg-[#2d2a26] hover:bg-[#1f1d1a] text-white rounded-md text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all shadow-sm"
                          >
                            <Wallet className="h-3 w-3" />
                            Authorize & Fund Contract
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Active Contracts and Statistics */}
                  <div className="bg-white border border-[#e5e0d5] rounded-xl p-5">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#e5e0d5]">
                      <h3 className="text-xs uppercase font-bold tracking-widest text-[#2d2a26] font-mono">Current Funded Gigs Board</h3>
                      <span className="text-xs text-[#a09c94] font-mono">{gigs.length} Open Agreements</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-[#fcfaf7] p-3 rounded-lg border border-[#e5e0d5] flex items-center justify-between">
                        <div>
                          <span className="block text-[9px] uppercase tracking-wider text-[#a09c94] font-bold">Approved Payments</span>
                          <span className="text-sm font-mono font-bold text-[#2d2a26]">{treasury.paid.toFixed(2)} MONAD</span>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="bg-[#fcfaf7] p-3 rounded-lg border border-[#e5e0d5] flex items-center justify-between">
                        <div>
                          <span className="block text-[9px] uppercase tracking-wider text-[#a09c94] font-bold">Active Contracts</span>
                          <span className="text-sm font-mono font-bold text-[#2d2a26]">{treasury.activeContracts} Gigs</span>
                        </div>
                        <Briefcase className="h-5 w-5 text-[#5a6a4a]" />
                      </div>
                      <div className="bg-[#fcfaf7] p-3 rounded-lg border border-[#e5e0d5] flex items-center justify-between">
                        <div>
                          <span className="block text-[9px] uppercase tracking-wider text-[#a09c94] font-bold">Unsigned Capital</span>
                          <span className="text-sm font-mono font-bold text-[#2d2a26]">{treasury.balance.toFixed(2)} MONAD</span>
                        </div>
                        <Wallet className="h-5 w-5 text-amber-600" />
                      </div>
                    </div>

                    {/* List scroll */}
                    <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                      {gigs.length === 0 ? (
                        <div className="text-center py-8 text-[#a09c94] text-xs">
                          No active listings on the blockchain registry. Use the AI module to generate a goal!
                        </div>
                      ) : (
                        gigs.map((g) => (
                          <div
                            key={g.id}
                            className={`p-3 rounded-lg border text-xs transition-all pointer-events-auto ${
                              g.status === 'completed'
                                ? 'bg-[#f5f2ed]/30 border-[#e5e0d5]/60 opacity-70'
                                : 'bg-[#fcfaf7] hover:bg-[#f5f2ed] border-[#e5e0d5] shadow-sm'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                                    g.status === 'completed' 
                                      ? 'bg-[#e5e0d5] text-[#5a5a40]'
                                      : 'bg-[#5a6a4a]/10 text-[#5a6a4a]'
                                  }`}>
                                    {g.status}
                                  </span>
                                  <span className="text-[10px] text-[#a09c94] font-mono">{g.id}</span>
                                </div>
                                <h4 className="font-semibold text-sm text-[#2d2a26] leading-snug">{g.title}</h4>
                                <p className="text-[#5a5a40] text-xs mt-1 line-clamp-2">{g.description}</p>
                                <div className="flex gap-4 mt-2 text-[10px] text-[#a09c94] font-mono">
                                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {g.estimated_hours}h</span>
                                  <span>•</span>
                                  <span>{g.requirements.length} compliance milestones</span>
                                </div>
                              </div>
                              <div className="text-right flex flex-col justify-between items-end min-h-[60px]">
                                <span className="text-xs font-mono font-bold text-[#5a6a4a] block bg-[#5a6a4a]/5 px-2 py-1 rounded">
                                  {g.payout_monad} MONAD
                                </span>
                                <button
                                  onClick={() => {
                                    setView("worker");
                                    setSelectedGigId(g.id);
                                    showNotification("info", `Selected "${g.title}" as active worker objective.`);
                                  }}
                                  className="text-[10px] text-[#2d2a26] hover:text-[#5a6a4a] flex items-center gap-0.5 font-bold uppercase tracking-wider underline cursor-pointer mt-2"
                                >
                                  Simulate Work
                                  <ArrowRight className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              ) : (
                /* PHYSICAL API INTELLIGENCE HUB PANEL */
                <div id="intel-hub-panel" className="bg-[#fcfaf7] border border-[#e5e0d5] rounded-xl p-5 flex flex-col gap-6 shadow-sm animate-fade-in text-xs">
                  <div>
                    <h3 className="font-serif italic text-lg text-[#2d2a26] font-bold">Physical API Operational Blueprint</h3>
                    <p className="text-xs text-[#52524d] mt-1 leading-relaxed">
                      GigBoss-AI is an autonomous operations agent. It operates behind screens, onchain, and server-side. When it hits a physical barrier (such as checking billboards or retail shelf compliance) it programmatically spawns humans as <b>"Physical APIs"</b>, resolves the block, and continues the business pipeline.
                    </p>
                  </div>

                  {/* Flow chart layout */}
                  <div className="bg-white border border-[#e5e0d5] rounded-xl p-4">
                    <h4 className="text-[10px] uppercase font-mono tracking-widest text-[#a09c94] font-bold mb-3">Sovereign Agent Operational Loop</h4>
                    
                    <div className="relative">
                      {/* Grid representation of sequence */}
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative z-10 text-center">
                        <div className="p-2 bg-[#fcfaf7] border border-[#e5e0d5] rounded-lg">
                          <span className="block text-[14px] mb-1">🤖</span>
                          <span className="block text-[9px] font-bold uppercase tracking-wider text-[#5a6a4a]">1. Flow Gate</span>
                          <p className="text-[10px] text-[#a09c94] mt-0.5 leading-snug">Agent runs digital logic</p>
                        </div>
                        <div className="p-2 bg-amber-50/50 border border-amber-200 rounded-lg">
                          <span className="block text-[14px] mb-1">🧱</span>
                          <span className="block text-[9px] font-bold uppercase tracking-wider text-amber-700">2. Barrier</span>
                          <p className="text-[10px] text-[#a09c94] mt-0.5 leading-snug">Hits physical dependency</p>
                        </div>
                        <div className="p-2 bg-[#fcfaf7] border border-[#e5e0d5] rounded-lg">
                          <span className="block text-[14px] mb-1">📜</span>
                          <span className="block text-[9px] font-bold uppercase tracking-wider text-[#5a6a4a]">3. Escrow</span>
                          <p className="text-[10px] text-[#a09c94] mt-0.5 leading-snug">Funds MONAD on board</p>
                        </div>
                        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                          <span className="block text-[14px] mb-1">🏃</span>
                          <span className="block text-[9px] font-bold uppercase tracking-wider text-emerald-800">4. Physical API</span>
                          <p className="text-[10px] text-[#a09c94] mt-0.5 leading-snug">Human inputs proof</p>
                        </div>
                        <div className="p-2 bg-[#5a6a4a]/10 border border-[#5a6a4a]/20 rounded-lg">
                          <span className="block text-[14px] mb-1">🔑</span>
                          <span className="block text-[9px] font-bold uppercase tracking-wider text-[#5a6a4a]">5. Settlement</span>
                          <p className="text-[10px] text-[#a09c94] mt-0.5 leading-snug">Gemini audits & releases</p>
                        </div>
                      </div>
                      
                      {/* Connection arrow labels */}
                      <p className="text-[10px] italic text-[#a09c94] mt-3 text-right">
                        Each human completion acts as a real-world REST response to the active AI workflow.
                      </p>
                    </div>
                  </div>

                  {/* Interactive Categories list */}
                  <div className="border-t border-[#e5e0d5] pt-4">
                    <h4 className="text-xs font-mono uppercase tracking-wider font-bold mb-3 text-[#2d2a26]">Commercial Purpose Taxonomy (5 Core Vectors)</h4>
                    
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Category Switcher column */}
                      <div className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 w-full md:w-44 border-b md:border-b-0 md:border-r border-[#e5e0d5]">
                        {COMMERCIAL_CATEGORIES.map((cat, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveCategoryTab(i)}
                            className={`text-left px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                              activeCategoryTab === i
                                ? "bg-[#f5f2ed] border-l-2 border-[#5a6a4a] text-[#5a6a4a]"
                                : "text-[#a09c94] hover:text-[#2d2a26]"
                            }`}
                          >
                            <span className="mr-1.5">{cat.icon}</span>
                            {cat.title}
                          </button>
                        ))}
                      </div>

                      {/* Detail Column */}
                      <div className="flex-1 bg-white border border-[#e5e0d5] rounded-xl p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="text-[18px]">{COMMERCIAL_CATEGORIES[activeCategoryTab].icon}</span>
                            <span className="text-xs uppercase tracking-widest text-[#2d2a26] font-mono font-bold block mt-1">
                              {COMMERCIAL_CATEGORIES[activeCategoryTab].title}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-[#2d2a26] mt-3 leading-relaxed">
                          {COMMERCIAL_CATEGORIES[activeCategoryTab].desc}
                        </p>

                        <div className="mt-4 space-y-2 border-t border-[#f5f2ed] pt-3">
                          <div>
                            <span className="block text-[9px] font-bold uppercase tracking-wider text-[#a09c94]">Physical-World Boundary Trigger</span>
                            <p className="text-xs text-[#52524d] leading-normal">{COMMERCIAL_CATEGORIES[activeCategoryTab].why}</p>
                          </div>
                          <div>
                            <span className="block text-[9px] font-bold uppercase tracking-wider text-[#a09c94]">Value / Commercial Motive</span>
                            <p className="text-xs text-[#52524d] leading-normal">{COMMERCIAL_CATEGORIES[activeCategoryTab].motive}</p>
                          </div>
                          <div>
                            <span className="block text-[9px] font-bold uppercase tracking-wider text-[#a09c94]">Smart Verification Rules</span>
                            <p className="text-xs text-[#5a6a4a] leading-normal font-medium">{COMMERCIAL_CATEGORIES[activeCategoryTab].proof}</p>
                          </div>
                        </div>

                        {/* Interactive injection action */}
                        <div className="mt-4 pt-3 border-t border-[#f5f2ed]">
                          <button
                            onClick={() => {
                              setBusinessGoal(COMMERCIAL_CATEGORIES[activeCategoryTab].template);
                              setOpsSubTab("live");
                              showNotification("success", `Injected "${COMMERCIAL_CATEGORIES[activeCategoryTab].title}" goal template!`);
                            }}
                            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-[#5a6a4a] hover:bg-[#4a583c] text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            Inject Goal Template & Select active Terminal
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right side - Received Submissions & Multimodal Audit Evaluation Panel */}
            <div className="w-full xl:w-[480px] flex flex-col gap-6 max-h-full xl:overflow-y-auto">
              
              {/* Submission Reviews Queue */}
              <div className="bg-white border border-[#e5e0d5] rounded-xl p-5 flex flex-col flex-1 shadow-sm">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-[#e5e0d5]">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#5a6a4a]" />
                    <h3 className="text-xs uppercase font-bold tracking-widest text-[#2d2a26] font-mono">Proof Of Work Review Queue</h3>
                  </div>
                  <span className="text-xs bg-[#5a6a4a] text-white font-mono px-2 py-0.5 rounded-full">
                    {submissions.filter(s => s.status === 'pending').length} pending
                  </span>
                </div>

                {/* Scrollable list */}
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {submissions.length === 0 ? (
                    <div className="text-center py-6 text-[#a09c94] text-xs leading-relaxed">
                      No proofs are waiting in the audit mempool. Act as a gig-worker using the "Worker Portal" inside the header to dispatch model mock files!
                    </div>
                  ) : (
                    submissions.map((sub) => {
                      const associatedGig = gigs.find(g => g.id === sub.gigId);
                      return (
                        <div
                          key={sub.id}
                          id={`sub-item-${sub.id}`}
                          onClick={() => setSelectedSubmissionId(sub.id)}
                          className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                            selectedSubmissionId === sub.id
                              ? 'bg-[#fcfaf7] border-[#5a6a4a] shadow-sm'
                              : 'bg-white hover:bg-[#fcfaf7] border-[#e5e0d5]'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#2d2a26] font-mono">{sub.id}</span>
                              <span className="text-[10px] text-[#a09c94]">{sub.workerName}</span>
                            </div>
                            <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider ${
                              sub.status === 'APPROVED'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                                : sub.status === 'REJECTED'
                                  ? 'bg-rose-50 text-rose-800 border border-rose-100'
                                  : sub.status === 'REVISIONS_NEEDED'
                                    ? 'bg-amber-50 text-amber-800 border border-amber-100'
                                    : 'bg-cyan-50 text-cyan-800 border border-cyan-100 animate-pulse'
                            }`}>
                              {sub.status}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-[#2d2a26] line-clamp-1">
                            {associatedGig ? associatedGig.title : "Unknown Gig Target"}
                          </p>
                          <p className="text-[10px] text-[#5a5a40] line-clamp-1 italic mt-0.5">
                            "{sub.textProof}"
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Evaluation detail view */}
                {selectedSub ? (
                  <div id="evaluation-details-card" className="mt-5 p-4 bg-[#fcfaf7] rounded-lg border border-[#e5e0d5] flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-[#a09c94] block font-bold font-mono">Detailed Snapshot Audit</span>
                          <h4 className="text-sm font-serif italic text-[#2d2a26] font-semibold mt-0.5">
                            {selectedGigForSub ? selectedGigForSub.title : "Missing Title"}
                          </h4>
                          <span className="text-[10px] italic text-[#5a5a40] leading-tight block mt-1">
                            Submitted by <span className="font-mono text-[#a09c94] font-bold">{selectedSub.workerName}</span> at {new Date(selectedSub.submittedAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-[#a09c94] font-mono">Payout Ledger</span>
                          <span className="block text-xs font-bold font-mono text-[#5a6a4a]">
                            {selectedGigForSub ? selectedGigForSub.payout_monad : 0} MONAD
                          </span>
                        </div>
                      </div>

                      {/* Evidence Files Carousel/List */}
                      {((selectedSub.files && selectedSub.files.length > 0) || selectedSub.photoUrl) ? (
                        <div className="mb-4">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#a09c94] mb-1.5 font-mono">
                            Physical Evidence Logs ({selectedSub.files ? selectedSub.files.length : 1} file(s)):
                          </span>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {/* If structured files exist, render each */}
                            {selectedSub.files && selectedSub.files.length > 0 ? (
                              selectedSub.files.map((file, idx) => {
                                const isImg = file.type?.startsWith("image/") || (!file.type && file.url.startsWith("data:image"));
                                const isVid = file.type?.startsWith("video/") || (!file.type && file.url.startsWith("data:video"));
                                
                                return (
                                  <div key={idx} className="relative h-40 rounded-lg overflow-hidden border border-[#e5e0d5] bg-stone-100 shadow-inner font-mono">
                                    {isImg ? (
                                      file.url && !file.url.startsWith("data:") ? (
                                        <img
                                          src={file.url}
                                          alt={file.name || "field photo proof"}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-[#d6d1c7]">
                                          <ImageIcon className="h-7 w-7 text-[#5a5a40] opacity-45 mb-1" />
                                          <span className="text-[8px] text-[#5a5a40] font-mono uppercase bg-white/40 px-1.5 py-0.5 rounded">
                                            [Multimodal Image]
                                          </span>
                                        </div>
                                      )
                                    ) : isVid ? (
                                      file.url && !file.url.startsWith("data:") ? (
                                        <video
                                          src={file.url}
                                          className="w-full h-full object-cover"
                                          controls
                                          muted
                                        />
                                      ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-stone-200">
                                          <FileVideo className="h-7 w-7 text-[#5a5a40] opacity-60 mb-1" />
                                          <span className="text-[8px] text-[#5a5a40] font-mono uppercase bg-white/40 px-1.5 py-0.5 rounded animate-pulse">
                                            [Multimodal Video]
                                          </span>
                                        </div>
                                      )
                                    ) : (
                                      <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100">
                                        <FileText className="h-7 w-7 text-stone-600 opacity-50 mb-1" />
                                      </div>
                                    )}
                                    
                                    {/* Overlay title info */}
                                    <div className="absolute top-1 left-1 bg-black/60 text-white text-[7px] px-1 py-0.5 rounded uppercase tracking-wider font-bold">
                                      {isImg ? 'IMAGE' : isVid ? 'VIDEO' : 'FILE'}
                                    </div>
                                    
                                    <div className="absolute bottom-1 left-1 right-1 bg-black/60 text-white p-1 rounded text-[8px] truncate flex items-center gap-1 justify-between">
                                      <span className="truncate flex-1 font-mono">{file.name || `proof-file-${idx + 1}`}</span>
                                      <span className="text-[7px] bg-[#5a6a4a] text-white px-1 rounded uppercase tracking-tight">Active</span>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              /* Fallback to legacy single file representation */
                              <div className="relative h-44 rounded-lg overflow-hidden border border-[#e5e0d5] bg-gray-50 group shadow-inner col-span-2">
                                {selectedSub.photoUrl && !selectedSub.photoUrl.startsWith("data:") ? (
                                  <img
                                    src={selectedSub.photoUrl}
                                    alt="Audit evidence"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#d6d1c7] relative">
                                    <ImageIcon className="h-8 w-8 text-[#5a5a40] opacity-45 mb-2" />
                                    <span className="text-[10px] text-[#5a5a40] font-mono uppercase bg-white/45 px-2 py-0.5 rounded">
                                      [Multimodal Image Received]
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* Common Geolocation marker bar */}
                          <div className="mt-2 bg-white p-2 rounded-lg border border-[#e5e0d5] flex items-center justify-between text-[10px]">
                            <span className="text-[#a09c94] font-mono flex items-center gap-1 font-bold uppercase text-[9px]">
                              <MapPin className="h-3 w-3 text-rose-500" /> Geolocation Lock:
                            </span>
                            <span className="text-[#2d2a26] font-mono font-medium">{selectedSub.locationMetadata}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-[#e5e0d5]/40 rounded-lg text-center text-xs text-[#5a5a40] italic mb-3">
                          No evidence files are loaded with this record. Purely text-based operations.
                        </div>
                      )}

                      <div className="bg-white p-3 rounded-lg border border-[#e5e0d5] text-xs mb-3">
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-[#a09c94] mb-1 font-mono">Human Field Logs:</span>
                        <p className="text-[#2d2a26] leading-relaxed italic">"{selectedSub.textProof}"</p>
                      </div>

                      {/* AI Decision Mind */}
                      <div className="p-3 bg-[#f9f7f2] border-t-2 border-[#5a6a4a] rounded-b-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-[#5a6a4a] uppercase tracking-widest font-mono flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" />
                            AI Audit Analysis
                          </span>

                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            selectedSub.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : selectedSub.status === 'REJECTED'
                                ? 'bg-rose-100 text-rose-800'
                                : selectedSub.status === 'REVISIONS_NEEDED'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-cyan-100 text-cyan-800 animate-pulse'
                          }`}>
                            {selectedSub.status}
                          </span>
                        </div>

                        {selectedSub.evaluation ? (
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between text-[11px] mb-1 font-mono">
                                <span>Agent Trust Confidence Rating:</span>
                                <span>{(selectedSub.evaluation.confidence_score * 100).toFixed(1)}%</span>
                              </div>
                              <div className="w-full h-1 bg-[#e5e0d5] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#5a6a4a] transition-all"
                                  style={{ width: `${selectedSub.evaluation.confidence_score * 100}%` }}
                                ></div>
                              </div>
                            </div>
                            <p className="text-[11px] text-[#5a5a40] leading-relaxed italic bg-white p-2 rounded border border-[#e5e0d5]/60">
                              "{selectedSub.evaluation.reasoning}"
                            </p>
                            {selectedSub.evaluation.payout_trigger && (
                              <div className="flex flex-col gap-1 mt-2 p-2.5 bg-emerald-50 rounded border border-emerald-100 text-[10px] text-emerald-800 font-mono">
                                <div className="flex items-center gap-1.5 font-bold">
                                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                  {(selectedSub.payoutMode === "metamask" || paymentSystem === "metamask") 
                                    ? "Autonomous on-chain settlement successful! Disbursed directly from AI operator."
                                    : "Treasury execution completed. Payment settled successfully."}
                                </div>
                                {selectedSub.txHash && (
                                  <div className="text-[9px] text-[#425a37] select-all mt-1 bg-white/60 p-2.5 rounded border border-emerald-100 font-bold flex flex-col gap-1">
                                    <div className="truncate"><span className="text-emerald-700">Tx Hash:</span> {selectedSub.txHash}</div>
                                    <a 
                                      href={`https://testnet.monadexplorer.com/tx/${selectedSub.txHash}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-amber-700 hover:text-amber-800 hover:underline font-mono font-bold flex items-center gap-1 mt-1 shrink-0"
                                    >
                                      🔗 View transaction on Monad Explorer →
                                    </a>
                                  </div>
                                )}
                              </div>
                            )}

                            {selectedSub.status === "APPROVED" && !selectedSub.evaluation.payout_trigger && (selectedSub.payoutMode === "metamask" || paymentSystem === "metamask") && (
                              <div className="p-3 bg-[#fdfaf2] rounded-lg border border-amber-200 mt-2 space-y-2">
                                <div className="flex items-center gap-2">
                                  <Wallet className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
                                  <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wide font-mono">MetaMask Dispatch Pending</span>
                                </div>
                                <p className="text-[10px] text-amber-800 leading-normal font-sans">
                                  The AI auditor approved this task! Zero-click MetaMask dispatch was initiated. Please sign/confirm the transaction in your connected wallet.
                                </p>
                                <div className="text-[9px] font-mono text-stone-600 bg-white/80 p-2 rounded border border-stone-200/60 flex flex-col gap-1">
                                  <div className="flex justify-between">
                                    <span>Recipient:</span>
                                    <span className="font-semibold text-stone-800 truncate max-w-[200px]">{selectedSub.workerAddress || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"}</span>
                                  </div>
                                  <div className="flex justify-between border-t border-dashed border-stone-200/25 pt-1">
                                    <span>Amount from Wallet:</span>
                                    <span className="font-bold text-emerald-700">{selectedGigForSub ? selectedGigForSub.payout_monad : 0} MON</span>
                                  </div>
                                </div>
                                {!walletConnected ? (
                                  <button
                                    type="button"
                                    onClick={connectWallet}
                                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-[#e07a5f] hover:bg-[#c96348] text-white rounded text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm font-mono"
                                  >
                                    <Wallet className="h-3.5 w-3.5" />
                                    Connect MetaMask to Sign
                                  </button>
                                ) : (
                                  <div className="flex flex-col gap-1">
                                    <button
                                      type="button"
                                      disabled={isPayingOnChain === selectedSub.id}
                                      onClick={() => handleOnChainPayment(selectedSub)}
                                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-[#e07a5f] hover:bg-[#c96348] text-white rounded text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm disabled:opacity-50 font-mono"
                                    >
                                      {isPayingOnChain === selectedSub.id ? (
                                        <>
                                          <RefreshCw className="h-3 w-3 animate-spin" />
                                          Awaiting Wallet Signature...
                                        </>
                                      ) : (
                                        <>
                                          <RefreshCw className="h-3 w-3" />
                                          Retry MetaMask Signature
                                        </>
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isPayingOnChain === selectedSub.id}
                                      onClick={() => handleAutonomousPayment(selectedSub)}
                                      className="w-full flex items-center justify-center gap-1.5 py-1 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-[9px] font-bold uppercase transition-all cursor-pointer border border-stone-300 disabled:opacity-50 font-mono"
                                    >
                                      <Cpu className="h-3.5 w-3.5 text-stone-500 animate-pulse" />
                                      Bypass Signature Autonomously
                                    </button>
                                    <span className="text-[8px] text-[#8a7f6a] text-center font-mono mt-1">
                                      Paying directly from: {walletAddress?.substring(0, 6)}...{walletAddress?.substring(38)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-2 flex flex-col items-center gap-1">
                            <RefreshCw className="h-4 w-4 text-[#5a6a4a] animate-spin" />
                            <span className="text-[10px] text-[#a09c94] font-mono uppercase tracking-widest">
                              Evaluating snap & geo logs...
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#fcfaf7] border border-dashed border-[#e5e0d5] text-center rounded-lg mt-5">
                    <ShieldCheck className="h-10 w-10 text-[#a09c94] mb-2" />
                    <span className="font-serif italic text-sm text-[#2d2a26]">Autonomous Sentry Idle</span>
                    <p className="text-xs text-[#5a5a40] max-w-xs mt-1">
                      Choose any active proof item from the review queue above to inspect visual/text verification and financial rules.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
          </div>
        )}

        {/* VIEW 2: FIELD WORKER SIMULATOR APP */}
        {view === "worker" && (
          <div id="worker-view-container" className="flex-1 flex flex-col xl:flex-row p-4 sm:p-6 lg:p-8 gap-6 overflow-y-auto">
            
            {/* Left Column: Select gig & input proofs */}
            <div className="flex-1 shrink-0 bg-white border border-[#e5e0d5] rounded-xl p-5 shadow-sm max-w-4xl mx-auto w-full">
              
              <div className="flex items-center justify-between mb-4 border-b border-[#e5e0d5] pb-2">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-[#5a6a4a]" />
                  <h3 className="text-xs uppercase font-bold text-[#2d2a26] tracking-widest font-mono">Field Operations Handheld Emulator</h3>
                </div>
                <span className="text-[9px] bg-amber-50 text-amber-800 px-2.5 py-1 rounded font-mono font-medium tracking-wide">
                  GPS & Snapshot Integrator Sandbox
                </span>
              </div>

              <form onSubmit={handleWorkerSubmit} className="space-y-4">
                
                {/* Contract Target selection */}
                <div>
                  <label className="block text-[10px] font-bold text-[#a09c94] uppercase tracking-wide mb-1">
                    Select Active Blockchain Contract Objective:
                  </label>
                  <select
                    id="select-contract-worker"
                    value={selectedGigId}
                    onChange={(e) => setSelectedGigId(e.target.value)}
                    className="w-full text-xs p-3 rounded-lg border border-[#e5e0d5] bg-[#fcfaf7] text-[#2d2a26] font-semibold focus:outline-none"
                  >
                    <option value="" disabled>-- Choose an open contract statement --</option>
                    {gigs.filter(g => g.status !== 'completed').map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.id} • {g.title} ({g.payout_monad} MONAD)
                      </option>
                    ))}
                    {gigs.filter(g => g.status !== 'completed').length === 0 && (
                      <option disabled>No open tasks available. Please construct a business objective first!</option>
                    )}
                  </select>
                </div>

                {/* Requirements display for chosen gig */}
                {gigs.find(g => g.id === selectedGigId) && (
                  <div className="p-4 bg-[#f9f7f2] border border-[#d6d1c7] rounded-lg text-xs leading-relaxed">
                    <span className="block text-[10px] font-bold text-[#a09c94] uppercase tracking-wide mb-1.5">
                      Explicit Verification Rules to Satisfy:
                    </span>
                    <ul className="space-y-1.5 text-[#5a5a40]">
                      {gigs.find(g => g.id === selectedGigId)?.requirements.map((req, i) => (
                        <li key={i} className="flex gap-2 items-start">
                          <span className="text-[#5a6a4a] font-bold font-mono">✓</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Fast Sandbox Templates Row */}
                <div className="bg-[#f5f2ed] p-4 rounded-lg border border-[#e5e0d5]">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles className="h-3.5 w-3.5 text-[#5a6a4a]" />
                    <span className="text-[10px] font-bold text-[#2d2a26] uppercase tracking-wider font-mono">
                      Fast Sandbox Demonstration Templates:
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5a5a40] mb-3 leading-relaxed">
                    Since you are accessing the dev preview from an isolated sandbox, loading live camera snapshots can be difficult. Click any of the precompiled worker verification bundles below to auto-inject photo assets, textual answers, and mock geotags of varying degrees of accuracy for immediate review:
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {TEST_PROOF_BUNDLES.map((bundle, index) => (
                      <button
                        key={index}
                        id={`btn-sandbox-${index}`}
                        type="button"
                        onClick={() => injectSandboxProof(bundle)}
                        className="px-2.5 py-1.5 bg-white border border-[#e5e0d5] rounded-md text-[10px] hover:border-[#5a6a4a] hover:bg-[#f9f7f2] transition-all flex items-center gap-1.5 font-medium shadow-sm hover:scale-102"
                      >
                        <ImageIcon className="h-3 w-3 text-slate-500" />
                        <span className="font-semibold text-[#2d2a26]">{bundle.name}</span>
                        <span className={`text-[8px] px-1 rounded uppercase tracking-wider ${
                          bundle.statusType === 'compliant'
                            ? 'bg-emerald-50 text-emerald-800'
                            : bundle.statusType === 'blurry'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                        }`}>
                          {bundle.statusType}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Worker identity parameters */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#a09c94] uppercase tracking-wide mb-1">
                      Worker Public Wallet Identity / Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-[#a09c94]" />
                      </div>
                      <input
                        id="input-worker-name"
                        type="text"
                        value={workerName}
                        onChange={(e) => setWorkerName(e.target.value)}
                        placeholder="e.g., Alex Mercer"
                        className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-[#e5e0d5] bg-white text-[#2d2a26]"
                        required
                      />
                    </div>
                  </div>

                  {/* Worker EVM target address */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#a09c94] uppercase tracking-wide mb-1 flex justify-between items-center">
                      <span>Receiving EVM Wallet Address</span>
                      <button
                        type="button"
                        onClick={autofillWorkerAddress}
                        className="text-[9px] text-[#5a6a4a] hover:underline uppercase font-bold"
                      >
                        Auto-fill Connected
                      </button>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Wallet className="h-4 w-4 text-amber-600" />
                      </div>
                      <input
                        id="input-worker-address"
                        type="text"
                        value={workerAddress}
                        onChange={(e) => setWorkerAddress(e.target.value)}
                        placeholder="e.g., 0x7099... (tMONAD)"
                        className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-[#e5e0d5] bg-white text-[#2d2a26] font-mono font-medium"
                      />
                    </div>
                  </div>

                  {/* Geotag simulation parameters */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#a09c94] uppercase tracking-wide mb-1">
                      Simulated Local GPS Geotag Metadata
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-4 w-4 text-[#a09c94]" />
                      </div>
                      <input
                        id="input-worker-location"
                        type="text"
                        value={locationValue}
                        onChange={(e) => setLocationValue(e.target.value)}
                        placeholder="e.g., 52.5298° N, 13.4019° E (Berlin Mitte)"
                        className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-[#e5e0d5] bg-white text-[#2d2a26]"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* File evidence uploader (1+ multiple files, support images and videos) */}
                <div>
                  <label className="block text-[10px] font-bold text-[#a09c94] uppercase tracking-wide mb-1.5 flex justify-between items-center">
                    <span>Uploaded Evidence Attachments ({uploadedFiles.length} file(s) - Images or Videos)</span>
                    <span className="text-[9px] text-[#5a6a4a] lowercase font-normal italic">*Supports 1+ video or image files</span>
                  </label>
                  
                  {/* Grid of uploaded files */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    {uploadedFiles.map((file, idx) => {
                      const isImage = file.type.startsWith("image/");
                      const isVideo = file.type.startsWith("video/");
                      return (
                        <div key={idx} className="relative h-32 rounded-lg overflow-hidden border border-[#e5e0d5] bg-[#fdfdfc] group shadow-sm flex flex-col justify-between">
                          <div className="flex-1 flex items-center justify-center bg-stone-100 overflow-hidden relative">
                            {isImage ? (
                              <img
                                src={file.url}
                                alt={file.name}
                                className="w-full h-full object-cover"
                              />
                            ) : isVideo ? (
                              <video
                                src={file.url}
                                className="w-full h-full object-cover"
                                controls
                                muted
                                playsInline
                              />
                            ) : (
                              <div className="flex flex-col items-center">
                                <FileText className="h-6 w-6 text-[#a09c94] opacity-70" />
                              </div>
                            )}
                            
                            {/* Badges */}
                            <div className="absolute top-1 left-1 flex gap-1">
                              <span className={`text-[8px] px-1 py-0.5 rounded uppercase tracking-wider text-white ${isImage ? 'bg-indigo-600' : 'bg-rose-600'}`}>
                                {isImage ? 'IMAGE' : 'VIDEO'}
                              </span>
                            </div>
                          </div>
                          
                          {/* File metadata footer */}
                          <div className="p-1 px-2 bg-[#fcfaf7] border-t border-[#e5e0d5] text-[9px] truncate text-stone-600 font-mono font-bold flex justify-between items-center gap-1">
                            <span className="truncate flex-1" title={file.name}>{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeUploadedFile(idx)}
                              className="text-rose-600 hover:text-rose-800 p-0.5"
                              title="Delete attachment"
                            >
                              <Trash2 className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Add attachment tile */}
                    {uploadedFiles.length < 6 && (
                      <label className="h-32 rounded-lg border-2 border-dashed border-[#e5e0d5] hover:border-[#5a6a4a] bg-[#fcfaf7] hover:bg-[#f9f7f2] flex flex-col items-center justify-center text-center p-3 cursor-pointer transition-colors group">
                        <Plus className="h-5 w-5 text-[#a09c94] mb-1 group-hover:text-[#5a6a4a]" />
                        <span className="text-[10px] text-[#2d2a26] font-semibold">Add Image / Video</span>
                        <p className="text-[8px] text-[#a09c94] mt-0.5 leading-snug">
                          Upload clips or images.
                        </p>
                        <input
                          id="file-attachments-upload"
                          type="file"
                          accept="image/*,video/*"
                          multiple
                          onChange={handleLocalFilesUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  
                  {/* Status Indicator & drag notice */}
                  <div className="flex items-center justify-between text-[10px] text-[#a09c94] font-mono">
                    <span>
                      {imageUploadStatus ? `Status: ${imageUploadStatus}` : "Select files above or click quick-sandbox buttons to fill files."}
                    </span>
                    <span>Supports multiple selection</span>
                  </div>
                </div>

                {/* Worker text observations */}
                <div>
                  <label className="block text-[10px] font-bold text-[#a09c94] uppercase tracking-wide mb-1">
                    Text-Based Observations & Verification Proof Details
                  </label>
                  <textarea
                    id="input-worker-text-proof"
                    value={textProofValue}
                    onChange={(e) => setTextProofValue(e.target.value)}
                    placeholder="Provide a descriptive answer checking the status details exactly matching open requirements..."
                    rows={3}
                    className="w-full text-xs p-3 rounded-lg border border-[#e5e0d5] bg-white focus:outline-none focus:ring-1 focus:ring-[#5a6a4a] text-[#2d2a26]"
                    required
                  />
                  <span className="text-[10px] text-[#a09c94] block mt-1">
                    *Ensure to follow physical instructions exactly. Blurry imagery or nonconformance will trigger AI rejection logs.
                  </span>
                </div>

                {/* Submit button */}
                <div className="pt-3 border-t border-[#e5e0d5] flex justify-end">
                  <button
                    id="btn-worker-submit-proof"
                    type="submit"
                    disabled={isSubmittingProof || !selectedGigId}
                    className="px-6 py-3 bg-[#2d2a26] hover:bg-[#1f1d1a] disabled:opacity-50 text-white rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                  >
                    {isSubmittingProof ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Verifying Secure Channels...
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        Dispatch Proof to Autonomous Auditor
                      </>
                    )}
                  </button>
                </div>

              </form>

            </div>

          </div>
        )}

      </main>

      {/* System Footer Bar with Metrics */}
      <footer id="app-footer" className="h-12 border-t border-[#e5e0d5] px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between text-[10px] text-[#a09c94] bg-[#fcfaf7] shrink-0 gap-2 py-2 sm:py-0">
        <div className="flex gap-4 sm:gap-6 uppercase font-bold tracking-widest">
          <span>Simulation Mode</span>
          <span>Avg response latency: ~2.4s</span>
          <span>Ledger Network: Monad Testnet Grid v1</span>
        </div>
        
        {/* Dynamic transaction monitor log */}
        <div className="font-mono flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          {logs.length > 0 ? (
            <span className="line-clamp-1 max-w-[280px] sm:max-w-[400px]">
              {logs[0].message}
            </span>
          ) : (
            <span>Ledger Idle • Ready</span>
          )}
        </div>
      </footer>
    </div>
  );
}
