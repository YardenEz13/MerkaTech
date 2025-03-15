import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getDatabase, ref, remove } from 'firebase/database';
import { Trash2 } from 'lucide-react'; // Lucide React icon

export default function ExpandableCard({ isOpen, onClose, card, id }) {
  const cardRef = useRef(null);

  // Function to delete the record from Firebase
  const handleDelete = (recordId) => {
    const db = getDatabase();
    const recordRef = ref(db, `history/${recordId}`);
    remove(recordRef)
      .then(() => {
        console.log(`Record ${recordId} deleted`);
        onClose(); // Close the modal after deletion
      })
      .catch((error) => {
        console.error("Error deleting record:", error);
      });
  };

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }

    function handleClickOutside(e) {
      if (isOpen && cardRef.current && !cardRef.current.contains(e.target)) {
        onClose();
      }
    }

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.body.style.overflow = 'auto';
    }
    
    window.addEventListener('keydown', onKeyDown);
    
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Animations
  const cardVariants = {
    closed: {
      opacity: 0,
      scale: 0.9,
      y: 20,
      transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] }
    },
    open: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30,
        mass: 1,
        duration: 0.5,
        ease: [0.23, 1, 0.32, 1]
      }
    }
  };

  const contentVariants = {
    closed: { opacity: 0 },
    open: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    closed: { opacity: 0, y: 10 },
    open: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    }
  };

  const overlayVariants = {
    closed: { opacity: 0 },
    open: {
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm h-full w-full z-10"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 grid place-items-center z-[100]">
            {/* Close Button */}
            <motion.button
              key={`close-button-${card.id}-${id}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, transition: { delay: 0.3, duration: 0.2 } }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.1 } }}
              className="flex absolute top-4 right-4 lg:top-6 lg:right-6 items-center justify-center bg-white rounded-full h-8 w-8 shadow-md z-[101]"
              onClick={onClose}
            >
              <CloseIcon />
            </motion.button>

            <motion.div
              layoutId={`card-${card.id}-${id}`}
              ref={cardRef}
              initial="closed"
              animate="open"
              exit="closed"
              variants={cardVariants}
              className="w-full max-w-[500px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden shadow-2xl"
            >
              <motion.div 
                layoutId={`image-${card.id}-${id}`}
                initial={{ scale: 1.05 }}
                animate={{ scale: 1, transition: { delay: 0.1, duration: 0.4, ease: "easeOut" } }}
              >
                <img
                  src={card.imageUrl}
                  alt={card.alt}
                  loading="eager"
                  className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top"
                />
              </motion.div>
              <motion.div
                variants={contentVariants}
                className="overflow-hidden"
              >
                {/* Card Header + Description */}
                {/* הוספנו text-right כדי ליישר לימין */}
                <div className="flex flex-col p-4 gap-2 text-right">
                  <motion.h3
                    variants={itemVariants}
                    className="font-bold text-black dark:text-slate-700"
                  >
                    {card.timestamp}
                  </motion.h3>
                  <motion.p
                    variants={itemVariants}
                    className="text-black dark:text-slate-500"
                  >
                    {card.description}
                  </motion.p>
                </div>
                
                {/* Detailed Description */}
                {/* הוספנו text-right כדי ליישר לימין */}
                <div className="px-4 pb-4 text-right">
                  <motion.div
                    variants={itemVariants}
                    className="text-black text-xs md:text-sm lg:text-base h-40 md:h-fit pb-10  items-start gap-4 overflow-auto dark:text-slate-700 [mask:linear-gradient(to_bottom,white,white,transparent)] [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
                  >
                    {card.detailedDescription}
                  </motion.div>
                </div>

                {/* Delete Button Inside the Card */}
                <motion.div
                  variants={itemVariants}
                  className="px-4 pb-4 flex justify-end"
                >
                  <button
                    onClick={() => handleDelete(card.id)}
                    className="flex items-center px-3 py-2 bg-red-600 text-white text-sm hover:bg-red-700 rounded-2xl hover:shadow-4xl"
                  >
                    <Trash2 className="mr-1 w-4 h-4" />
                    Delete
                  </button>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

const CloseIcon = () => (
  <motion.svg
    initial={{ opacity: 0 }}
    animate={{ opacity: 1, rotate: [0, 90], transition: { opacity: { duration: 0.2 }, rotate: { duration: 0.3, ease: "easeOut" } } }}
    exit={{ opacity: 0, transition: { duration: 0.1 } }}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 text-black"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M18 6l-12 12" />
    <path d="M6 6l12 12" />
  </motion.svg>
);
