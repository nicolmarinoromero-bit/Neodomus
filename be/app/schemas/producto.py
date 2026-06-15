from pydantic import BaseModel
# PARA: Importa BaseModel de Pydantic, la clase base para definir modelos de validación de datos.
# IMPACTO: Permite crear esquemas que validan automáticamente los tipos y reglas de los datos que entran o salen de la API.

from typing import Optional
# PARA: Importa Optional para anotar campos que pueden ser None.
# IMPACTO: Permite definir atributos opcionales en los esquemas, mejorando la claridad y la verificación de tipos.

class CategoriaSchema(BaseModel):
# PARA: Define el esquema Pydantic para la respuesta de datos de una categoría.
# IMPACTO: Se usa en endpoints como /productos/categorias para serializar objetos Categoria de la base de datos a JSON.

    id_categoria: int
# PARA: Campo obligatorio de tipo entero que representa el identificador único de la categoría.
# IMPACTO: Se incluye siempre en la respuesta; permite al frontend referenciar la categoría.

    nombre_categoria: str
# PARA: Campo obligatorio con el nombre de la categoría.
# IMPACTO: Se devuelve como string para mostrar en la interfaz.

    descripcion: Optional[str] = None
# PARA: Campo opcional (puede ser None) con la descripción de la categoría.
# IMPACTO: Si existe en la base de datos se incluye; si no, el valor será None. Permite flexibilidad.

    class Config:
        from_attributes = True
# PARA: Configuración interna del modelo (antes llamada `orm_mode` en Pydantic v1, ahora `from_attributes` en v2) que permite crear instancias del esquema a partir de objetos SQLAlchemy.
# IMPACTO: Facilita la conversión directa de modelos ORM a esquemas de respuesta, por ejemplo `CategoriaSchema.model_validate(categoria)`.

class ProductoSchema(BaseModel):
# PARA: Define el esquema Pydantic para la respuesta de datos de un producto.
# IMPACTO: Se usa en endpoints como /productos/ para serializar objetos Producto de la base de datos a JSON.

    id_producto: int
# PARA: Campo obligatorio entero con el identificador único del producto.
# IMPACTO: Permite al frontend identificar cada producto.

    nombre_producto: str
# PARA: Campo obligatorio con el nombre del producto.
# IMPACTO: Se muestra en listados y detalles.

    precio_venta_producto: float
# PARA: Campo obligatorio con el precio de venta del producto (número con decimales).
# IMPACTO: Se usa para mostrar precios en la tienda.

    imagen_url: Optional[str] = None
# PARA: Campo opcional con la URL de la imagen del producto.
# IMPACTO: Permite mostrar imágenes si existen; si no, el valor es None.

    id_cate_pr: Optional[int] = None
# PARA: Campo opcional con el ID de la categoría a la que pertenece el producto.
# IMPACTO: Permite al frontend saber la categoría, aunque puede ser nulo si el producto no tiene categoría asignada.

    nombre_categoria: Optional[str] = None
# PARA: Campo opcional con el nombre de la categoría (desnormalizado, para no hacer otra consulta).
# IMPACTO: Útil para mostrar directamente el nombre de la categoría sin tener que hacer una petición extra. Puede ser None si el producto no tiene categoría.

    class Config:
        from_attributes = True
# PARA: Misma configuración que en CategoriaSchema: permite crear el esquema desde un objeto SQLAlchemy Producto.
# IMPACTO: Simplifica la conversión de `Producto` (con su relación `categoria`) a JSON incluyendo el nombre de categoría.