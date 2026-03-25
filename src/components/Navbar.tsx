import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Menu, X, Laptop2 } from "lucide-react";

interface NavbarProps {
  showHomeButton?: boolean;
}

export const Navbar = ({ showHomeButton = false }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navigateTo = (path: string) => {
    window.location.href = path;
    setIsOpen(false);
  };

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 w-full py-4 px-4"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
    >
      <div className="flex justify-center w-full">
        <div className="glass-card flex items-center justify-between px-6 py-3 rounded-full w-full max-w-3xl relative border border-emerald-100/70 bg-emerald-50/60 shadow-lg soft-glow-green">
          {/* Soft highlight behind logo + menu */}
          <div className="absolute inset-0 rounded-full pointer-events-none bg-gradient-to-r from-emerald-100/60 via-transparent to-amber-100/50 opacity-80" />

          {/* Logo */}
          <div className="flex items-center relative z-10">
            <motion.div
              className="w-9 h-9 mr-6"
              initial={{ scale: 0.9, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              whileHover={{ rotate: 8, scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-400 to-lime-400 flex items-center justify-center shadow-xl soft-glow-green border border-emerald-200/70">
                <Laptop2 className="w-4 h-4 text-emerald-950" />
              </div>
            </motion.div>

            <div className="hidden sm:flex flex-col">
              <span className="text-xs uppercase tracking-[0.18em] text-emerald-700/80 font-semibold">
                Proof-Speak
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 relative z-10">
            {[
              { name: "Home", path: "/" },
              { name: "Submit Report", path: "/app" },
              { name: "Moderator", path: "/moderator" },
              { name: "Statistics", path: "/statistics" },
            ].map((item) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                whileHover={{ scale: 1.06, y: -1 }}
              >
                <button
                  onClick={() => navigateTo(item.path)}
                  className="relative text-sm text-emerald-950/80 hover:text-emerald-900 font-medium tracking-wide px-2 py-1 rounded-full transition-colors"
                >
                  <span>{item.name}</span>
                  <span className="absolute inset-x-2 -bottom-1 h-[2px] bg-gradient-to-r from-emerald-300/0 via-emerald-400/80 to-emerald-300/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </motion.div>
            ))}
          </nav>

          {/* Desktop CTA Button */}
          <motion.div
            className="hidden md:block relative z-10"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
          >
            {showHomeButton ? (
              <button
                onClick={() => navigateTo("/")}
                className="btn-primary-enhanced inline-flex items-center justify-center px-5 py-2 text-sm rounded-full font-medium tracking-wide shadow-md"
              >
                Back to Home
              </button>
            ) : (
              <button
                onClick={() => navigateTo("/app")}
                className="btn-primary-enhanced inline-flex items-center justify-center px-5 py-2 text-sm rounded-full font-medium tracking-wide shadow-md"
              >
                Get Started
              </button>
            )}
          </motion.div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden flex items-center relative z-10 rounded-full bg-emerald-100/50 p-1.5 border border-emerald-200/70"
            onClick={toggleMenu}
            whileTap={{ scale: 0.9 }}
          >
            <Menu className="h-5 w-5 text-emerald-900" />
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-[#0f1720]/80 backdrop-blur-2xl z-50 pt-24 px-6 md:hidden"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Fancy gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-300/25 via-emerald-100/5 to-amber-200/25" />

            <motion.button
              className="absolute top-6 right-6 p-2 rounded-full bg-emerald-900/40 border border-emerald-300/40 shadow-md"
              onClick={toggleMenu}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <X className="h-5 w-5 text-emerald-50" />
            </motion.button>

            <div className="relative flex flex-col space-y-7">
              {[
                { name: "Home", path: "/" },
                { name: "Submit Report", path: "/app" },
                { name: "Moderator", path: "/moderator" },
                { name: "Statistics", path: "/statistics" },
              ].map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 + 0.1 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <button
                    onClick={() => navigateTo(item.path)}
                    className="w-full text-lg text-emerald-50 font-medium tracking-wide transition-colors text-left px-2 py-2 rounded-xl bg-emerald-900/40 border border-emerald-300/30 hover:bg-emerald-800/60 hover:border-emerald-200/60 shadow-md"
                  >
                    {item.name}
                  </button>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                exit={{ opacity: 0, y: 20 }}
                className="pt-6"
              >
                {showHomeButton ? (
                  <button
                    onClick={() => navigateTo("/")}
                    className="btn-primary-enhanced inline-flex items-center justify-center w-full px-5 py-3 text-base rounded-full font-medium tracking-wide shadow-lg"
                  >
                    Back to Home
                  </button>
                ) : (
                  <button
                    onClick={() => navigateTo("/app")}
                    className="btn-primary-enhanced inline-flex items-center justify-center w-full px-5 py-3 text-base rounded-full font-medium tracking-wide shadow-lg"
                  >
                    Get Started
                  </button>
                )}
              </motion.div>

              <div className="pt-4 text-xs text-emerald-100/70">
                <p className="uppercase tracking-[0.18em] mb-1">
                  Proof-Speak
                </p>
                <p className="text-emerald-100/60">
                  Anonymous reports • Encrypted end-to-end • Backed by zero‑knowledge proofs
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};