import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Order } from '@/types/menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChefHat, Clock, CheckCircle2, AlertCircle, Printer } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Admin Dashboard - Kanban Board for Order Management
 * Displays orders in three columns: Pending, In Progress, Completed
 */
export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const previousOrderCountRef = useRef(0);
  
  const logoClickCount = useRef(0);
  const logoClickTimer = useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = () => {
    logoClickCount.current += 1;
    
    if (logoClickTimer.current) {
      clearTimeout(logoClickTimer.current);
    }
    
    if (logoClickCount.current === 3) {
      navigate('/');
      logoClickCount.current = 0;
    } else {
      logoClickTimer.current = setTimeout(() => {
        logoClickCount.current = 0;
      }, 1000);
    }
  };

  // Fetch all orders
  const { data: orders = [], isLoading, refetch } = trpc.order.getAll.useQuery();
  
  // Notification when new order arrives
  useEffect(() => {
    const pendingCount = orders.filter((o: any) => o.status === 'pending').length;
    
    if (previousOrderCountRef.current > 0 && pendingCount > previousOrderCountRef.current) {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch (e) {
        console.log('Audio notification not available');
      }
      
      toast.success('คำสั่งใหม่เข้ามา!', { description: 'มีคำสั่งใหม่รอการดำเนินการ' });
    }
    
    previousOrderCountRef.current = pendingCount;
  }, [orders]);

  // Update order status mutation
  const updateStatusMutation = trpc.order.updateStatus.useMutation({
    onSuccess: () => {
      refetch();
      setIsDialogOpen(false);
    },
  });

  // Auto-refresh orders every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);
    return () => clearInterval(interval);
  }, [refetch]);

  // Group orders by status
  const pendingOrders = orders.filter((o: any) => o.status === 'pending');
  const inProgressOrders = orders.filter((o: any) => o.status === 'in_progress');
  const completedOrders = orders.filter((o: any) => o.status === 'completed');

  const handleStatusChange = (orderId: number, newStatus: 'in_progress' | 'completed') => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const handlePrintOrder = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const itemsHTML = order.items?.map(item => `
      <tr>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>${item.price * item.quantity} บาท</td>
      </tr>
    `).join('') || '';
    
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>ใบสั่งอาหาร #${order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .order-info { margin-bottom: 20px; }
          .items { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total { text-align: right; font-weight: bold; margin-top: 10px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>ใบสั่งอาหาร</h2>
          <p>Order #${order.id}</p>
        </div>
        <div class="order-info">
          <p><strong>โต๊ะที่:</strong> ${order.tableNumber}</p>
          <p><strong>เวลา:</strong> ${new Date(order.createdAt).toLocaleString('th-TH')}</p>
          <p><strong>สถานะ:</strong> ${order.status}</p>
        </div>
        <div class="items">
          <table>
            <tr>
              <th>รายการ</th>
              <th>จำนวน</th>
              <th>ราคา</th>
            </tr>
            ${itemsHTML}
          </table>
          <div class="total">
            <p>รวมทั้งสิ้น: ${order.totalPrice} บาท</p>
          </div>
        </div>
        ${order.specialNotes ? `<p><strong>หมายเหตุ:</strong> ${order.specialNotes}</p>` : ''}
      </body>
      </html>
    `;
    
    printWindow.document.write(content);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
  };

  const OrderCard = ({ order }: { order: Order }) => (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow bg-card border-l-4 border-l-accent"
      onClick={() => {
        setSelectedOrder(order);
        setIsDialogOpen(true);
      }}
    >
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-primary">Order #{order.id}</p>
                <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">โต๊ะ {order.tableNumber}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(order.createdAt).toLocaleTimeString('th-TH')}
              </p>
            </div>
            <Badge variant="outline">{order.totalItems || 0} items</Badge>
          </div>

          <div className="border-t border-border pt-2 space-y-1">
            <p className="text-sm font-medium text-accent">{order.totalPrice} บาท</p>
            <div className="mt-2 space-y-0.5">
              {order.items?.map((item: any, idx: number) => (
                <p key={idx} className="text-xs text-muted-foreground">• {item.name} x{item.quantity}</p>
              ))}
            </div>
          </div>

          {(order.specialRequests || order.specialNotes) && (
            <div className="bg-secondary/50 p-2 rounded text-xs text-muted-foreground">
              <p className="font-semibold mb-1">หมายเหตุ:</p>
              <p>{order.specialRequests || order.specialNotes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const KanbanColumn = ({
    title,
    orders: columnOrders,
    icon: Icon,
    color,
    nextStatus,
  }: {
    title: string;
    orders: Order[];
    icon: React.ComponentType<any>;
    color: string;
    nextStatus?: 'in_progress' | 'completed';
  }) => (
    <div className="flex-1 bg-secondary/30 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={20} className={color} />
        <h3 className="font-semibold text-primary">{title}</h3>
        <Badge variant="secondary">{columnOrders.length}</Badge>
      </div>

      <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
        {columnOrders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">ไม่มีคำสั่ง</p>
          </div>
        ) : (
          columnOrders.map((order: any) => (
            <div key={order.id}>
              <OrderCard order={order} />
              {nextStatus && (
                <Button
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => handleStatusChange(order.id, nextStatus)}
                  disabled={updateStatusMutation.isPending}
                >
                  {updateStatusMutation.isPending ? 'กำลังอัปเดต...' : 'ถัดไป'}
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">กำลังโหลด...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={handleLogoClick}
            className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer border-none"
            title="Secret: Click 3 times to return home"
          >
            <ChefHat size={24} className="text-primary-foreground" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">ระบบจัดการคำสั่ง</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">รวมคำสั่ง</p>
              <p className="text-3xl font-bold text-primary">{orders.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">รอดำเนินการ</p>
              <p className="text-3xl font-bold text-accent">{pendingOrders.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">กำลังทำ</p>
              <p className="text-3xl font-bold text-blue-600">{inProgressOrders.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">เสร็จสิ้น</p>
              <p className="text-3xl font-bold text-green-600">{completedOrders.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KanbanColumn
          title="รอดำเนินการ"
          orders={pendingOrders}
          icon={AlertCircle}
          color="text-accent"
          nextStatus="in_progress"
        />
        <KanbanColumn
          title="กำลังทำ"
          orders={inProgressOrders}
          icon={Clock}
          color="text-blue-600"
          nextStatus="completed"
        />
        <KanbanColumn
          title="เสร็จสิ้น"
          orders={completedOrders}
          icon={CheckCircle2}
          color="text-green-600"
        />
      </div>

      {/* Order Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>รายละเอียดคำสั่ง #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">โต๊ะ</p>
                  <p className="text-lg font-bold text-primary">หมายเลข {selectedOrder.tableNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">สถานะ</p>
                  <p className="font-semibold text-primary">
                    {selectedOrder.status === 'pending' && 'รอดำเนินการ'}
                    {selectedOrder.status === 'in_progress' && 'กำลังทำ'}
                    {selectedOrder.status === 'completed' && 'เสร็จสิ้น'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-sm text-muted-foreground">เวลาสั่งซื้อ</p>
                  <p className="font-semibold text-primary">
                    {new Date(selectedOrder.createdAt).toLocaleString('th-TH')}
                  </p>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted-foreground mb-2">รายการสินค้า</p>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.name} x{item.quantity}</span>
                      <span className="font-semibold">{item.price * item.quantity} บาท</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">รวมทั้งสิ้น</span>
                  <span className="text-2xl font-bold text-accent">{selectedOrder.totalPrice} บาท</span>
                </div>
              </div>

              {(selectedOrder.specialRequests || selectedOrder.specialNotes) && (
                <div className="bg-secondary/50 p-3 rounded">
                  <p className="text-sm text-muted-foreground mb-1">หมายเหตุ</p>
                  <p className="text-sm">{selectedOrder.specialRequests || selectedOrder.specialNotes}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handlePrintOrder(selectedOrder)}
                >
                  <Printer size={16} className="mr-2" />
                  พิมพ์
                </Button>
                {selectedOrder.status !== 'completed' && (
                  <>
                    {selectedOrder.status === 'pending' && (
                      <Button
                        className="flex-1"
                        onClick={() => handleStatusChange(selectedOrder.id, 'in_progress')}
                        disabled={updateStatusMutation.isPending}
                      >
                        เริ่มทำ
                      </Button>
                    )}
                    {selectedOrder.status === 'in_progress' && (
                      <Button
                        className="flex-1"
                        onClick={() => handleStatusChange(selectedOrder.id, 'completed')}
                        disabled={updateStatusMutation.isPending}
                      >
                        เสร็จสิ้น
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
