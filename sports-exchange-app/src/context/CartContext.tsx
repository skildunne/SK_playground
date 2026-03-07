import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
    id: string; // The Product ID
    title: string;
    price: number;
    imageUrl: string | null;
    sellerId: string;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (itemId: string) => void;
    clearCart: () => void;
    cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>([]);

    const addToCart = (item: CartItem) => {
        // Basic implementation: prevent duplicates in the cart (assuming gear exchange is unique items)
        setCart((prevCart) => {
            const exists = prevCart.find((i) => i.id === item.id);
            if (exists) return prevCart; // Don't add if already in cart
            return [...prevCart, item];
        });
    };

    const removeFromCart = (itemId: string) => {
        setCart((prevCart) => prevCart.filter((i) => i.id !== itemId));
    };

    const clearCart = () => {
        setCart([]);
    };

    const cartTotal = cart.reduce((total, item) => total + item.price, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, cartTotal }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
