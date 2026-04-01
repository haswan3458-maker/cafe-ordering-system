import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export default function SearchBar({ value, onChange, onClear }: SearchBarProps) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
        <Search size={20} />
      </div>
      <input
        type="text"
        placeholder="ค้นหาเมนู..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cafe-input pl-10 pr-10 w-full"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
}
