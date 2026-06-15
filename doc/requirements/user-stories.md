# Historias de Usuario — Neodomus

**Proyecto:** Neodomus — Plataforma web de gestión de servicios domóticos  
**Versión:** 1.0  
**Fecha:** Abril 2026  
**Clasificación:** Académico

---

## Actores del sistema

| Actor | Descripción |
|---|---|
| **Usuario** | Cliente que solicita y contrata servicios domóticos. |
| **Técnico** | Profesional que ejecuta instalaciones, mantenimiento y entregas. |
| **Administrador** | Persona que gestiona técnicos, servicios y operaciones de la plataforma. |

---

## Épica 1 — Autenticación y gestión de cuenta

### HU-01 — Registrarme en la plataforma

> **Como** usuario, técnico o administrador,  
> **quiero** registrarme en la plataforma ingresando mis datos personales,  
> **para** crear mi cuenta personal y acceder a los servicios.

**Criterios de aceptación:**
- [ ] El formulario incluye: nombre, apellido, tipo de documento, número de documento, correo electrónico, dirección y número de teléfono.
- [ ] El sistema valida que el correo no esté registrado previamente.
- [ ] Se envía un correo de verificación para activar la cuenta.
- [ ] Tras registrarse, el usuario puede iniciar sesión.

**Estimación:** M (Media)  
**Módulo:** `auth/`  
**RFs relacionados:** RF-AUTH-01

---

### HU-02 — Iniciar sesión

> **Como** usuario, técnico o administrador,  
> **quiero** iniciar sesión con mi correo y contraseña,  
> **para** acceder de forma rápida y segura a mi perfil.

**Criterios de aceptación:**
- [ ] El formulario valida que ambos campos no estén vacíos.
- [ ] Si las credenciales son incorrectas, se muestra un mensaje claro en español.
- [ ] Tras 5 intentos fallidos, la cuenta se bloquea temporalmente.
- [ ] La sesión permanece activa hasta que el usuario cierra sesión explícitamente.

**Estimación:** S (Pequeña)  
**Módulo:** `auth/`  
**RFs relacionados:** RF-AUTH-02

---

### HU-03 — Cerrar sesión

> **Como** usuario, técnico o administrador,  
> **quiero** cerrar sesión al finalizar mi uso,  
> **para** proteger mis datos personales y de pago.

**Criterios de aceptación:**
- [ ] Existe un botón "Cerrar sesión" en el menú de perfil.
- [ ] Al cerrar sesión, el token JWT se invalida en el cliente.
- [ ] El usuario es redirigido a la pantalla de inicio de sesión.
- [ ] No se pueden acceder a rutas protegidas después de cerrar sesión.

**Estimación:** XS (Muy pequeña)  
**Módulo:** `auth/`  
**RFs relacionados:** RF-AUTH-03

---

### HU-04 — Recuperar mi contraseña

> **Como** usuario, técnico o administrador,  
> **quiero** recuperar mi contraseña mediante un código enviado a mi correo,  
> **para** recuperar el acceso en caso de olvido.

**Criterios de aceptación:**
- [ ] Existe un enlace "¿Olvidaste tu contraseña?" en la pantalla de inicio de sesión.
- [ ] Se ingresa el correo y se recibe un código OTP de 6 dígitos.
- [ ] El código tiene validez de 10 minutos.
- [ ] Tras 5 intentos fallidos desde la misma IP, se bloquea temporalmente.

**Estimación:** M (Media)  
**Módulo:** `auth/`  
**RFs relacionados:** RF-AUTH-04

---

### HU-05 — Editar mis datos personales

> **Como** usuario o técnico,  
> **quiero** editar mis datos personales y dirección,  
> **para** mantener mi información actualizada.

**Criterios de aceptación:**
- [ ] El perfil muestra todos los campos editables (nombre, apellido, dirección, teléfono).
- [ ] Los cambios se guardan en la base de datos tras confirmar.
- [ ] El correo electrónico no puede modificarse sin verificación previa.
- [ ] Se muestra un mensaje de confirmación al guardar los cambios.

**Estimación:** S (Pequeña)  
**Módulo:** `auth/`  
**RFs relacionados:** RF-AUTH-05

---

### HU-06 — Eliminar mi cuenta

> **Como** usuario,  
> **quiero** eliminar mi cuenta si ya no deseo usar la plataforma,  
> **para** tener control sobre mis datos personales.

**Criterios de aceptación:**
- [ ] Existe una opción "Eliminar cuenta" en la configuración de perfil.
- [ ] Se solicita confirmación con contraseña antes de proceder.
- [ ] La eliminación es blanda (marcar `deleted_at`) durante 30 días, luego definitiva.
- [ ] El usuario puede cancelar la eliminación dentro de los 30 días.

**Estimación:** S (Pequeña)  
**Módulo:** `auth/`  
**RFs relacionados:** RF-AUTH-06

---

## Épica 2 — Catálogo y contratación de servicios

### HU-07 — Ver catálogo de servicios

> **Como** usuario,  
> **quiero** ver un catálogo de servicios domóticos disponibles,  
> **para** conocer todas las opciones antes de contratar.

**Criterios de aceptación:**
- [ ] Se muestran servicios de: instalación, mantenimiento, automatización y asesorías.
- [ ] El catálogo se carga desde la base de datos en menos de 2 segundos.
- [ ] Cada servicio se muestra con imagen representativa, título y precio base.
- [ ] Existe paginación o carga infinita si hay más de 20 servicios.

**Estimación:** S (Pequeña)  
**Módulo:** `catalog/`  
**RFs relacionados:** RF-CAT-01

---

### HU-08 — Consultar detalles de un servicio

> **Como** usuario,  
> **quiero** consultar el precio, descripción y duración estimada de cada servicio,  
> **para** tomar decisiones informadas antes de contratar.

**Criterios de aceptación:**
- [ ] Al tocar un servicio, se abre su vista detallada.
- [ ] Se muestra: precio, descripción completa, duración estimada, y requisitos previos.
- [ ] Se muestra si el servicio tiene promoción o descuento aplicable.
- [ ] Existe un botón "Solicitar" que inicia el flujo de contratación.

**Estimación:** XS (Muy pequeña)  
**Módulo:** `catalog/`  
**RFs relacionados:** RF-CAT-02

---

### HU-09 — Solicitar un servicio

> **Como** usuario,  
> **quiero** solicitar un servicio llenando un formulario con fecha, hora y tipo de trabajo,  
> **para** agendar una atención según mi disponibilidad.

**Criterios de aceptación:**
- [ ] El formulario incluye: selección de servicio, fecha, hora, dirección (precargada o nueva), y comentarios opcionales.
- [ ] La fecha debe ser posterior al día actual con al menos 24 horas de anticipación.
- [ ] Solo se muestran horarios dentro del rango de atención configurado.
- [ ] Se valida que no haya conflictos de horario con otros servicios del mismo usuario.

**Estimación:** M (Media)  
**Módulo:** `services/`  
**RFs relacionados:** RF-REQ-01

---

### HU-10 — Recibir confirmación del servicio

> **Como** usuario,  
> **quiero** recibir confirmación del servicio agendado por correo electrónico,  
> **para** saber que mi solicitud fue aceptada correctamente.

**Criterios de aceptación:**
- [ ] Tras enviar la solicitud, se muestra un mensaje de éxito.
- [ ] Se envía un correo de confirmación con los detalles del servicio.
- [ ] La solicitud queda en estado "pendiente" hasta que el administrador la apruebe.
- [ ] El usuario puede ver la solicitud en su lista de "Mis servicios".

**Estimación:** S (Pequeña)  
**Módulo:** `services/`, `notifications/`  
**RFs relacionados:** RF-REQ-02

---

### HU-11 — Visualizar el estado de mis solicitudes

> **Como** usuario,  
> **quiero** visualizar el estado de mis solicitudes (pendiente, en proceso, finalizado, cancelado),  
> **para** hacer seguimiento a mis servicios.

**Criterios de aceptación:**
- [ ] En "Mis servicios" se listan todas las solicitudes del usuario.
- [ ] Cada servicio muestra: tipo, fecha, técnico asignado (si existe), estado actual.
- [ ] Los estados se actualizan automáticamente sin recargar la página.
- [ ] Se pueden filtrar servicios por estado.

**Estimación:** S (Pequeña)  
**Módulo:** `services/`  
**RFs relacionados:** RF-REQ-03

---

### HU-12 — Modificar o cancelar un servicio

> **Como** usuario,  
> **quiero** modificar o cancelar un servicio antes de su confirmación,  
> **para** tener flexibilidad en caso de cambios de plan.

**Criterios de aceptación:**
- [ ] Los servicios en estado "pendiente" tienen botones "Modificar" y "Cancelar".
- [ ] Modificar permite cambiar fecha, hora o comentarios.
- [ ] Cancelar requiere confirmación y motivo.
- [ ] La cancelación solo es posible si faltan más de 48 horas para el servicio.

**Estimación:** M (Media)  
**Módulo:** `services/`  
**RFs relacionados:** RF-REQ-04, RF-REQ-05

---

## Épica 3 — Pagos y facturación

### HU-13 — Realizar pagos desde la plataforma

> **Como** usuario,  
> **quiero** realizar el pago directamente desde la plataforma,  
> **para** evitar desplazamientos y pagar de forma segura.

**Criterios de aceptación:**
- [ ] El sistema soporta pagos con tarjeta de crédito/débito y transferencia.
- [ ] Se puede pagar el total o realizar abonos parciales.
- [ ] La integración con la pasarela de pagos usa sandbox en desarrollo.
- [ ] Se muestra un comprobante inmediato tras el pago exitoso.

**Estimación:** L (Grande)  
**Módulo:** `payments/`  
**RFs relacionados:** RF-PAY-01, RF-PAY-02

---

### HU-14 — Ver y descargar comprobantes de pago

> **Como** usuario,  
> **quiero** ver y descargar mis comprobantes de pago o facturas,  
> **para** llevar control de mis servicios contratados.

**Criterios de aceptación:**
- [ ] En "Mis pagos" se listan todas las transacciones realizadas.
- [ ] Cada comprobante se puede visualizar en pantalla y descargar en PDF.
- [ ] Las facturas incluyen: datos del usuario, servicio, fecha, monto y estado.
- [ ] Se puede filtrar por rango de fechas.

**Estimación:** M (Media)  
**Módulo:** `payments/`  
**RFs relacionados:** RF-PAY-04

---

## Épica 4 — Calificaciones y feedback

### HU-15 — Calificar el servicio recibido

> **Como** usuario,  
> **quiero** calificar el servicio recibido y dejar comentarios,  
> **para** contribuir a la reputación del técnico y la plataforma.

**Criterios de aceptación:**
- [ ] Solo se puede calificar servicios en estado "completado".
- [ ] La calificación es de 1 a 5 estrellas, con comentario opcional.
- [ ] Una vez enviada, la calificación no se puede modificar.
- [ ] El técnico recibe notificación de su nueva calificación.

**Estimación:** S (Pequeña)  
**Módulo:** `ratings/`  
**RFs relacionados:** RF-RATING-01, RF-RATING-02

---

## Épica 5 — Notificaciones y comunicación

### HU-16 — Recibir notificaciones del estado del servicio

> **Como** usuario,  
> **quiero** recibir notificaciones por correo sobre el estado de mi servicio,  
> **para** estar informado sin necesidad de ingresar al sistema.

**Criterios de aceptación:**
- [ ] Se notifica al cambiar a: confirmado, en_progreso, completado, cancelado.
- [ ] El correo incluye los detalles del servicio y enlace para ver estado.
- [ ] El usuario puede configurar qué notificaciones recibe.
- [ ] También se muestran notificaciones en la campana dentro de la plataforma.

**Estimación:** M (Media)  
**Módulo:** `notifications/`  
**RFs relacionados:** RF-NOTIF-01, RF-NOTIF-05

---

### HU-17 — Comunicarme con el técnico asignado

> **Como** usuario,  
> **quiero** comunicarme directamente con el técnico asignado,  
> **para** coordinar detalles o resolver dudas antes del servicio.

**Criterios de aceptación:**
- [ ] Existe un chat integrado cuando el servicio tiene técnico asignado.
- [ ] El chat muestra contexto del servicio (dirección, fecha, tipo de trabajo).
- [ ] Los mensajes se almacenan con timestamp y estado de lectura.
- [ ] Se recibe notificación de nuevos mensajes.

**Estimación:** M (Media)  
**Módulo:** `chat/`  
**RFs relacionados:** RF-NOTIF-02

---

### HU-18 — Recibir recordatorios previos al servicio

> **Como** usuario,  
> **quiero** recibir recordatorios previos al día del servicio,  
> **para** evitar olvidos o ausencias.

**Criterios de aceptación:**
- [ ] Se envía un recordatorio 24 horas antes del servicio por correo.
- [ ] Se envía un segundo recordatorio 1 hora antes (opcional, configurable).
- [ ] El recordatorio incluye enlace para modificar o cancelar (si aplica).
- [ ] El usuario puede desactivar los recordatorios desde configuración.

**Estimación:** S (Pequeña)  
**Módulo:** `notifications/`  
**RFs relacionados:** RF-REQ-08

---

## Épica 6 — Acceso multi-dispositivo

### HU-19 — Acceder desde cualquier dispositivo

> **Como** usuario,  
> **quiero** acceder desde cualquier dispositivo (móvil, tablet o PC),  
> **para** usar el sistema desde cualquier lugar.

**Criterios de aceptación:**
- [ ] La interfaz es responsiva y se adapta a diferentes tamaños de pantalla.
- [ ] En móvil, los menús se colapsan en un menú hamburguesa.
- [ ] En tablet, se aprovecha el espacio con columnas adicionales.
- [ ] Todas las funcionalidades están disponibles en todos los dispositivos.

**Estimación:** L (Grande)  
**Módulo:** `ui/`  
**RFs relacionados:** RF-UX-01

---

## Épica 7 — Módulo del técnico

### HU-20 — Ver servicios asignados

> **Como** técnico,  
> **quiero** ver los servicios que me han sido asignados por el administrador,  
> **para** conocer mis tareas programadas.

**Criterios de aceptación:**
- [ ] El técnico solo ve sus propios servicios asignados.
- [ ] La lista muestra: cliente, dirección, fecha, hora y tipo de servicio.
- [ ] Se puede filtrar por estado (pendiente, en_progreso, completado).
- [ ] Al seleccionar un servicio, se ven sus detalles completos.

**Estimación:** S (Pequeña)  
**Módulo:** `tech/`  
**RFs relacionados:** RF-TECH-01

---

### HU-21 — Visualizar detalles del servicio

> **Como** técnico,  
> **quiero** visualizar los detalles del servicio (tipo, cliente, dirección, fecha),  
> **para** prepararme con las herramientas necesarias.

**Criterios de aceptación:**
- [ ] Se muestra toda la información del servicio y del cliente.
- [ ] La dirección incluye coordenadas para el mapa (si están disponibles).
- [ ] Se muestran comentarios adicionales del usuario.
- [ ] Hay un botón para iniciar navegación a la dirección.

**Estimación:** XS (Muy pequeña)  
**Módulo:** `tech/`  
**RFs relacionados:** RF-TECH-02

---

### HU-22 — Actualizar estado del servicio

> **Como** técnico,  
> **quiero** cambiar el estado del servicio (en proceso, completado, pendiente),  
> **para** mantener actualizado el progreso del trabajo.

**Criterios de aceptación:**
- [ ] Los estados posibles son: pendiente → en_progreso → completado.
- [ ] No se puede volver a un estado anterior una vez avanzado.
- [ ] Al marcar "completado", se solicita confirmación.
- [ ] El usuario recibe notificación automática del cambio de estado.

**Estimación:** S (Pequeña)  
**Módulo:** `tech/`  
**RFs relacionados:** RF-TECH-03

---

### HU-23 — Subir fotos y observaciones

> **Como** técnico,  
> **quiero** subir fotos y observaciones después de finalizar un servicio,  
> **para** dejar constancia visual de mi trabajo.

**Criterios de aceptación:**
- [ ] Se pueden subir hasta 5 fotos por servicio completado.
- [ ] Las fotos se almacenan en Supabase Storage con políticas RLS.
- [ ] Se permite agregar observaciones escritas adicionales.
- [ ] Las fotos son visibles para el usuario y el administrador.

**Estimación:** M (Media)  
**Módulo:** `tech/`  
**RFs relacionados:** RF-TECH-04

---

### HU-24 — Ver calificaciones y comentarios

> **Como** técnico,  
> **quiero** recibir y ver las calificaciones y comentarios de los usuarios,  
> **para** conocer mi nivel de desempeño.

**Criterios de aceptación:**
- [ ] El perfil del técnico muestra su calificación promedio (1-5 estrellas).
- [ ] Se listan todos los comentarios recibidos con fecha y servicio asociado.
- [ ] Se puede ver la evolución de calificaciones en el tiempo.
- [ ] El técnico puede descargar un reporte de sus calificaciones.

**Estimación:** S (Pequeña)  
**Módulo:** `tech/`  
**RFs relacionados:** RF-TECH-05

---

### HU-25 — Descargar reportes de servicios

> **Como** técnico,  
> **quiero** descargar reportes de mis servicios completos,  
> **para** llevar un control de mi trabajo y desempeño.

**Criterios de aceptación:**
- [ ] Se puede generar reporte por rango de fechas.
- [ ] El reporte incluye: lista de servicios, fechas, estados y comentarios.
- [ ] Formato de exportación: PDF y Excel.
- [ ] El técnico solo puede descargar sus propios reportes.

**Estimación:** M (Media)  
**Módulo:** `tech/`  
**RFs relacionados:** RF-TECH-06

---

### HU-26 — Registrar disponibilidad laboral

> **Como** técnico,  
> **quiero** registrar mi disponibilidad laboral (días y horas),  
> **para** que el administrador sepa cuándo puedo recibir nuevos servicios.

**Criterios de aceptación:**
- [ ] El técnico puede marcar días disponibles e indisponibles.
- [ ] Se puede definir horario por día (ej: lunes a viernes 9-18, sábados 10-14).
- [ ] La disponibilidad actualizada influye en la asignación automática.
- [ ] Se pueden registrar vacaciones o días no laborables.

**Estimación:** M (Media)  
**Módulo:** `tech/`  
**RFs relacionados:** RF-TECH-07

---

### HU-27 — Ver tareas en un mapa

> **Como** técnico,  
> **quiero** ver todas mis tareas (citas y entregas) en un mapa,  
> **para** planificar mi ruta de trabajo eficientemente.

**Criterios de aceptación:**
- [ ] El mapa muestra marcadores para cada tarea asignada.
- [ ] Las citas y entregas tienen colores o íconos distintos.
- [ ] Al tocar un marcador, se muestran los detalles de la tarea.
- [ ] Hay un botón para centrar el mapa en la ubicación actual del técnico.

**Estimación:** M (Media)  
**Módulo:** `maps/`  
**RFs relacionados:** RF-TECH-08, RF-MAP-01

---

## Épica 8 — Módulo del administrador

### HU-28 — Registrar nuevos técnicos

> **Como** administrador,  
> **quiero** registrar nuevos técnicos contratados,  
> **para** crear sus cuentas y permitirles acceder a la plataforma.

**Criterios de aceptación:**
- [ ] El formulario incluye: nombre, apellido, correo, teléfono, especialidad.
- [ ] El sistema genera una contraseña temporal enviada al correo del técnico.
- [ ] El técnico debe cambiar su contraseña en el primer inicio de sesión.
- [ ] Solo un administrador puede realizar esta acción.

**Estimación:** S (Pequeña)  
**Módulo:** `admin/`  
**RFs relacionados:** RF-ADMIN-01

---

### HU-29 — Editar información de técnicos

> **Como** administrador,  
> **quiero** editar la información de los técnicos,  
> **para** mantener actualizada la información laboral.

**Criterios de aceptación:**
- [ ] Se pueden modificar: nombre, teléfono, especialidad, estado (activo/inactivo).
- [ ] Los cambios quedan registrados en auditoría.
- [ ] No se puede editar el correo de un técnico sin verificación.
- [ ] Solo un administrador puede realizar esta acción.

**Estimación:** XS (Muy pequeña)  
**Módulo:** `admin/`  
**RFs relacionados:** RF-ADMIN-02

---

### HU-30 — Eliminar o suspender usuarios/técnicos

> **Como** administrador,  
> **quiero** eliminar definitivamente o suspender usuarios/técnicos inactivos o con faltas graves,  
> **para** mantener la integridad de la base de datos.

**Criterios de aceptación:**
- [ ] Se puede suspender (bloquear temporalmente) o eliminar (definitivo).
- [ ] La eliminación requiere confirmación doble.
- [ ] Los datos eliminados se marcan en auditoría con responsable.
- [ ] No se pueden eliminar usuarios con servicios pendientes sin resolver.

**Estimación:** S (Pequeña)  
**Módulo:** `admin/`  
**RFs relacionados:** RF-ADMIN-03

---

### HU-31 — Reactivar usuarios suspendidos

> **Como** administrador,  
> **quiero** reactivar técnicos o usuarios suspendidos si corrigen sus fallas,  
> **para** permitirles regresar al sistema.

**Criterios de aceptación:**
- [ ] Se puede reactivar una cuenta suspendida con un solo clic.
- [ ] La reactivación queda registrada en auditoría.
- [ ] El usuario recibe un correo notificando la reactivación.
- [ ] Solo un administrador puede realizar esta acción.

**Estimación:** XS (Muy pequeña)  
**Módulo:** `admin/`  
**RFs relacionados:** RF-ADMIN-04

---

### HU-32 — Aprobar o rechazar solicitudes

> **Como** administrador,  
> **quiero** aprobar o rechazar solicitudes de servicios,  
> **para** asegurar una correcta gestión del flujo de trabajo.

**Criterios de aceptación:**
- [ ] El panel muestra todas las solicitudes pendientes de aprobación.
- [ ] Aprobar cambia el estado a "confirmado" y asigna técnico.
- [ ] Rechazar requiere un motivo que se envía al usuario.
- [ ] El usuario recibe notificación de la decisión.

**Estimación:** S (Pequeña)  
**Módulo:** `admin/`  
**RFs relacionados:** RF-ADMIN-05

---

### HU-33 — Asignar técnicos manualmente

> **Como** administrador,  
> **quiero** asignar técnicos manualmente a los servicios,  
> **para** garantizar atención inmediata al cliente.

**Criterios de aceptación:**
- [ ] Desde el detalle del servicio, se puede seleccionar un técnico disponible.
- [ ] La asignación considera la disponibilidad horaria del técnico.
- [ ] El técnico recibe notificación automática de la asignación.
- [ ] La asignación queda registrada con `assigned_by` (administrador responsable).

**Estimación:** S (Pequeña)  
**Módulo:** `admin/`  
**RFs relacionados:** RF-ADMIN-05

---

### HU-34 — Visualizar todos los servicios

> **Como** administrador,  
> **quiero** visualizar todos los servicios activos, cancelados o finalizados,  
> **para** supervisar la operación completa del sistema.

**Criterios de aceptación:**
- [ ] El panel muestra todos los servicios con filtros por estado, fecha, técnico.
- [ ] Se puede ver el detalle de cada servicio.
- [ ] Se puede exportar la lista a Excel.
- [ ] Los datos se actualizan en tiempo real.

**Estimación:** M (Media)  
**Módulo:** `admin/`  
**RFs relacionados:** RF-ADMIN-06

---

### HU-35 — Monitorear pagos y transacciones

> **Como** administrador,  
> **quiero** monitorear pagos y transacciones realizadas en la plataforma,  
> **para** llevar un control financiero transparente.

**Criterios de aceptación:**
- [ ] El panel muestra todas las transacciones con fecha, usuario, monto y estado.
- [ ] Se pueden ver resúmenes diarios, semanales o mensuales.
- [ ] Se puede exportar reporte financiero a PDF o Excel.
- [ ] Se identifican pagos pendientes o rechazados.

**Estimación:** M (Media)  
**Módulo:** `admin/`  
**RFs relacionados:** RF-PAY-05

---

### HU-36 — Gestionar catálogo de servicios

> **Como** administrador,  
> **quiero** crear, editar o eliminar servicios del catálogo,  
> **para** mantener actualizada la oferta del sistema.

**Criterios de aceptación:**
- [ ] Se puede crear un servicio con: nombre, descripción, precio, duración, categoría.
- [ ] Editar o eliminar servicios existentes.
- [ ] Los cambios surten efecto inmediatamente en el catálogo visible por usuarios.
- [ ] No se pueden eliminar servicios con solicitudes pendientes.

**Estimación:** M (Media)  
**Módulo:** `admin/`  
**RFs relacionados:** RF-CAT-05

---

### HU-37 — Crear promociones y descuentos

> **Como** administrador,  
> **quiero** crear promociones o descuentos especiales,  
> **para** atraer más usuarios a la plataforma.

**Criterios de aceptación:**
- [ ] Se puede crear descuento por: porcentaje, monto fijo, o "compre uno y lleve otro".
- [ ] El descuento puede aplicarse a un servicio específico o a toda una categoría.
- [ ] Se puede definir vigencia del descuento (fecha inicio/fin).
- [ ] Los descuentos se muestran destacados en el catálogo.

**Estimación:** M (Media)  
**Módulo:** `admin/`  
**RFs relacionados:** RF-CAT-06

---

### HU-38 — Recibir alertas de reclamos

> **Como** administrador,  
> **quiero** recibir alertas automáticas sobre reclamos o fallas,  
> **para** resolver incidencias rápidamente.

**Criterios de aceptación:**
- [ ] Cuando un usuario crea un reclamo, el administrador recibe notificación por correo.
- [ ] El panel muestra un contador de reclamos pendientes.
- [ ] Se puede ver el detalle del reclamo y tomar acciones.
- [ ] El administrador puede responder al reclamo desde la plataforma.

**Estimación:** S (Pequeña)  
**Módulo:** `admin/`, `notifications/`  
**RFs relacionados:** RF-NOTIF-04

---

### HU-39 — Configurar horarios generales

> **Como** administrador,  
> **quiero** configurar los horarios generales de atención,  
> **para** sincronizar la disponibilidad de técnicos y usuarios.

**Criterios de aceptación:**
- [ ] Se puede definir horario general de la empresa (ej: L-V 8-20, S 9-14).
- [ ] Los horarios festivos se pueden configurar por fecha específica.
- [ ] El sistema no permite agendar servicios fuera del horario configurado.
- [ ] La configuración aplica a todos los usuarios y técnicos.

**Estimación:** S (Pequeña)  
**Módulo:** `admin/`  
**RFs relacionados:** RF-ADMIN-07

---

### HU-40 — Gestionar roles y permisos

> **Como** administrador,  
> **quiero** gestionar roles y permisos de acceso,  
> **para** controlar la seguridad y jerarquía del sistema.

**Criterios de aceptación:**
- [ ] Existen roles predefinidos: usuario, técnico, administrador.
- [ ] Se pueden crear roles personalizados con permisos específicos.
- [ ] Los permisos controlan acceso a módulos y acciones (CRUD).
- [ ] Los cambios de rol se registran en auditoría.

**Estimación:** L (Grande)  
**Módulo:** `admin/`  
**RFs relacionados:** RF-ADMIN-08

---

### HU-41 — Enviar comunicados masivos

> **Como** administrador,  
> **quiero** enviar comunicados o mensajes masivos a técnicos y usuarios,  
> **para** mantener comunicación constante y oficial.

**Criterios de aceptación:**
- [ ] Se puede enviar mensaje a todos los usuarios, todos los técnicos, o un segmento.
- [ ] El mensaje se envía por correo y se muestra en la campana de notificaciones.
- [ ] Se puede programar el envío para fecha/hora futura.
- [ ] Queda registro del comunicado enviado.

**Estimación:** M (Media)  
**Módulo:** `admin/`, `notifications/`  
**RFs relacionados:** RF-ADMIN-09

---

### HU-42 — Ver reportes de desempeño

> **Como** administrador,  
> **quiero** ver estadísticas y reportes de desempeño general mediante PDF/Excel,  
> **para** evaluar el crecimiento y la eficiencia del sistema.

**Criterios de aceptación:**
- [ ] El panel muestra métricas: servicios realizados, ingresos, técnicos más activos, satisfacción promedio.
- [ ] Se puede filtrar por período (día, semana, mes, año).
- [ ] Se puede exportar reporte a PDF o Excel.
- [ ] Las estadísticas se actualizan diariamente.

**Estimación:** M (Media)  
**Módulo:** `admin/`  
**RFs relacionados:** RF-ADMIN-10

---

## Épica 9 — Seguridad y respaldos

### HU-43 — Realizar copias de seguridad automáticas

> **Como** administrador,  
> **quiero** que el sistema realice copias de seguridad automáticas,  
> **para** proteger la información del sistema.

**Criterios de aceptación:**
- [ ] Las copias de seguridad se realizan cada 24 horas automáticamente.
- [ ] Se puede solicitar una copia manual bajo demanda.
- [ ] Las copias se almacenan en ubicación segura (offsite).
- [ ] Se puede restaurar desde una copia anterior.

**Estimación:** M (Media)  
**Módulo:** `admin/`  
**RFs relacionados:** RF-SEC-01

---

### HU-44 — Ver historial de servicios anteriores

> **Como** usuario,  
> **quiero** consultar mi historial de servicios anteriores,  
> **para** ver los técnicos que me han atendido y los servicios realizados.

**Criterios de aceptación:**
- [ ] En "Mi historial" se listan todos los servicios completados.
- [ ] Se muestra: fecha, técnico asignado, tipo de servicio, monto pagado.
- [ ] Se pueden ver detalles y factura de cada servicio.
- [ ] Se puede volver a contratar el mismo servicio con un clic.

**Estimación:** S (Pequeña)  
**Módulo:** `services/`  
**RFs relacionados:** RF-REQ-07

---

*Documento generado el Abril 2026 para el proyecto Neodomus*