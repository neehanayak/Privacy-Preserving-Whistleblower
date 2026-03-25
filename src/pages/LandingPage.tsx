import { motion } from "framer-motion";
import {
  Circle,
  ExternalLink,
  Shield,
  Eye,
  Lock,
  FileText,
  Zap,
  Globe,
} from "lucide-react";
import { Navbar } from "../components/Navbar";

function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}

function FloatingParticle({
  delay = 0,
  duration = 20,
  x = "0%",
  y = "0%",
  size = 8,
  color = "emerald",
}: {
  delay?: number;
  duration?: number;
  x?: string;
  y?: string;
  size?: number;
  color?: string;
}) {
  const colors = {
    emerald: "bg-emerald-400/40",
    lime: "bg-lime-400/40",
    amber: "bg-amber-400/40",
  };

  return (
    <motion.div
      initial={{ opacity: 0.3, scale: 0.8 }}
      animate={{
        opacity: [0.3, 0.7, 0.3],
        scale: [0.8, 1.2, 0.8],
        y: [0, -150, 0],
        x: [0, 50, -30, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
        times: [0, 0.5, 1],
      }}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
      }}
      className={cn("rounded-full blur-sm", colors[color as keyof typeof colors])}
    />
  );
}

function AnimatedGrid() {
  return (
    <div className="absolute inset-0 opacity-10">
      <motion.div
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
        className="w-full h-full"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(16, 185, 129, 0.15) 1px, transparent 1px),
                           linear-gradient(to bottom, rgba(16, 185, 129, 0.15) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}

function GlassmorphicOrb({
  className,
  delay = 0,
  size = 300,
  gradient = "from-emerald-200/40",
  duration = 20,
}: {
  className?: string;
  delay?: number;
  size?: number;
  gradient?: string;
  duration?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 2,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{
          y: [0, 40, 0],
          x: [0, 20, 0],
          rotate: [0, 5, -5, 0],
          scale: [1, 1.08, 0.95, 1],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.33, 0.66, 1],
        }}
        style={{
          width: size,
          height: size,
        }}
        className={cn(
          "rounded-[40%_60%_70%_30%/40%_50%_60%_50%]",
          "bg-gradient-to-br to-transparent",
          gradient,
          "backdrop-blur-3xl border border-emerald-200/30",
          "shadow-[0_8px_32px_0_rgba(16,185,129,0.2)]"
        )}
      />
    </motion.div>
  );
}

function HeroGeometric({
  badge = "WHISTLEBLOWING SYSTEM",
  title1 = "Proof-Speak",
  title2 = "A Privacy-Preserving Whistleblower Reporting System.",
}: {
  badge?: string;
  title1?: string;
  title2?: string;
}) {
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  };

  return (
    <div
      id="home"
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
    >
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <div className="text-center px-4 max-w-3xl mx-auto">
          <motion.div
            custom={0}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card bg-emerald-50/80 border border-emerald-200/70"
          >
            <Circle className="h-2 w-2 fill-emerald-400/90 text-emerald-400" />
            <span className="text-xs sm:text-sm text-emerald-900/80 tracking-wide">
              {badge}
            </span>
          </motion.div>

          <motion.div
            custom={1}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-semibold mb-6 md:mb-7 tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-emerald-900 via-emerald-800 to-lime-800">
                {title1}
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 via-lime-700 to-amber-700">
                {title2}
              </span>
            </h1>
          </motion.div>

          <motion.div
            custom={2}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <p className="text-sm sm:text-base md:text-lg text-[#445547]/90 mb-7 leading-relaxed font-light tracking-wide">
              Submit encrypted, rate-limited reports from your browser using
              zero-knowledge proofs. The chain only ever sees ciphertext and
              protocol metadata—never your identity.
            </p>
          </motion.div>

          <motion.div
            custom={3}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row gap-3 justify-center items-center"
          >
            <button
              onClick={() => (window.location.href = "/app")}
              className="btn-primary-enhanced inline-flex items-center gap-3 px-8 py-3 rounded-full font-mono text-sm sm:text-base font-semibold tracking-wider"
            >
              <span>Open App</span>
              <ExternalLink className="w-5 h-5" />
            </button>

            <button
              onClick={() =>
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="btn-secondary-glass inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm"
            >
              Learn how it works
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  delay = 0,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      viewport={{ once: true }}
      className="group relative"
    >
      <div className="glass-card rounded-3xl p-7 h-full hover:soft-glow-green bg-emerald-50/70 border border-emerald-100/80">
        <div className="relative mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-200/70 to-lime-200/70 flex items-center justify-center border border-emerald-300/70 shadow-md">
            <Icon className="w-6 h-6 text-emerald-900/90" />
          </div>
        </div>

        <div className="relative">
          <h3 className="text-lg font-semibold text-emerald-950 mb-2">
            {title}
          </h3>
          <p className="text-sm text-[#445547]/90 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: Shield,
      title: "Zero-Knowledge Privacy",
      description:
        "Verify a report comes from a valid identity without learning which one. Moderators see legitimacy, not identity.",
    },
    {
      icon: Lock,
      title: "Client-Side Encryption",
      description:
        "Reports are encrypted in the browser with a moderator key. Storage holds ciphertext plus protocol metadata only.",
    },
    {
      icon: Eye,
      title: "Anonymous Reporting",
      description:
        "Eligibility uses a pseudonymous wallet, but the address is never stored with the report.",
    },
    {
      icon: FileText,
      title: "Verifiable Evidence",
      description:
        "Messages and attachments are encrypted together. Tampering breaks decryption, preserving integrity.",
    },
    {
      icon: Zap,
      title: "Epoch-Based Rate Limiting",
      description:
        "Nullifier-style rate limits: at most one report per epoch per identity, while keeping epochs unlinkable.",
    },
    {
      icon: Globe,
      title: "Minimal, Auditable Crypto App",
      description:
        "A compact prototype: encryption, anonymous eligibility, and rate limiting, all surfaced through a small, inspectable UI.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  return (
    <section
      id="features"
      className="relative py-20 px-4 overflow-hidden"
    >
      <div className="relative max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-5 bg-emerald-50/80 border border-emerald-200/80">
            <Circle className="h-2 w-2 fill-emerald-400/90 text-emerald-400" />
            <span className="text-xs sm:text-sm text-emerald-900/80 tracking-wide">
              Features
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-900 via-emerald-800 to-lime-800">
              Secure Anonymous Reports
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 via-lime-700 to-amber-700 text-lg md:text-2xl">
              Whistleblowing (Course Project)
            </span>
          </h2>

          <p className="text-sm sm:text-base text-[#445547]/90 max-w-2xl mx-auto leading-relaxed">
            Built for an Introduction to Cryptography course. The aim is to
            implement encryption, anonymous identity, and rate limiting in a
            whistleblower web app you can actually run and reason about.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7"
        >
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 0.08}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer
      id="footer"
      className="relative bg-emerald-950/70 border-t border-emerald-300/40 backdrop-blur-xl"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-300/20 via-transparent to-lime-200/20" />
      <div className="relative max-w-6xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="text-emerald-50/85 text-xs sm:text-sm">
            Research prototype for a graduate cryptography course, inspired by
            an earlier Midnight hackathon project
            <a
              href="https://github.com/Neilblaze/WhistleB"
              target="_blank"
              rel="noopener noreferrer"
              className="underline ml-1 text-lime-200 hover:text-lime-100 transition-colors"
            >
              Proof-Speak
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

export const LandingPage = () => {
  return (
    <div className="min-h-screen animated-gradient-bg text-[#233127] font-outfit">
      <Navbar />
      
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <AnimatedGrid />

        <FloatingParticle delay={0} duration={25} x="10%" y="20%" size={12} color="emerald" />
        <FloatingParticle delay={3} duration={28} x="80%" y="30%" size={8} color="lime" />
        <FloatingParticle delay={6} duration={32} x="15%" y="70%" size={10} color="amber" />
        <FloatingParticle delay={2} duration={26} x="70%" y="60%" size={14} color="emerald" />
        <FloatingParticle delay={5} duration={30} x="40%" y="80%" size={6} color="lime" />
        <FloatingParticle delay={8} duration={29} x="90%" y="15%" size={9} color="amber" />
        <FloatingParticle delay={4} duration={27} x="25%" y="40%" size={11} color="emerald" />
        <FloatingParticle delay={7} duration={31} x="60%" y="25%" size={7} color="lime" />

        <GlassmorphicOrb
          delay={0.2}
          duration={22}
          size={400}
          gradient="from-emerald-200/30"
          className="top-[10%] left-[-5%]"
        />
        <GlassmorphicOrb
          delay={0.4}
          duration={26}
          size={350}
          gradient="from-lime-200/25"
          className="top-[60%] right-[-8%]"
        />
        <GlassmorphicOrb
          delay={0.6}
          duration={24}
          size={280}
          gradient="from-amber-200/20"
          className="bottom-[15%] left-[8%]"
        />
        <GlassmorphicOrb
          delay={0.5}
          duration={20}
          size={200}
          gradient="from-emerald-300/35"
          className="top-[20%] right-[15%]"
        />
        <GlassmorphicOrb
          delay={0.3}
          duration={28}
          size={320}
          gradient="from-lime-200/20"
          className="top-[120%] right-[-5%]"
        />
        <GlassmorphicOrb
          delay={0.5}
          duration={24}
          size={250}
          gradient="from-emerald-200/25"
          className="top-[140%] left-[-3%]"
        />
      </div>

      <div className="relative z-10">
        <HeroGeometric />
        <FeaturesSection />
        <Footer />
      </div>
    </div>
  );
};

export default LandingPage;
