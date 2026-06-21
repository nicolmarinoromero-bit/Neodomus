// QUE HACE:
// Importa componentes de React Native y librerías externas.
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";

// QUE HACE:
// Importa el encabezado y el footer personalizados.
//
// PARA QUE SIRVE:
// Mantener la identidad visual y la navegación de NeoDomus.
import HomeHeader from "@/components/layout/HomeHeader";
import HomeFooter from "@/components/layout/HomeFooter";

// QUE HACE:
// Importa el hook useState y iconos vectoriales.
import { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// QUE HACE:
// Define la estructura de datos para un producto.
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: any;
  favorite: boolean;
}

// QUE HACE:
// Array de datos con todos los productos, mapeando las imágenes proporcionadas.
const productsData: Product[] = [
  {
    id: "1",
    name: "Sensor PIR",
    category: "Sensores",
    price: 70000,
    image: require("../../assets/images/1.jpg"),
    favorite: false,
  },
  {
    id: "2",
    name: "Controlador central",
    category: "Controladores",
    price: 180000,
    image: require("../../assets/images/2.jpg"),
    favorite: false,
  },
  {
    id: "3",
    name: "Cinta LED RGB",
    category: "Iluminación",
    price: 20000,
    image: require("../../assets/images/3.jpg"),
    favorite: false,
  },
  {
    id: "4",
    name: "Kit automatización",
    category: "Automatización",
    price: 180000,
    image: require("../../assets/images/4.jpg"),
    favorite: false,
  },
  {
    id: "5",
    name: "Sensor de puerta",
    category: "Sensores",
    price: 39000,
    image: require("../../assets/images/13.jpg"),
    favorite: false,
  },
  {
    id: "6",
    name: "Detector de humo",
    category: "Seguridad",
    price: 55000,
    image: require("../../assets/images/14.jpg"),
    favorite: false,
  },
  {
    id: "7",
    name: "Enchufe WiFi",
    category: "Automatización",
    price: 95000,
    image: require("../../assets/images/15.jpg"),
    favorite: false,
  },
  {
    id: "8",
    name: "Panel de control",
    category: "Controladores",
    price: 210000,
    image: require("../../assets/images/16.jpg"),
    favorite: false,
  },
];

// QUE HACE:
// Pantalla principal de productos.
export default function Products() {
  // QUE HACE:
  // Estado para gestionar los productos y sus favoritos.
  const [products, setProducts] = useState<Product[]>(productsData);

  // QUE HACE:
  // Estado para el contador del carrito en la cabecera.
  const [cartCount, setCartCount] = useState(0);
const [quantities, setQuantities] = useState<{
[key: string]: number;
}>({});

  // QUE HACE:
  // Alterna el estado de favorito de un producto específico.
  const toggleFavorite = (productId: string) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) =>
        p.id === productId ? { ...p, favorite: !p.favorite } : p
      )
    );
  };
  
  // QUE HACE:
  // Incrementa el contador del carrito.
  const addToCart = () => {
    setCartCount(cartCount + 1);
  };
  const increaseQuantity = (id: string) => {
setQuantities((prev) => ({
...prev,
[id]: (prev[id] || 1) + 1,
}));
};

const decreaseQuantity = (id: string) => {
setQuantities((prev) => ({
...prev,
[id]: Math.max(1, (prev[id] || 1) - 1),
}));
};

  // QUE HACE:
  // Renderiza una tarjeta de producto individual.
  const renderProductCard = (product: Product) => (
    <View key={product.id} style={styles.productCard}>
      {/* Botón de favoritos */}
      <TouchableOpacity
        onPress={() => toggleFavorite(product.id)}
        style={styles.favoriteTouch}
      >
        <MaterialCommunityIcons
          name={product.favorite ? "heart" : "heart-outline"}
          size={24}
          color="#C89B3C"
        />
      </TouchableOpacity>

      {/* Imagen del producto */}
      <Image source={product.image} style={styles.productImage} />

      {/* Info del producto */}
      <Text style={styles.productName} numberOfLines={1}>
        {product.name}
      </Text>
      <Text style={styles.productCategory}>{product.category}</Text>
      <Text style={styles.productPrice}>
        ${product.price.toLocaleString("es-CO")}
      </Text>

      <View style={styles.productActions}>

  <View style={styles.quantityContainer}>

    <TouchableOpacity
      style={styles.qtyButton}
      onPress={() => decreaseQuantity(product.id)}
    >
      <Text style={styles.qtyText}>-</Text>
    </TouchableOpacity>

    <Text style={styles.qtyValue}>
      {quantities[product.id] || 1}
    </Text>

    <TouchableOpacity
      style={styles.qtyButton}
      onPress={() => increaseQuantity(product.id)}
    >
      <Text style={styles.qtyText}>+</Text>
    </TouchableOpacity>

  </View>

  <TouchableOpacity
    style={styles.cartButton}
    onPress={addToCart}
  >
    <MaterialCommunityIcons
      name="cart-outline"
      size={18}
      color="#FFFFFF"
    />
  </TouchableOpacity>

</View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Muestra el encabezado corporativo, ahora con el contador del carrito */}
      {/* Suponemos que HomeHeader acepta una prop cartCount */}
      <HomeHeader/>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Título de la pantalla */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Productos</Text>
          <Text style={styles.subtitle}>
            Encuentra todo lo que necesitas para tu hogar inteligente
          </Text>
        </View>

        {/* Barra de búsqueda */}
        <TextInput
          placeholder="Buscar productos..."
          placeholderTextColor="#8F8F8F"
          style={styles.searchInput}
        />

        {/* Filtros */}
        <View style={styles.filtersContainer}>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialCommunityIcons name="view-grid" size={24} color="#C89B3C" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialCommunityIcons name="view-list" size={24} color="#C89B3C" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>Ordenar por</Text>
            <MaterialCommunityIcons
              name="chevron-down"
              size={20}
              color="#C89B3C"
              style={{ marginLeft: 5 }}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>Todas las categorías</Text>
            <MaterialCommunityIcons
              name="chevron-down"
              size={20}
              color="#C89B3C"
              style={{ marginLeft: 5 }}
            />
          </TouchableOpacity>
        </View>

        {/* Lista de productos en rejilla (2xN) */}
        <View style={styles.productsGrid}>
          {products.map(renderProductCard)}
        </View>

        {/* Paginación */}
        <View style={styles.paginationContainer}>
          <TouchableOpacity style={styles.pageArrowButton}>
            <MaterialCommunityIcons
              name="chevron-left"
              size={24}
              color="#C89B3C"
            />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.pageButton, styles.activePageButton]}>
            <Text style={styles.activePageText}>1</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pageButton}>
            <Text style={styles.pageText}>2</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pageButton}>
            <Text style={styles.pageText}>3</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pageArrowButton}>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#C89B3C"
            />
          </TouchableOpacity>
        </View>

        {/* Espacio para que el footer no tape el contenido */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Muestra el footer personalizado */}
      <HomeFooter />
    </View>
  );
}

// QUE HACE:
// Define los estilos visuales.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000", // Fondo negro total
  },
  titleContainer: {
    paddingHorizontal: 20,
    marginTop: 25,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "700",
  },
  subtitle: {
    color: "#BDBDBD",
    marginTop: 8,
    fontSize: 14,
  },
  searchInput: {
    height: 50,
    borderWidth: 1,
    borderColor: "#C89B3C", // Borde dorado
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 20,
    paddingHorizontal: 15,
    color: "#FFFFFF",
    backgroundColor: "transparent",
  },
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  iconButton: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: "#C89B3C",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  filterButton: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#C89B3C",
    borderRadius: 10,
    paddingHorizontal: 15,
    justifyContent: "space-between",
    alignItems: "center",
    height: 50,
  },
  filterText: {
    color: "#C89B3C",
    fontSize: 14,
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 25,
  },
  productCard: {
    width: "48%", // Dos columnas
    backgroundColor: "#111111", // Fondo muy oscuro para las tarjetas
    borderWidth: 1,
    borderColor: "#C89B3C",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    justifyContent: "space-between", // Alineación vertical
  },
  favoriteTouch: {
    alignSelf: "flex-end",
    marginBottom: 5,
  },
  productImage: {
    width: "100%",
    height: 100,
    resizeMode: "contain",
    marginBottom: 15,
  },
  productName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 5,
  },
  productCategory: {
    color: "#BDBDBD",
    fontSize: 12,
    marginBottom: 8,
  },
  productPrice: {
    color: "#C89B3C",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
  },
  buyButton: {
    backgroundColor: "#C89B3C", // Fondo dorado
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  buyText: {
    color: "#000000", // Texto negro sobre dorado
    fontSize: 14,
    fontWeight: "700",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
    gap: 15,
  },
  pageButton: {
    width: 35,
    height: 35,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  activePageButton: {
    backgroundColor: "#C89B3C",
  },
  pageArrowButton: {
    width: 35,
    height: 35,
    justifyContent: "center",
    alignItems: "center",
  },
  pageText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  activePageText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "700",
  },
  productActions: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: 10,
},

quantityContainer: {
  flexDirection: "row",
  alignItems: "center",
  borderWidth: 1,
  borderColor: "#333",
  borderRadius: 6,
  height: 30,
},

qtyButton: {
  width: 25,
  justifyContent: "center",
  alignItems: "center",
},

qtyText: {
  color: "#FFFFFF",
  fontWeight: "bold",
},

qtyValue: {
  color: "#FFFFFF",
  width: 25,
  textAlign: "center",
},

cartButton: {
  width: 38,
  height: 30,
  backgroundColor: "#C89B3C",
  borderRadius: 6,
  justifyContent: "center",
  alignItems: "center",
},
});