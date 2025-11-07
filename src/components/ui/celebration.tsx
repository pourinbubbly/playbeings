import { motion, AnimatePresence } from "motion/react";
import { Trophy, Sparkles, X } from "lucide-react";
import { Button } from "./button.tsx";

interface CelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "checkin" | "quest";
  points?: number;
}

export function Celebration({ isOpen, onClose, title, message, type = "checkin", points }: CelebrationProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fireworks/Sparkles */}
            {type === "quest" && (
              <>
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2"
                    initial={{ scale: 0, x: 0, y: 0 }}
                    animate={{
                      scale: [0, 1, 0],
                      x: Math.cos((i * Math.PI) / 6) * 200,
                      y: Math.sin((i * Math.PI) / 6) * 200,
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatDelay: 1,
                      delay: i * 0.1,
                    }}
                  >
                    <Sparkles
                      className="w-6 h-6"
                      style={{
                        color: ["#00ffff", "#ff00ff", "#9333ea"][i % 3],
                      }}
                    />
                  </motion.div>
                ))}
              </>
            )}

            {/* Main card */}
            <div className="glass-card p-12 rounded-sm border-4 border-[var(--neon-cyan)] neon-glow-cyan relative min-w-[400px]">
              {/* Close button */}
              <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </Button>

              <div className="flex flex-col items-center gap-6 text-center">
                {/* Icon */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-[var(--neon-cyan)] via-[var(--neon-magenta)] to-[var(--neon-purple)] p-1"
                >
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                    <Trophy className="w-20 h-20 text-[var(--neon-cyan)]" />
                  </div>
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl font-bold gradient-text-cyber uppercase tracking-wider"
                >
                  {title}
                </motion.h2>

                {/* Message */}
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl text-muted-foreground"
                >
                  {message}
                </motion.p>

                {/* Points */}
                {points !== undefined && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                    className="glass-card px-8 py-4 rounded-sm border-2 border-[var(--neon-purple)] neon-glow-purple"
                  >
                    <p className="text-3xl font-bold text-[var(--neon-purple)]">
                      +{points} Points
                    </p>
                  </motion.div>
                )}

                {/* Continue button */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    onClick={onClose}
                    className="glass-card border-2 border-[var(--neon-cyan)] text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/20 font-bold uppercase tracking-wider px-8"
                  >
                    Continue
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
