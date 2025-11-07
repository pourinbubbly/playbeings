import { motion, AnimatePresence } from "motion/react";
import { useLocation } from "react-router-dom";
import { Zap } from "lucide-react";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="relative">
        {/* Pulsing rings */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-[var(--neon-cyan)]"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.8, 0, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-[var(--neon-magenta)]"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.8, 0, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-[var(--neon-purple)]"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.8, 0, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        
        {/* Center icon */}
        <motion.div
          className="relative w-24 h-24 rounded-full bg-black/80 border-4 border-[var(--neon-cyan)] flex items-center justify-center neon-glow-cyan"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <Zap className="w-12 h-12 text-[var(--neon-cyan)]" />
        </motion.div>
      </div>
      
      {/* Loading text */}
      <motion.div
        className="absolute bottom-1/3 text-center"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <p className="text-xl font-bold gradient-text-cyber uppercase tracking-wider">
          Loading
        </p>
      </motion.div>
    </div>
  );
}
