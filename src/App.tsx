import { useState } from "react";
import { CatalogScreen } from "./components/CatalogScreen";
import { CartScreen } from "./components/CartScreen";
import { AdminScreen } from "./components/AdminScreen";
import { AdminLoginScreen } from "./components/AdminLoginScreen";
import { AboutScreen } from "./components/AboutScreen";

export type Screen = "catalog" | "cart" | "admin" | "admin-login" | "about";

export interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  category: string;
  minOrder: number;
  unit: string;
  quantity: number;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("catalog");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const navigateToScreen = (screen: Screen) => {
    if (screen === "admin") {
      if (isAdminAuthenticated) {
        setCurrentScreen("admin");
      } else {
        setCurrentScreen("admin-login");
      }
    } else {
      setCurrentScreen(screen);
    }
  };

  const handleAdminLogin = (password: string): boolean => {
    // Простая проверка пароля для демо (в реальном приложении должна быть серверная валидация)
    if (password === "admin123") {
      setIsAdminAuthenticated(true);
      setCurrentScreen("admin");
      return true;
    }
    return false;
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setCurrentScreen("catalog");
  };

  const addToCart = (product: any, quantity: number) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      setCartItems(cartItems.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCartItems([...cartItems, {
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        category: product.category,
        minOrder: product.minOrder,
        unit: product.unit,
        quantity
      }]);
    }
  };

  const updateCartItem = (id: string, quantity: number) => {
    if (quantity === 0) {
      setCartItems(cartItems.filter(item => item.id !== id));
    } else {
      setCartItems(cartItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const removeFromCart = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const commonProps = {
    navigateToScreen,
    cartItemsCount: cartItems.length
  };

  switch (currentScreen) {
    case "catalog":
      return <CatalogScreen {...commonProps} addToCart={addToCart} />;
    case "cart":
      return (
        <CartScreen 
          {...commonProps} 
          cartItems={cartItems}
          updateCartItem={updateCartItem}
          removeFromCart={removeFromCart}
          clearCart={clearCart}
        />
      );
    case "admin":
      return <AdminScreen {...commonProps} onLogout={handleAdminLogout} />;
    case "admin-login":
      return <AdminLoginScreen {...commonProps} onLogin={handleAdminLogin} />;
    case "about":
      return <AboutScreen {...commonProps} />;
    default:
      return <CatalogScreen {...commonProps} addToCart={addToCart} />;
  }
}