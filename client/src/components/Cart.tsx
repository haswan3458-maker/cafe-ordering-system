import { CartItem, MenuItem } from '@/types/menu';
import { Trash2, ShoppingBag, X } from 'lucide-react';
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (cartLineId: string, quantity: number) => void;
  onRemoveItem: (cartLineId: string) => void;
  onCheckout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Cart({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  isOpen,
  onClose
}: CartProps) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');

  const totalPrice = items.reduce((sum, item) => {
    const itemPrice = item.menuItem.price + (item.customization?.toppings.reduce((s, t) => s + t.price, 0) || 0);
    return sum + itemPrice * item.quantity;
  }, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const createOrderMutation = trpc.order.create.useMutation();

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error('ตะกร้าว่าง', { description: 'โปรดเพิ่มรายการก่อนสั่งซื้อ' });
      return;
    }

    if (!tableNumber || parseInt(tableNumber) <= 0) {
      toast.error('กรุณาระบุหมายเลขโต๊ะ', { description: 'เพื่อความถูกต้องในการเสิร์ฟอาหาร' });
      return;
    }

    setIsCheckingOut(true);
    try {
      const orderItems = items.map(item => {
        const idParts = item.menuItem.id.split('-');
        const numericId = parseInt(idParts[idParts.length - 1]);
        
        if (isNaN(numericId)) {
          throw new Error(`Invalid menu item ID: ${item.menuItem.id}`);
        }

        const pricePerItem = item.menuItem.price + (item.customization?.toppings.reduce((s, t) => s + t.price, 0) || 0);

        return {
          menuItemId: numericId,
          name: item.menuItem.name,
          quantity: item.quantity,
          pricePerItem,
        };
      });

      const result = await createOrderMutation.mutateAsync({
        tableNumber: parseInt(tableNumber),
        items: orderItems,
        specialNotes: specialNotes || undefined,
      });

      // Save to order history in localStorage
      const prevOrders = JSON.parse(localStorage.getItem('myOrders') || '[]');
      localStorage.setItem('myOrders', JSON.stringify([...prevOrders, result.orderId]));

      // Clear input and items
      setTableNumber('');
      setSpecialNotes('');

      toast.success('สั่งซื้อสำเร็จ', {
        description: `Order #${result.orderId} ได้รับการบันทึก`,
      });

      onCheckout();
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('เกิดข้อผิดพลาด', {
        description: 'ไม่สามารถบันทึกคำสั่งได้ โปรดลองอีกครั้ง',
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <>
      {/* Cart Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={onClose}
        />
      )}

      {/* Cart Sidebar */}
      <div
        className={`fixed right-0 top-0 h-screen w-full sm:w-96 bg-background border-l border-border shadow-lg z-40 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card sticky top-0">
          <div className="flex items-center gap-2">
            <ShoppingBag size={24} className="text-primary" />
            <div>
              <h2 className="font-bold text-primary">ตะกร้า</h2>
              <p className="text-xs text-muted-foreground">
                {totalItems > 0 ? `${totalItems} รายการ` : 'ว่างเปล่า'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag size={48} className="text-muted mb-4" />
              <p className="text-muted-foreground">ตะกร้าว่างเปล่า</p>
              <p className="text-sm text-muted-foreground mt-2">เลือกเมนูเพื่อเริ่มสั่งซื้อ</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.cartLineId}
                className="cafe-card p-3 animate-slide-in-up"
              >
                <div className="flex gap-3">
                  <img
                    src={item.menuItem.image}
                    alt={item.menuItem.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-primary">{item.menuItem.name}</h4>
                    {item.customization && (
                      <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                        <p>• {item.customization.drinkType === 'hot' ? 'ร้อน' : item.customization.drinkType === 'iced' ? 'เย็น' : 'ปั่น'}</p>
                        <p>• หวาน {item.customization.sweetnessLevel}%</p>
                        {item.customization.toppings.length > 0 && (
                          <p>• ท็อปปิ้ง: {item.customization.toppings.map(t => t.name.split('(')[0].trim()).join(', ')}</p>
                        )}
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.menuItem.price + (item.customization?.toppings.reduce((sum, t) => sum + t.price, 0) || 0)} บาท
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.cartLineId, Math.max(1, item.quantity - 1))
                        }
                        className="w-6 h-6 bg-secondary hover:bg-muted rounded text-sm font-bold transition-colors"
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.cartLineId, item.quantity + 1)}
                        className="w-6 h-6 bg-secondary hover:bg-muted rounded text-sm font-bold transition-colors"
                      >
                        +
                      </button>
                      <button
                        onClick={() => onRemoveItem(item.cartLineId)}
                        className="ml-auto p-1 text-destructive hover:bg-destructive/10 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-border text-right">
                  <p className="text-sm font-semibold text-accent">
                    {(item.menuItem.price + (item.customization?.toppings.reduce((sum, t) => sum + t.price, 0) || 0)) * item.quantity} บาท
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border p-4 space-y-4 bg-card sticky bottom-0">
            <div className="space-y-3 mb-2">
              <div>
                <label className="block text-sm font-medium mb-1">หมายเลขโต๊ะ *</label>
                <input 
                  type="number" 
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="เช่น 1, 2, 3"
                  className="w-full p-2 border border-border rounded bg-background"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">หมายเหตุเพิ่มเติม (ถ้ามี)</label>
                <textarea 
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="เช่น ไม่หวาน, เพิ่มน้ำแข็ง"
                  className="w-full p-2 border border-border rounded bg-background resize-none h-16"
                />
              </div>
            </div>

            {/* Price Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ราคารวม:</span>
                <span className="font-semibold">{totalPrice} บาท</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full cafe-button py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCheckingOut ? 'กำลังประมวลผล...' : 'สั่งซื้อ'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
