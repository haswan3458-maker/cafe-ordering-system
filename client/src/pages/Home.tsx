import { useState, useMemo, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { MenuItem as MenuItemType, CartItem, MenuCategory } from '@/types/menu';
import { menuItems } from '@/data/menuData';
import MenuItem from '@/components/MenuItem';
import Cart from '@/components/Cart';
import SearchBar from '@/components/SearchBar';
import CategoryFilter from '@/components/CategoryFilter';
import CheckoutModal from '@/components/CheckoutModal';
import OrderHistoryModal from '@/components/OrderHistoryModal';
import { ShoppingBag, Menu, ClipboardList } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';

/**
 * Home Page - Cafe Ordering System
 * 
 * Design Philosophy: Warm Minimalism with Playful Typography
 * - Warm color palette (browns, creams, burnt orange)
 * - Generous whitespace and asymmetric layouts
 * - Playful fonts with clear hierarchy
 * - Smooth animations and transitions
 */

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const savedCart = sessionStorage.getItem('cartItems');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    sessionStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  const logoClickCount = useRef(0);
  const logoClickTimer = useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = () => {
    logoClickCount.current += 1;
    
    if (logoClickTimer.current) {
      clearTimeout(logoClickTimer.current);
    }
    
    if (logoClickCount.current === 3) {
      navigate('/admin');
      logoClickCount.current = 0;
    } else {
      logoClickTimer.current = setTimeout(() => {
        logoClickCount.current = 0;
      }, 1000);
    }
  };

  // Helper function to generate unique cart line ID
  const generateCartLineId = (menuItemId: string, customization?: any): string => {
    if (!customization) {
      return `${menuItemId}-no-customization`;
    }
    // Create a hash from customization to ensure unique IDs for different customizations
    const customizationStr = JSON.stringify({
      drinkType: customization.drinkType,
      sweetnessLevel: customization.sweetnessLevel,
      toppings: customization.toppings?.map((t: any) => t.id).sort(),
    });
    const hash = btoa(customizationStr).substring(0, 8);
    return `${menuItemId}-${hash}`;
  };

  // Check for pending cart item from drink detail page
  useEffect(() => {
    const pendingItem = sessionStorage.getItem('pendingCartItem');
    if (pendingItem) {
      try {
        const cartItem = JSON.parse(pendingItem);
        const cartLineId = generateCartLineId(cartItem.menuItem.id, cartItem.customization);
        
        setCartItems((prevItems) => {
          // Check if this exact cart line already exists
          const existingItem = prevItems.find((ci) => ci.cartLineId === cartLineId);
          if (existingItem) {
            // If it exists, increment quantity
            return prevItems.map((ci) =>
              ci.cartLineId === cartLineId
                ? { ...ci, quantity: ci.quantity + 1 }
                : ci
            );
          }
          // Otherwise, create a new cart line
          return [...prevItems, { ...cartItem, cartLineId }];
        });
        sessionStorage.removeItem('pendingCartItem');
      } catch (error) {
        console.error('Failed to parse pending cart item:', error);
      }
    }
  }, []);

  // Filter menu items based on search and category
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesCategory = selectedCategory === null || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  // Calculate total items in cart
  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Handle add to cart
  const handleAddToCart = (item: MenuItemType, customization?: any) => {
    setCartItems((prevItems) => {
      const cartLineId = generateCartLineId(item.id, customization);
      
      // Check if this exact cart line already exists
      const existingItem = prevItems.find((ci) => ci.cartLineId === cartLineId);
      if (existingItem) {
        // If it exists, increment quantity
        return prevItems.map((ci) =>
          ci.cartLineId === cartLineId
            ? { ...ci, quantity: ci.quantity + 1 }
            : ci
        );
      }
      
      // Otherwise, create a new cart line
      return [...prevItems, { cartLineId, menuItem: item, quantity: 1, customization }];
    });
  };

  // Handle update quantity
  const handleUpdateQuantity = (cartLineId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(cartLineId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((ci) =>
        ci.cartLineId === cartLineId ? { ...ci, quantity } : ci
      )
    );
  };

  // Handle remove item from cart
  const handleRemoveItem = (cartLineId: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((ci) => ci.cartLineId !== cartLineId)
    );
  };

  // Handle checkout
  const handleCheckout = () => {
    setShowCheckoutModal(true);
    setCartItems([]);
    setIsCartOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleLogoClick}
                className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
                title="Secret: Click 3 times to access admin"
              >
                <span className="text-2xl font-bold text-primary-foreground">☕</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-primary">Cafe Ordering</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHistoryModal(true)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors flex items-center gap-2 font-medium"
                title="ประวัติการสั่งซื้อ"
              >
                <ClipboardList size={20} />
                <span className="hidden lg:inline">ประวัติสั่งซื้อ</span>
              </button>
              
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="lg:hidden relative p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <ShoppingBag size={24} />
                {totalCartItems > 0 && (
                  <span className="absolute top-0 right-0 bg-accent text-accent-foreground w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">
                    {totalCartItems}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="hidden lg:flex items-center gap-2 cafe-button relative"
              >
                <ShoppingBag size={20} />
                <span>ตะกร้า</span>
                {totalCartItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                    {totalCartItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="grid grid-cols-1 gap-8">
          {/* Menu */}
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="relative h-64 rounded-2xl overflow-hidden shadow-lg">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663355412726/3n7kUnpQ9WoZw9RumExWEX/hero-cafe-nWrusshyhtvoWvn99wrJm6.webp"
                alt="Cafe Hero"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent flex items-center">
                <div className="p-8 text-white">
                  <h2 className="text-4xl font-bold mb-2">ยินดีต้อนรับ ร้าน Cafe Ordering</h2>
                  <p className="text-lg">สั่งเมนูโปรดของคุณวันนี้</p>
                </div>
              </div>
            </div>

            {/* Search and Filter Section */}
            <div className="space-y-4">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                onClear={() => setSearchTerm('')}
              />
              <CategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </div>

            {/* Results Info */}
            <div className="text-sm text-muted-foreground">
              พบ {filteredItems.length} รายการ
            </div>

            {/* Menu Grid */}
            {filteredItems.length > 0 ? (
              <div className="menu-grid">
                {filteredItems.map((item) => (
                  <MenuItem
                    key={item.id}
                    item={item}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground mb-2">ไม่พบรายการที่ตรงกัน</p>
                <p className="text-sm text-muted-foreground">
                  ลองค้นหาหรือเปลี่ยนหมวดหมู่อีกครั้ง
                </p>
              </div>
            )}
          </div>


        </div>
      </main>

      {/* Cart Sidebar - Responsive (Desktop & Mobile) */}
      <Cart
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
      />

      {/* Order History Modal */}
      <OrderHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />
    </div>
  );
}
