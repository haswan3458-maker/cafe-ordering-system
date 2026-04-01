import { useState } from 'react';
import { X } from 'lucide-react';
import { DrinkCustomization, DrinkType, SweetnessLevel, Topping } from '@/types/menu';
import { drinkToppings } from '@/data/toppingData';

interface DrinkCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (customization: DrinkCustomization) => void;
  drinkName: string;
  basePrice: number;
}

export default function DrinkCustomizer({
  isOpen,
  onClose,
  onConfirm,
  drinkName,
  basePrice,
}: DrinkCustomizerProps) {
  const [drinkType, setDrinkType] = useState<DrinkType>('hot');
  const [sweetnessLevel, setSweetnessLevel] = useState<SweetnessLevel>('100');
  const [selectedToppings, setSelectedToppings] = useState<Topping[]>([]);

  const handleToppingToggle = (topping: Topping) => {
    setSelectedToppings((prev) => {
      const isSelected = prev.some((t) => t.id === topping.id);
      if (isSelected) {
        return prev.filter((t) => t.id !== topping.id);
      } else {
        return [...prev, topping];
      }
    });
  };

  const toppingPrice = selectedToppings.reduce((sum, t) => sum + t.price, 0);
  const totalPrice = basePrice + toppingPrice;

  const handleConfirm = () => {
    onConfirm({
      drinkType,
      sweetnessLevel,
      toppings: selectedToppings,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card rounded-2xl shadow-2xl p-6 max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-secondary rounded-lg transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-primary mb-6">{drinkName}</h2>

        {/* Drink Type */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-primary mb-3">
            รูปแบบเครื่องดื่ม
          </h3>
          <div className="space-y-2">
            {(['hot', 'iced', 'frappe'] as DrinkType[]).map((type) => (
              <label key={type} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="drinkType"
                  value={type}
                  checked={drinkType === type}
                  onChange={(e) => setDrinkType(e.target.value as DrinkType)}
                  className="w-4 h-4"
                />
                <span className="text-sm">
                  {type === 'hot' && 'ร้อน (Hot)'}
                  {type === 'iced' && 'เย็น (Iced)'}
                  {type === 'frappe' && 'ปั่น (Frappe)'}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Sweetness Level */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-primary mb-3">
            ระดับความหวาน
          </h3>
          <div className="space-y-2">
            {(
              [
                { value: '0', label: '0% - ไม่หวานเลย' },
                { value: '25', label: '25% - หวานน้อยมาก' },
                { value: '50', label: '50% - หวานน้อย' },
                { value: '100', label: '100% - หวานปกติ' },
                { value: '150', label: '150% - หวานมาก' },
              ] as Array<{ value: SweetnessLevel; label: string }>
            ).map(({ value, label }) => (
              <label key={value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="sweetness"
                  value={value}
                  checked={sweetnessLevel === value}
                  onChange={(e) => setSweetnessLevel(e.target.value as SweetnessLevel)}
                  className="w-4 h-4"
                />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Toppings */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-primary mb-3">
            ท็อปปิ้งเสริม (เลือกได้หลายอย่าง)
          </h3>
          <div className="space-y-2">
            {drinkToppings.map((topping) => (
              <label key={topping.id} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedToppings.some((t) => t.id === topping.id)}
                  onChange={() => handleToppingToggle(topping)}
                  className="w-4 h-4"
                />
                <span className="text-sm flex-1">{topping.name}</span>
                <span className="text-sm text-accent font-semibold">+{topping.price} บาท</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Summary */}
        <div className="border-t border-border pt-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">ราคาเมนู:</span>
            <span className="text-sm font-semibold">{basePrice} บาท</span>
          </div>
          {toppingPrice > 0 && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">ท็อปปิ้ง:</span>
              <span className="text-sm font-semibold">+{toppingPrice} บาท</span>
            </div>
          )}
          <div className="flex justify-between items-center text-lg font-bold text-accent">
            <span>รวมทั้งสิ้น:</span>
            <span>{totalPrice} บาท</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 cafe-button"
          >
            เพิ่มลงตะกร้า
          </button>
        </div>
      </div>
    </div>
  );
}
