import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { loadItem, saveItem } from '@utils/profileStorage';

const CART_KEY = 'neodomus_carrito';

export interface CartItem {
  id_producto: number;
  nombre_producto: string;
  precio_venta_producto: number;
  imagen: string;
  cantidad: number;
  color?: string;
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (producto: Omit<CartItem, 'cantidad'>, cantidad?: number) => void;
  updateQuantity: (key: string, cantidad: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const itemKey = (item: { id_producto: number; color?: string }) =>
  item.color ? `${item.id_producto}-${item.color.toLowerCase()}` : `${item.id_producto}`;

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => loadItem<CartItem[]>(CART_KEY, []));

  useEffect(() => {
    saveItem(CART_KEY, items);
  }, [items]);

  const addItem = (producto: Omit<CartItem, 'cantidad'>, cantidad = 1) => {
    setItems(prev => {
      const key = itemKey(producto);
      const existing = prev.find(i => itemKey(i) === key);
      if (existing) {
        return prev.map(i => (itemKey(i) === key ? { ...i, cantidad: i.cantidad + cantidad } : i));
      }
      return [...prev, { ...producto, cantidad }];
    });
  };

  const updateQuantity = (key: string, cantidad: number) => {
    setItems(prev =>
      prev.map(i => (itemKey(i) === key ? { ...i, cantidad: Math.max(1, cantidad) } : i))
    );
  };

  const removeItem = (key: string) => {
    setItems(prev => prev.filter(i => itemKey(i) !== key));
  };

  const clearCart = () => setItems([]);

  const totalItems = useMemo(() => items.reduce((acc, i) => acc + i.cantidad, 0), [items]);
  const totalPrice = useMemo(
    () => items.reduce((acc, i) => acc + i.cantidad * i.precio_venta_producto, 0),
    [items]
  );

  return (
    <CartContext.Provider value={{ items, totalItems, totalPrice, addItem, updateQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
};
