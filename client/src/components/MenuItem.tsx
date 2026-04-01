import { MenuItem as MenuItemType, DrinkCustomization } from '@/types/menu';
import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';

interface MenuItemProps {
  item: MenuItemType;
  onAddToCart: (item: MenuItemType, customization?: DrinkCustomization) => void;
}

export default function MenuItem({ item, onAddToCart }: MenuItemProps) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddClick = () => {
    if (item.category === 'drinks') {
      // Navigate to drink detail page
      window.location.href = `/drink/${item.id}`;
    } else {
      setIsAdding(true);
      onAddToCart(item);
      setTimeout(() => setIsAdding(false), 600);
    }
  };



  return (
    <div className="cafe-card overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden bg-secondary">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3">
          <span className="badge-category">{item.category === 'drinks' ? 'เครื่องดื่ม' : 'ของกิน'}</span>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-4">
        <h3 className="menu-item-name text-primary mb-1">{item.name}</h3>
        {item.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
        )}

        {/* Price and Button */}
        <div className="flex items-center justify-between mt-4">
          <span className="text-xl font-bold text-accent">{item.price} บาท</span>
          <button
            onClick={handleAddClick}
            className={`cafe-button flex items-center gap-2 ${
              isAdding ? 'animate-bounce-gentle' : ''
            }`}
          >
            <ShoppingCart size={18} />
            <span className="hidden sm:inline">เพิ่ม</span>
          </button>
        </div>
      </div>


    </div>
  );
}
