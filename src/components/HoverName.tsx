import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HoverNameProps {
  shortName: string;
  fullName: string;
}

export default function HoverName({ 
  shortName, 
  fullName 
}: HoverNameProps) {
  const [hovered, setHovered] = useState(false);

  const parentVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.03,
      },
    },
  };

  const letterVariants = {
    hidden: {
      y: -80,
      opacity: 0,
      scale: 1.2,
      rotate: Math.random() * 30 - 15,
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 22,
      },
    },
  };

  const verticalVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { 
        duration: 0.3, 
        ease: "easeOut" 
      } 
    },
    exit: { 
      y: -30, 
      opacity: 0, 
      transition: { 
        duration: 0.2, 
        ease: "easeIn" 
      } 
    },
  };

  const stars = [
    { top: "-24px", left: "-30px", size: "w-4 h-4" },
    { top: "-30px", right: "-24px", size: "w-5 h-5" },
    { bottom: "-22px", left: "24px", size: "w-3 h-3" },
  ];

  return (
    <div
      className="relative inline-block cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {stars.map((star, idx) => (
        <motion.svg
          key={idx}
          className={`absolute ${star.size} text-yellow-300`}
          style={{ ...star }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: hovered ? 1 : 0,
            opacity: hovered ? 1 : 0,
            rotate: [0, 360],
          }}
          transition={{
            duration: 1.2,
            delay: 0.1 * idx,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2L13.09 8.26L19 9.27L14.5 13.14L15.91 19.02L12 15.77L8.09 19.02L9.5 13.14L5 9.27L10.91 8.26L12 2Z" />
        </motion.svg>
      ))}


      <AnimatePresence mode="wait">
        {!hovered ? (
          <motion.span
            key="short"
            className="text-4xl font-bold bg-gradient-to-r from-violet-500 via-orange-400 to-blue-400 text-transparent bg-clip-text inline-block"
            variants={verticalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {shortName}
          </motion.span>
        ) : (
          <motion.div
            key="full"
            className="text-4xl font-bold bg-gradient-to-r from-violet-500 via-orange-400 to-blue-400 text-transparent bg-clip-text inline-block whitespace-nowrap overflow-hidden"
            initial={{ width: 0 }}
            animate={{ 
              width: "auto",
              transition: { duration: 0.3 }
            }}
          >
            <motion.span
              className="flex"
              variants={parentVariants}
              initial="hidden"
              animate="visible"
            >
              {fullName.split("").map((char, idx) => (
                <motion.span 
                  key={idx} 
                  variants={letterVariants} 
                  className="inline-block mx-[0.5px]"
                  custom={idx}
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}