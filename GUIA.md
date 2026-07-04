# Mauá Automóviles — Guía rápida del sitio

Sitio web estático (HTML + CSS + JS). **No necesita servidores ni instalaciones.**
Se sube tal cual a Hostinger o cualquier hosting.

---

## 1. Ver el sitio en tu computadora
Doble clic en **`index.html`**. Se abre en el navegador con todo funcionando.

## 2. Subirlo a internet (Hostinger)
1. Entrá al **Administrador de archivos** de Hostinger (o por FTP).
2. Subí **todo el contenido de esta carpeta** dentro de `public_html`:
   - `index.html`, `styles.css`, `main.js`, `.htaccess`
   - las carpetas `assets/` y `lib/`
3. Listo. El sitio queda en tu dominio.

> Las carpetas `tools/` y `.claude/` son solo de trabajo: **no hace falta subirlas**.

### Si cambiás algo y no se ve el cambio (caché)
En `index.html`, buscá `?v=20260630` y cambiá ese número por la fecha de hoy
(ej. `?v=20260715`) en las líneas de `styles.css` y `main.js`. Eso fuerza al
navegador a cargar la versión nueva. El archivo `.htaccess` ya ayuda con esto.

---

## 3. Cambiar datos del negocio
Casi todo el texto está en **`index.html`**. Lo más usado:

- **Teléfono / WhatsApp:** el número es `092 550 422` (formato internacional `59892550422`).
  Está en `index.html` (botones) y en `lib/manifest.js` (campo `whatsapp` / `tel`).
- **Direcciones de los locales:** en `index.html`, sección "Nuestros salones".
- **Instagram:** `https://www.instagram.com/maua_automoviles/`.

## 4. Editar los vehículos (por ahora, a mano)
Cada auto es un bloque `<article class="veh-card">` dentro de:
- Sección **Chery 0 km** (`id="chery"`)
- Sección **Usados seleccionados** (`id="usados"`)

Podés copiar un bloque, cambiar nombre, precio y datos. Las **fotos** hoy son un
placeholder con la silueta de la marca; cuando tengas las fotos reales se reemplazan.

> **Próximo paso (lo que hablamos):** un **panel** para que ustedes publiquen y
> actualicen los autos sin tocar código. La estructura de datos ya está preparada
> en `lib/manifest.js` para conectarla a ese panel.

---

## 5. El logo
Recreado en vector (nítido a cualquier tamaño):
- `assets/img/logo.svg` — logo completo (auto + texto).
- `assets/img/logo-mark.svg` — solo el ícono del auto.
- `assets/img/favicon.svg` — ícono para la pestaña del navegador.

---

## Colores de marca
- Rojo Mauá: `#e2202c`
- Fondo grafito: `#0c0e11`
- Cromo (plateado): degradé blanco → gris
