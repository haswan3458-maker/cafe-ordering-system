import { useState } from 'react';
import { useRoute } from 'wouter';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { MenuItem as MenuItemType, DrinkCustomization, SweetnessLevel } from '@/types/menu';
import { menuItems } from '@/data/menuData';
import { drinkToppings } from '@/data/toppingData';
import { Topping } from '@/types/menu';
import { toast } from 'sonner';

export default function DrinkDetailPage() {
  const [, params] = useRoute('/drink/:id');
  const drinkId = params?.id as string;

  // Find the drink
  const drink = menuItems.find(item => item.id === drinkId) as MenuItemType | undefined;

  const [customization, setCustomization] = useState<DrinkCustomization>({
    drinkType: 'hot',
    sweetnessLevel: '50',
    toppings: [],
  });

  if (!drink) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">ไม่พบเมนู</p>
          <a href="/" className="text-primary hover:underline">
            กลับไปหน้าแรก
          </a>
        </div>
      </div>
    );
  }

  const handleToppingChange = (topping: Topping) => {
    setCustomization(prev => {
      const isSelected = prev.toppings.some((t: Topping) => t.id === topping.id);
      if (isSelected) {
        return {
          ...prev,
          toppings: prev.toppings.filter((t: Topping) => t.id !== topping.id),
        };
      } else {
        return {
          ...prev,
          toppings: [...prev.toppings, topping],
        };
      }
    });
  };

  const totalToppingPrice = customization.toppings.reduce((sum: number, t: Topping) => sum + t.price, 0);
  const totalPrice = drink.price + totalToppingPrice;

  const handleAddToCart = () => {
    // This will be handled by parent component
    const cartItem = {
      menuItem: drink,
      customization,
      quantity: 1,
    };
    
    // Store in sessionStorage temporarily
    sessionStorage.setItem('pendingCartItem', JSON.stringify(cartItem));
    
    toast.success('เพิ่มลงตะกร้าสำเร็จ', {
      description: `${drink.name} ถูกเพิ่มเข้าตะกร้า`,
    });
    
    // Redirect back to home
    window.location.href = '/';
  };

  const getSweetnessLabel = (level: SweetnessLevel): string => {
    switch (level) {
      case '0':
        return 'ไม่หวานเลย';
      case '25':
        return 'หวานน้อยมาก';
      case '50':
        return 'หวานน้อย';
      case '100':
        return 'หวานปกติ';
      case '150':
        return 'หวานมาก';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <ArrowLeft size={24} className="text-primary" />
            </a>
            <h1 className="text-2xl font-bold text-primary">{drink.name}</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left - Image */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-sm">
              <img
                src={drink.image}
                alt={drink.name}
                className="w-full h-96 object-cover rounded-2xl shadow-lg"
              />
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">{drink.description}</p>
                <p className="text-3xl font-bold text-accent">{totalPrice} บาท</p>
              </div>
            </div>
          </div>

          {/* Right - Customization */}
          <div className="space-y-6">
            {/* Drink Type */}
            <div className="cafe-card p-6">
              <h2 className="text-xl font-bold text-primary mb-4">รูปแบบเครื่องดื่ม</h2>
              <div className="space-y-3">
                {(['hot', 'iced', 'frappe'] as const).map(type => (
                  <label key={type} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="drinkType"
                      value={type}
                      checked={customization.drinkType === type}
                      onChange={() =>
                        setCustomization(prev => ({ ...prev, drinkType: type }))
                      }
                      className="w-5 h-5 accent-primary"
                    />
                    <span className="text-base group-hover:text-primary transition-colors">
                      {type === 'hot' ? '☕ ร้อน (Hot)' : type === 'iced' ? '🧊 เย็น (Iced)' : '🥤 ปั่น (Frappe)'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sweetness Level */}
            <div className="cafe-card p-6">
              <h2 className="text-xl font-bold text-primary mb-4">ระดับความหวาน</h2>
              <div className="space-y-3">
                {(['0', '25', '50', '100', '150'] as const).map((level: SweetnessLevel) => (
                  <label key={level} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="sweetness"
                      value={level}
                      checked={customization.sweetnessLevel === level}
                      onChange={() =>
                        setCustomization(prev => ({ ...prev, sweetnessLevel: level }))
                      }
                      className="w-5 h-5 accent-primary"
                    />
                    <span className="text-base group-hover:text-primary transition-colors">
                      {level}% - {getSweetnessLabel(level)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Toppings */}
            <div className="cafe-card p-6">
              <h2 className="text-xl font-bold text-primary mb-4">ท็อปปิ้งเสริม (เลือกได้หลายอย่าง)</h2>
              <div className="space-y-3">
                {drinkToppings.map((topping: Topping) => (
                  <label key={topping.id} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={customization.toppings.some((t: Topping) => t.id === topping.id)}
                      onChange={() => handleToppingChange(topping)}
                      className="w-5 h-5 accent-primary rounded"
                    />
                    <span className="flex-1 text-base group-hover:text-primary transition-colors">
                      {topping.name}
                    </span>
                    <span className="text-accent font-semibold">+{topping.price} บาท</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Summary */}
            <div className="cafe-card p-6 bg-primary/5">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ราคาเมนู</span>
                  <span className="font-semibold">{drink.price} บาท</span>
                </div>
                {totalToppingPrice > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ท็อปปิ้ง</span>
                    <span className="font-semibold">+{totalToppingPrice} บาท</span>
                  </div>
                )}
                <div className="border-t border-border pt-2 flex justify-between">
                  <span className="font-bold text-primary">รวมทั้งหมด</span>
                  <span className="text-2xl font-bold text-accent">{totalPrice} บาท</span>
                </div>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="w-full cafe-button py-4 text-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
            >
              <ShoppingBag size={24} />
              เพิ่มลงตะกร้า
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
