import { CheckCircle, X } from 'lucide-react';
import { useEffect } from 'react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card rounded-2xl shadow-2xl p-8 max-w-sm mx-4 animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-secondary rounded-lg transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="mb-4 animate-bounce-gentle">
            <CheckCircle size={64} className="text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-primary mb-2">การสั่งซื้อเสร็จสิ้น!</h2>
          <p className="text-muted-foreground mb-6">
            ขอบคุณที่สั่งซื้อจากเรา ตะกร้าของคุณได้ถูกล้างแล้ว
          </p>
          <button
            onClick={onClose}
            className="cafe-button"
          >
            ตกลง
          </button>
        </div>
      </div>
    </div>
  );
}
