import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ProductoResumen = {
  id_producto: number;
  nombre_producto: string;
  precio: number;
  imagen_url?: string | null;
};

export type ItemCarrito = ProductoResumen & {
  cantidad: number;
};

type CommerceContextType = {
  carrito: ItemCarrito[];
  carritoCount: number;
  subtotal: number;
  agregarAlCarrito: (producto: ProductoResumen, cantidad?: number) => void;
  cambiarCantidad: (idProducto: number, cantidad: number) => void;
  quitarDelCarrito: (idProducto: number) => void;
  vaciarCarrito: () => void;
  favoritos: ProductoResumen[];
  esFavorito: (idProducto: number) => boolean;
  toggleFavorito: (producto: ProductoResumen) => void;
};

const CARRITO_KEY = "neodomus_carrito";
const FAVORITOS_KEY = "neodomus_favoritos";

const CommerceContext = createContext<CommerceContextType | undefined>(undefined);

async function leer<T>(clave: string): Promise<T[]> {
  try {
    const raw = await AsyncStorage.getItem(clave);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CommerceProvider({ children }: { children: React.ReactNode }) {
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [favoritos, setFavoritos] = useState<ProductoResumen[]>([]);

  useEffect(() => {
    let activo = true;
    (async () => {
      const [c, f] = await Promise.all([leer<ItemCarrito>(CARRITO_KEY), leer<ProductoResumen>(FAVORITOS_KEY)]);
      if (!activo) return;
      setCarrito(c);
      setFavoritos(f);
    })();
    return () => {
      activo = false;
    };
  }, []);

  const agregarAlCarrito = useCallback((producto: ProductoResumen, cantidad = 1) => {
    setCarrito((prev) => {
      const existente = prev.find((i) => i.id_producto === producto.id_producto);
      const nuevo = existente
        ? prev.map((i) =>
            i.id_producto === producto.id_producto ? { ...i, cantidad: i.cantidad + cantidad } : i
          )
        : [...prev, { ...producto, cantidad }];
      AsyncStorage.setItem(CARRITO_KEY, JSON.stringify(nuevo)).catch(() => {});
      return nuevo;
    });
  }, []);

  const cambiarCantidad = useCallback((idProducto: number, cantidad: number) => {
    setCarrito((prev) => {
      const nuevo =
        cantidad <= 0
          ? prev.filter((i) => i.id_producto !== idProducto)
          : prev.map((i) => (i.id_producto === idProducto ? { ...i, cantidad } : i));
      AsyncStorage.setItem(CARRITO_KEY, JSON.stringify(nuevo)).catch(() => {});
      return nuevo;
    });
  }, []);

  const quitarDelCarrito = useCallback((idProducto: number) => {
    setCarrito((prev) => {
      const nuevo = prev.filter((i) => i.id_producto !== idProducto);
      AsyncStorage.setItem(CARRITO_KEY, JSON.stringify(nuevo)).catch(() => {});
      return nuevo;
    });
  }, []);

  const vaciarCarrito = useCallback(() => {
    setCarrito([]);
    AsyncStorage.removeItem(CARRITO_KEY).catch(() => {});
  }, []);

  const toggleFavorito = useCallback((producto: ProductoResumen) => {
    setFavoritos((prev) => {
      const existe = prev.some((f) => f.id_producto === producto.id_producto);
      const nuevo = existe
        ? prev.filter((f) => f.id_producto !== producto.id_producto)
        : [...prev, producto];
      AsyncStorage.setItem(FAVORITOS_KEY, JSON.stringify(nuevo)).catch(() => {});
      return nuevo;
    });
  }, []);

  const esFavorito = useCallback(
    (idProducto: number) => favoritos.some((f) => f.id_producto === idProducto),
    [favoritos]
  );

  const value = useMemo<CommerceContextType>(() => {
    const carritoCount = carrito.reduce((acc, i) => acc + i.cantidad, 0);
    const subtotal = carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
    return {
      carrito,
      carritoCount,
      subtotal,
      agregarAlCarrito,
      cambiarCantidad,
      quitarDelCarrito,
      vaciarCarrito,
      favoritos,
      esFavorito,
      toggleFavorito,
    };
  }, [carrito, favoritos, agregarAlCarrito, cambiarCantidad, quitarDelCarrito, vaciarCarrito, esFavorito, toggleFavorito]);

  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
}

export function useCommerce(): CommerceContextType {
  const ctx = useContext(CommerceContext);
  if (!ctx) throw new Error("useCommerce debe usarse dentro de <CommerceProvider>");
  return ctx;
}