import { X, Clock, HelpCircle, CheckCircle, Package } from 'lucide-react';
import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Order } from '@/types/menu';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderHistoryModal({ isOpen, onClose }: OrderHistoryModalProps) {
  const [orderIds, setOrderIds] = useState<number[]>([]);
  
  // Use useQueries if possible, or fetch manually since tRPC doesn't easily support dynamic query arrays without setup,
  // we can use a custom hook or just fetch them by getting all orders and filtering, 
  // but wait, we can just use `trpc.order.getAll.useQuery()` and then filter on the client side for simplicity.
  const { data: allOrders, isLoading, refetch } = trpc.order.getAll.useQuery(undefined, {
    enabled: isOpen,
  });

  useEffect(() => {
    if (isOpen) {
      const savedOrders = JSON.parse(localStorage.getItem('myOrders') || '[]');
      setOrderIds(savedOrders);
      refetch();
    }
  }, [isOpen, refetch]);

  if (!isOpen) return null;

  const myOrdersRaw = allOrders?.filter(o => orderIds.includes(o.id)) || [];
  // Sort by newest first
  const myOrders = myOrdersRaw.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending': return { text: 'รอดำเนินการ', color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={16} /> };
      case 'in_progress': return { text: 'กำลังจัดเตรียม', color: 'bg-blue-100 text-blue-800', icon: <Package size={16} /> };
      case 'completed': return { text: 'เสร็จสิ้น', color: 'bg-green-100 text-green-800', icon: <CheckCircle size={16} /> };
      case 'cancelled': return { text: 'ยกเลิก', color: 'bg-red-100 text-red-800', icon: <X size={16} /> };
      default: return { text: status, color: 'bg-gray-100 text-gray-800', icon: <HelpCircle size={16} /> };
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-card rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4 max-h-[80vh] flex flex-col animate-scale-in">
        <div className="flex items-center justify-between mb-4 border-b pb-4">
          <h2 className="text-2xl font-bold text-primary">ประวัติการสั่งซื้อ</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">กำลังโหลด...</p>
          ) : myOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">ยังไม่มีประวัติการสั่งซื้อ</p>
            </div>
          ) : (
            myOrders.map(order => {
              const statusInfo = getStatusDisplay(order.status);
              return (
                <div key={order.id} className="border border-border rounded-lg p-4 bg-background shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-lg">ออเดอร์ #{order.id}</h4>
                      <p className="text-sm text-muted-foreground">โต๊ะที่: {order.tableNumber}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${statusInfo.color}`}>
                      {statusInfo.icon}
                      {statusInfo.text}
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-border flex justify-between items-end">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString('th-TH')}
                      </p>
                      {order.specialNotes && (
                        <p className="text-sm text-accent mt-1">
                          หมายเหตุ: {order.specialNotes}
                        </p>
                      )}
                    </div>
                    <p className="font-bold text-primary">
                      {order.totalPrice} บาท
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
