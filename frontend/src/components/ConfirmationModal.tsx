import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmVariant?: "danger" | "primary";
}

export default function ConfirmationModal({
  isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", confirmVariant = "danger"
}: ConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-[#0d1f3c]/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7 relative border border-blue-100"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-blue-200 hover:text-blue-500 transition-colors">
              <X size={18} />
            </button>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${confirmVariant === "danger" ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-600"}`}>
              <AlertTriangle size={22} />
            </div>
            <h2 className="text-base font-black text-[#0d1f3c] mb-2">{title}</h2>
            <p className="text-sm text-blue-400/70 mb-6 leading-relaxed">{message}</p>
            <div className="flex gap-3">
              <button onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-50 border border-blue-100 text-xs font-bold text-blue-500 hover:bg-blue-100 transition-all">
                Cancel
              </button>
              <button onClick={() => { onConfirm(); onClose(); }}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white transition-all ${confirmVariant === "danger" ? "bg-red-500 hover:bg-red-600 shadow-sm shadow-red-500/20" : "bg-blue-600 hover:bg-blue-700"}`}>
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
