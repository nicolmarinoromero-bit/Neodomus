import { resolveMediaUrl } from "./api";

/**
 * Imágenes reales de los productos del proyecto (mismas que usa la web en
 * fe/public/productos/{id}.jpg). Si el backend devuelve una imagen
 * (imagen_url), se usa esa; si no, se usa la imagen local del producto.
 */
const IMAGENES_LOCALES: Record<number, number> = {
  1: require("@/assets/images/1.jpg"),
  2: require("@/assets/images/2.jpg"),
  3: require("@/assets/images/3.jpg"),
  4: require("@/assets/images/4.jpg"),
  5: require("@/assets/images/5.jpg"),
  6: require("@/assets/images/6.jpg"),
  7: require("@/assets/images/7.webp"),
  8: require("@/assets/images/8.jpg"),
  9: require("@/assets/images/9.jpg"),
  10: require("@/assets/images/10.jpg"),
  11: require("@/assets/images/11.jpg"),
  12: require("@/assets/images/12.jpg"),
  13: require("@/assets/images/13.jpg"),
  14: require("@/assets/images/14.jpg"),
  15: require("@/assets/images/15.jpg"),
  16: require("@/assets/images/16.jpg"),
};

export type ImagenProductoSource = {
  id_producto: number;
  nombre_producto?: string;
  imagen_url?: string | null;
};

/**
 * Devuelve la fuente de imagen de un producto:
 *  - URL real del backend (resuelta con el host configurado) si existe.
 *  - Imagen local del producto por id (mismo fallback que la web).
 *  - null si no hay ninguna.
 */
export function imagenProducto(item: ImagenProductoSource): string | number | null {
  if (item.imagen_url) {
    const url = resolveMediaUrl(item.imagen_url);
    if (url) return url;
  }
  return IMAGENES_LOCALES[item.id_producto] ?? null;
}