import { MenuCategory } from '@/types/menu';
import { Coffee, Cake } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: MenuCategory | null;
  onCategoryChange: (category: MenuCategory | null) => void;
}

export default function CategoryFilter({
  selectedCategory,
  onCategoryChange
}: CategoryFilterProps) {
  const categories: { id: MenuCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'drinks', label: 'เครื่องดื่ม', icon: <Coffee size={20} /> },
    { id: 'food', label: 'ของกิน', icon: <Cake size={20} /> }
  ];

  return (
    <div className="flex gap-3 flex-wrap">
      <button
        onClick={() => onCategoryChange(null)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
          selectedCategory === null
            ? 'cafe-button'
            : 'cafe-button-secondary hover:bg-muted'
        }`}
      >
        ทั้งหมด
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
            selectedCategory === category.id
              ? 'cafe-button'
              : 'cafe-button-secondary hover:bg-muted'
          }`}
        >
          {category.icon}
          <span>{category.label}</span>
        </button>
      ))}
    </div>
  );
}
