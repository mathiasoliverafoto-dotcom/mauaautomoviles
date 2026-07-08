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
        calle: "C. Florencio Sánchez 650",
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

    /* Vehículos se cargan desde data/vehiculos.json (gestionados por el panel) */
    vehiculos: []
  };
})();
