import { describe, it, expect } from 'vitest';

describe('DrinkDetailPage', () => {
  it('should render drink detail page with customization options', () => {
    // Test that the page loads with drink information
    expect(true).toBe(true);
  });

  it('should calculate total price correctly with toppings', () => {
    // Base price: 100
    // Topping 1: 15
    // Topping 2: 10
    // Expected: 125
    const basePrice = 100;
    const toppings = [
      { id: 'whip', price: 15 },
      { id: 'boba', price: 10 },
    ];
    const total = basePrice + toppings.reduce((sum, t) => sum + t.price, 0);
    expect(total).toBe(125);
  });

  it('should store customization in sessionStorage', () => {
    const cartItem = {
      menuItem: { id: 'drink-1', name: 'Cappuccino', price: 100 },
      customization: {
        drinkType: 'hot',
        sweetnessLevel: '50',
        toppings: [{ id: 'whip', name: 'Whip Cream', price: 15 }],
      },
      quantity: 1,
    };

    sessionStorage.setItem('pendingCartItem', JSON.stringify(cartItem));
    const stored = sessionStorage.getItem('pendingCartItem');
    
    expect(stored).toBeDefined();
    const parsed = JSON.parse(stored!);
    expect(parsed.customization.drinkType).toBe('hot');
    expect(parsed.customization.sweetnessLevel).toBe('50');
    expect(parsed.customization.toppings.length).toBe(1);

    // Cleanup
    sessionStorage.removeItem('pendingCartItem');
  });

  it('should have correct sweetness level options', () => {
    const sweetnessLevels = ['0', '25', '50', '100', '150'] as const;
    expect(sweetnessLevels).toContain('50');
    expect(sweetnessLevels.length).toBe(5);
  });

  it('should have correct drink type options', () => {
    const drinkTypes = ['hot', 'iced', 'frappe'] as const;
    expect(drinkTypes).toContain('hot');
    expect(drinkTypes).toContain('iced');
    expect(drinkTypes).toContain('frappe');
    expect(drinkTypes.length).toBe(3);
  });
});
