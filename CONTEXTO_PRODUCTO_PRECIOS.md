# Contexto del producto: Sitio Web + Panel de Gestión para Concesionarias

## Qué es

Un producto de software a medida para concesionarias y automotoras (0 km y usados): un **sitio web premium** para mostrar el stock de vehículos al público, combinado con un **panel de administración privado** donde el dueño o su equipo cargan autos, gestionan vendedores, registran ventas y ven las finanzas del negocio — todo sin depender de un programador para el día a día.

Está pensado para negocios que hoy publican autos a mano en Instagram o Facebook Marketplace, sin un lugar propio y profesional donde el cliente pueda ver todo el stock, filtrar por precio/año/marca, y contactar directo.

## Caso de referencia: Mauá Automóviles (Melo, Uruguay)

Representante oficial Chery + venta de usados seleccionados, con 3 sucursales (2 en Melo, 1 en Río Branco). Ya tiene el sitio y panel funcionando en producción.

## Qué incluye — Sitio público

- Diseño premium a medida (no template), con animaciones y transiciones cuidadas
- Catálogo completo con filtros por marca, precio, año, tipo de carrocería, combustible
- Ficha individual de cada vehículo: galería de fotos con zoom tipo lupa, especificaciones técnicas, botón directo a WhatsApp
- Totalmente adaptado a celular, tablet y escritorio
- Sección de financiación, ubicación de sucursales, datos de contacto
- Vehículos relacionados / sugeridos en cada ficha
- Botón flotante de WhatsApp en todo el sitio

## Qué incluye — Panel de administración

**Gestión de vehículos**
- Cargar, editar y eliminar vehículos con toda su ficha técnica
- Subida de fotos por arrastrar y soltar, con conversión automática a formato optimizado
- Publicar u ocultar un vehículo del sitio sin borrarlo
- Vista en grilla o en lista, según preferencia

**Gestión de personal / vendedores**
- Alta de vendedores con nombre, teléfono, email
- Comisión configurable por venta: porcentaje o monto fijo — u opcional (para dueños o personal a sueldo fijo)

**Registro de ventas**
- Al vender un auto, se marca automáticamente como vendido y se retira del sitio
- Asignación de vendedor responsable de cada venta
- Soporte para toma de vehículo como parte de pago (se descuenta del ingreso neto automáticamente)
- Cálculo automático de comisión según la configuración del vendedor

**Panel de finanzas**
- Ingresos del día, la semana y el mes en tiempo real
- Filtro de ventas por período (día / semana / mes con selector / histórico completo)
- Filtro cruzado por sucursal o por vendedor
- Historial completo de ventas con detalle de precio, toma de auto, ingreso neto y comisión

**Multi-sucursal**
- Cada vehículo y cada venta queda asociado a una sucursal específica, permitiendo comparar rendimiento entre locales

## Stack técnico (para credibilidad, no para el cliente final)

Sitio estático de alto rendimiento (HTML/CSS/JS optimizado, sin dependencias pesadas) + backend en Python con base de datos propia. Desplegado en infraestructura en la nube con dominio propio del cliente.

## Qué NO incluye hoy (posibles add-ons futuros)

- Publicación automática a MercadoLibre
- Publicación automática a Instagram/Facebook al cargar un auto nuevo
- Envío automático de notificaciones por WhatsApp Business API
- Panel individual para que cada vendedor vea solo sus propias ventas

## A quién se lo vendo

Concesionarias y automotoras chicas o medianas (0 km, usados, o mixtas) que:
- Hoy publican autos a mano en redes sociales, sin sitio propio o con uno desactualizado
- Tienen 1 o más vendedores y necesitan ordenar comisiones y seguimiento de ventas
- Quieren profesionalizar su imagen de marca sin pagar una agencia de desarrollo tradicional cara

## Estructura de precios de referencia (a validar/ajustar)

| Concepto | Rango sugerido (USD) |
|---|---|
| Setup inicial (desarrollo, personalización de marca, carga inicial de stock, capacitación de uso) | 900 – 1.400 |
| Mantenimiento mensual (hosting, soporte, actualizaciones menores) | 60 – 90 |
| Add-on: integración MercadoLibre | 150 – 300 (setup único, posible fee mensual aparte) |
| Add-on: publicación automática Instagram/Facebook | 150 – 300 (setup único, posible fee mensual aparte) |

**Notas para armar la oferta final:**
- El setup puede variar según cuánta personalización visual/de marca requiera cada cliente respecto a lo ya construido para Mauá (reutilizar estructura reduce el costo real de entrega).
- Considerar un precio de lanzamiento más bajo para los primeros clientes nuevos, a cambio de poder usarlos como referencia/testimonio.
- El mantenimiento mensual cubre hosting + soporte, no incluye desarrollo de funciones nuevas.
