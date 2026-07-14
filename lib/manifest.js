/* =============================================================
   Mauá Automóviles — datos de marca (window.__BRAND__)
   Este archivo concentra la información del negocio.
   Más adelante, el PANEL de publicación escribirá aquí
   (o en un endpoint) los vehículos. La estructura ya está lista.
   ============================================================= */
(function () {
  "use strict";

  var PHONE_INTL = "59892550422"; // Uruguay +598, sin el 0 inicial

  window.__BRAND__ = {
    name: "Mauá Automóviles",
    tagline: "Representante oficial Chery en Cerro Largo",
    phoneDisplay: "092 550 422",
    tel: "+59892550422",
    whatsapp: "https://wa.me/" + PHONE_INTL,
    instagram: "https://www.instagram.com/maua_automoviles/",

    /* Locales con dirección y mapa confirmados. */
    locales: [
      {
        id: "central",
        rotulo: "Sucursal principal",
        calle: "Florencio Sánchez 650",
        ciudad: "Melo, Cerro Largo",
        tel: "092 550 422",
        maps: "https://www.google.com/maps?q=Florencio+Sanchez+650+Melo+Cerro+Largo&output=embed"
      },
      {
        id: "mata",
        rotulo: "Sucursal",
        calle: "Bvar. Francisco Mata 524",
        ciudad: "Melo, Cerro Largo",
        tel: "092 550 422",
        maps: "https://www.google.com/maps?q=Bulevar+Francisco+Mata+524+Melo+Cerro+Largo&output=embed"
      },
      {
        id: "rio-branco",
        rotulo: "Sucursal Río Branco",
        calle: "Blvr. Aparicio Saravia",
        ciudad: "Río Branco, Cerro Largo",
        tel: "091 801 940",
        maps: "https://www.google.com/maps?q=Blvr.+Aparicio+Saravia+Rio+Branco+Cerro+Largo&output=embed"
      }
    ],

    /* Línea oficial Chery 0 km — vitrina de modelos (gama vigente, tomada
       de chery.com.uy). No es stock de unidades individuales.
       Cada categoría tiene sus modelos con foto de perfil. */
    cheryLineup: [
      {
        id: "suv",
        nombre: "SUV",
        modelos: [
          { id: "tiggo-2-pro", nombre: "Tiggo 2 Pro 1.5", foto: "assets/img/chery/tiggo-2-pro.webp" },
          { id: "m7", nombre: "M7", foto: "assets/img/chery/m7.webp" },
          { id: "tiggo-4-csh", nombre: "Tiggo 4 CSH", foto: "assets/img/chery/tiggo-4-csh.webp" },
          { id: "tiggo-7-csh", nombre: "Tiggo 7 CSH", foto: "assets/img/chery/tiggo-7-csh.webp" }
        ]
      },
      {
        id: "pickup",
        nombre: "Pick Up",
        modelos: [
          { id: "himla", nombre: "Himla", foto: "assets/img/chery/himla.webp" }
        ]
      }
    ],

    /* Ficha por modelo. Datos tomados de chery.com.uy. Si algún dato queda
       vacío, la ficha simplemente no lo muestra (evita bloques vacíos). */
    cheryModelos: {
      "m7": {
        nombre: "Chery M7",
        subtitulo: "SUV 7 pasajeros",
        categoria: "SUV",
        hero: "assets/img/chery/colores/m7/blanco-perlado.jpg",
        tagline: "Grandes dimensiones para 7 pasajeros, con confort, tecnología y versatilidad para todos los días.",
        highlights: [
          { k: "Motor", v: "1.5 Turbo" },
          { k: "Transmisión", v: "MT6 · DCT6" },
          { k: "Combustible", v: "Naftero" },
          { k: "Capacidad", v: "7 pasajeros" }
        ],
        equipamiento: [
          "Pantalla multimedia 10,25\"",
          "6 parlantes",
          "Aire acondicionado",
          "Volante y tapizados en cuero",
          "Llantas de aleación",
          "Luces LED"
        ],
        seguridad: [
          "6 airbags",
          "Control de estabilidad (ESC)",
          "Control de tracción (TCS)",
          "ABS con EBD",
          "Cámara de retroceso",
          "Sensores de estacionamiento"
        ],
        // M7: chery.com.uy no publica imagen por color, todos usan la misma foto
        colores: [
          { nombre: "Blanco perlado", hex: "#F1F1EE", imagen: "assets/img/chery/colores/m7/blanco-perlado.jpg" },
          { nombre: "Gris plata", hex: "#B8BCC0" },
          { nombre: "Gris grafito", hex: "#4A4E52" },
          { nombre: "Negro", hex: "#0F1113" }
        ],
        versiones: ["MT", "DCT"]
      },
      "tiggo-2-pro": {
        nombre: "Chery Tiggo 2 Pro 1.5",
        subtitulo: "SUV compacta",
        categoria: "SUV",
        hero: "assets/img/chery/colores/tiggo-2-pro/rojo.webp",
        tagline: "SUV compacta con más confort, tecnología y diseño en cada detalle.",
        highlights: [
          { k: "Motor", v: "1.5" },
          { k: "Potencia", v: "117 HP" },
          { k: "Transmisión", v: "MT5 · CVT 9v" },
          { k: "Combustible", v: "Naftero" }
        ],
        equipamiento: [
          "Radio Touch 9\" con Apple CarPlay y Android Auto",
          "Cámara de reversa con sensores",
          "Aire acondicionado digital",
          "Vidrios eléctricos x4",
          "Espejos eléctricos",
          "Volante y tapizados en cuero",
          "Luces diurnas y de posición LED",
          "Llantas de aleación bitono 16\""
        ],
        seguridad: [
          "4 airbags",
          "Control de estabilidad",
          "ABS con EBD",
          "Faros proyectados con regulación en altura",
          "Spoiler trasero con tercera luz de stop",
          "Anclajes ISOFIX"
        ],
        colores: [
          { nombre: "Rojo", hex: "#C62828", imagen: "assets/img/chery/colores/tiggo-2-pro/rojo.webp" },
          { nombre: "Blanco", hex: "#F1F1EE", imagen: "assets/img/chery/colores/tiggo-2-pro/blanco.webp" },
          { nombre: "Ash Gray", hex: "#9EA3A6", imagen: "assets/img/chery/colores/tiggo-2-pro/ash-gray.png" },
          { nombre: "Nasdaq Silver", hex: "#C2C6C9", imagen: "assets/img/chery/colores/tiggo-2-pro/nasdaq-silver.webp" },
          { nombre: "Negro", hex: "#0F1113", imagen: "assets/img/chery/colores/tiggo-2-pro/negro.webp" }
        ],
        versiones: ["Pro"]
      },
      "tiggo-4-csh": {
        nombre: "Chery Tiggo 4 CSH",
        subtitulo: "SUV híbrida",
        categoria: "SUV",
        hero: "assets/img/chery/colores/tiggo-4-csh/rojo.png",
        tagline: "Súper híbrida con diseño renovado, gran potencia combinada y hasta 1.000 km de autonomía por tanque.",
        highlights: [
          { k: "Sistema", v: "Súper híbrido" },
          { k: "Potencia combinada", v: "204 HP" },
          { k: "Autonomía", v: "Hasta 1.000 km" },
          { k: "Combustible", v: "Nafta + eléctrico" }
        ],
        equipamiento: [
          "Motorización 100% híbrida",
          "Llantas de aleación 17\"",
          "Pantalla touch 10,25\"",
          "Cámara 360°",
          "Climatizador automático bi-zona",
          "Cargador Qi para smartphone",
          "Panel de instrumentos TFT",
          "Apple CarPlay y Android Auto"
        ],
        seguridad: [
          "6 airbags de serie (7 en Premium)",
          "ADAS (versión Premium)",
          "Control electrónico de estabilidad",
          "Control de tracción",
          "Estructura reforzada",
          "ANCAP 5 estrellas"
        ],
        colores: [
          { nombre: "Rojo", hex: "#C62828", imagen: "assets/img/chery/colores/tiggo-4-csh/rojo.png" },
          { nombre: "Blanco", hex: "#F1F1EE", imagen: "assets/img/chery/colores/tiggo-4-csh/blanco.png" },
          { nombre: "Gris", hex: "#B8BCC0", imagen: "assets/img/chery/colores/tiggo-4-csh/gris.png" },
          { nombre: "Gris oscuro", hex: "#4A4E52", imagen: "assets/img/chery/colores/tiggo-4-csh/gris-oscuro.png" },
          { nombre: "Negro", hex: "#0F1113", imagen: "assets/img/chery/colores/tiggo-4-csh/negro.png" }
        ],
        versiones: ["CSH", "CSH Premium"]
      },
      "tiggo-7-csh": {
        nombre: "Chery Tiggo 7 CSH",
        subtitulo: "SUV súper híbrida",
        categoria: "SUV",
        hero: "assets/img/chery/colores/tiggo-7-csh/blanco.png",
        tagline: "Súper híbrida enchufable con ADAS y 7 airbags. Más tecnología, más seguridad y hasta 1.200 km de autonomía.",
        highlights: [
          { k: "Motor", v: "1.5 Turbo + eléctrico 150 kW" },
          { k: "Potencia nafta", v: "140 CV" },
          { k: "Autonomía", v: "Hasta 1.200 km" },
          { k: "Modos", v: "Eco · Normal · Sport · EV · HEV" }
        ],
        equipamiento: [
          "Doble pantalla LCD 12,3\"",
          "Sistema de audio Sony 8 parlantes",
          "Consola horizontal moderna",
          "Modos de conducción Eco/Normal/Sport",
          "Modos EV y HEV",
          "Climatizador automático",
          "Apple CarPlay y Android Auto",
          "Cargador inalámbrico"
        ],
        seguridad: [
          "7 airbags de serie",
          "Sistema ADAS",
          "Estructura reforzada",
          "Control de estabilidad y tracción",
          "Cámara 360°",
          "Frenado autónomo de emergencia"
        ],
        colores: [
          { nombre: "Blanco", hex: "#F1F1EE", imagen: "assets/img/chery/colores/tiggo-7-csh/blanco.png" },
          { nombre: "Gris plata", hex: "#B8BCC0", imagen: "assets/img/chery/colores/tiggo-7-csh/gris-plata.png" },
          { nombre: "Gris grafito", hex: "#4A4E52", imagen: "assets/img/chery/colores/tiggo-7-csh/gris-grafito.png" },
          { nombre: "Negro", hex: "#0F1113", imagen: "assets/img/chery/colores/tiggo-7-csh/negro.png" },
          { nombre: "Azul", hex: "#1E3A5F", imagen: "assets/img/chery/colores/tiggo-7-csh/azul.png" }
        ],
        versiones: ["CSH"]
      },
      "himla": {
        nombre: "Chery Himla",
        subtitulo: "Pick up",
        categoria: "Pick Up",
        hero: "assets/img/chery/colores/himla/verde-oliva.png",
        tagline: "Pick up robusta, con diseño moderno y potencia para dominar cualquier terreno.",
        highlights: [
          { k: "Motor", v: "2.3L Turbo Diesel Euro V" },
          { k: "Potencia", v: "161 CV" },
          { k: "Capacidad de carga", v: "1.000 kg" },
          { k: "Combustible", v: "Diesel" }
        ],
        equipamiento: [
          "Caja de carga reforzada",
          "Pantalla multimedia touch",
          "Aire acondicionado",
          "Vidrios y espejos eléctricos",
          "Llantas de aleación",
          "Enganche para remolque"
        ],
        seguridad: [
          "7 airbags de serie",
          "Control de estabilidad",
          "Control de tracción",
          "ABS con EBD",
          "Cámara de retroceso",
          "Sensores de estacionamiento"
        ],
        // Himla: chery.com.uy tampoco publica imagen por color; se muestran los swatches como referencia
        colores: [
          { nombre: "Verde oliva", hex: "#4E5540", imagen: "assets/img/chery/colores/himla/verde-oliva.png" },
          { nombre: "Blanco", hex: "#F1F1EE" },
          { nombre: "Gris grafito", hex: "#4A4E52" },
          { nombre: "Negro", hex: "#0F1113" }
        ],
        versiones: []
      }
    },

    /* Vehículos se cargan desde data/vehiculos.json (gestionados por el panel) */
    vehiculos: []
  };
})();
