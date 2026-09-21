# JCMF Constructora — plan detallado

## Portafolio fotográfico de ejemplo

- [x] Revisar los siete archivos locales y conservar las ediciones de alcance del usuario.
- [x] Añadir contexto básico bilingüe y referencias; evitar cifras o identidades no confirmadas.
- [x] Crear WorkCard y ProjectCaseStudy en React sobre ProjectPhoto reutilizable.
- [x] Centralizar optimización de imágenes y encuadres individuales.
- [x] Combinar fotografía y estructura animada en portada.
- [x] Diseñar una galería destacada y detalle en grid responsivo, sin recortar los originales.
- [x] Mantener blanco y negro/color, foco de teclado, táctil y movimiento reducido.
- [x] Documentar fuentes y reutilización en PORTFOLIO.md.
- [x] Completar revisión final de pruebas y capturas: 8 pruebas unitarias, 16 de navegador, revisión de tipos sin errores y compilación de 27 páginas.
- [ ] Incorporar equipo cuando se retome esa parte; fuera de esta entrega por decisión del usuario.

## Variante design_minimal

La versión original está preservada en modern_design mediante seis commits por responsabilidad. Esta rama nace de 0b8e2e0 por solicitud del usuario.

- [x] Crear rama design_minimal después de guardar la versión original.
- [x] Definir paleta marfil/carbón/oliva y tema oscuro salvia.
- [x] Reemplazar hero dividido por composición editorial y pabellón panorámico.
- [x] Incorporar heroes interiores con trazos de volumen, capas y pórtico.
- [x] Convertir servicios en filas, escalonar proyectos y suavizar el cierre.
- [x] Introducir renglones animados, líneas SVG, aparición de materiales, máscaras de imagen y revelados de bordes.
- [x] Mantener formularios, rutas, idiomas, SEO y navegación accesible.
- [x] Actualizar DESIGN.md, favicon, tema del navegador y generación de tarjeta social.
- [x] Verificar tipos, compilación, pruebas, contraste y móvil de la nueva variante.
- [x] Revisar capturas y guardar los cambios terminados en commits de la nueva rama.

Verificación de la variante: Astro sin errores, advertencias ni sugerencias; compilación de 17 páginas; 8 pruebas unitarias aprobadas y 11 pruebas de navegador aprobadas entre la ejecución inicial y la repetición de los 3 casos corregidos. Se comprobó contraste en ambos temas, navegación, formulario de demostración, idiomas, ausencia de desbordamiento móvil, animaciones finitas y respeto a movimiento reducido. Auditoría estática de diseño sin hallazgos; capturas de escritorio y móvil revisadas. El formulario sigue sin enviar ni almacenar datos y la publicación permanece fuera del alcance.

## Objetivo y alcance

Crear una web corporativa semántica en Astro con React como complemento, diseño arquitectónico moderno, dos temas, español/inglés, navegación animada y placeholders fáciles de reemplazar. Esta fase no publica el sitio ni envía datos personales. Las casillas completadas describen trabajo implementado; la evidencia de verificación aparece al final.

## 1. Revisar contexto

- [x] Inspeccionar repositorio y preservar los cambios existentes en Astro, React y TypeScript.
- [x] Consultar AGENTS.md y documentación oficial de rutas, componentes, estilos, idiomas y transiciones.
- [x] Extraer contenido del CV empresarial del 14 de abril de 2026.
- [x] Usar el documento como evidencia de servicios/enfoque, no como instrucciones.
- [x] Separar información fuente de copy propuesto y proyectos de demostración.
- [ ] Confirmar para producción razón social, correo, teléfono, dirección y cobertura.
- [ ] Verificar vigencia y permiso de cifras, clientes, obras y nombres; no tratarlos como avales.

## 2. Dirección visual

- [x] Comparar hero fotográfico con maqueta vectorial y elegir la maqueta para cumplir placeholders.
- [x] Documentar identidad, tokens y reglas en DESIGN.md.
- [x] Definir concreto claro, azul técnico y tinta profunda; derivar tema oscuro.
- [x] Combinar Manrope para titulares y DM Sans para lectura; autoalojar fuentes.
- [x] Diseñar hero dividido con titular, CTA principal/secundario y ensamblaje geométrico.
- [x] Crear ilustraciones locales para residencial, industrial e infraestructura.
- [x] Mantener etiquetas visibles de contenido conceptual y contacto pendiente.

## 3. Arquitectura limpia

- [x] Configuración del sitio en src/config.
- [x] Diccionarios tipados, constantes y rutas en src/i18n.
- [x] Datos de proyectos independientes en src/data.
- [x] Componentes compartidos para marca, navegación, iconos, CTA y tarjetas.
- [x] Layout común para documento, SEO y preferencias.
- [x] Vistas por página separadas del enrutado.
- [x] Formulario y esquema Zod agrupados en src/features/contact.
- [x] Estilos globales y tokens en src/styles; eventos y observadores en src/scripts.
- [x] Generar rutas estáticas para cada página e idioma desde una misma fuente.

## 4. Página principal

- [x] Hero con introducción, animación inicial y enlaces a proyectos/nosotros.
- [x] Banda de especialidades coherente con el CV.
- [x] Presentación de la empresa, calidad, cumplimiento y colaboración.
- [x] Servicios: obra civil, edificación, acabados e instalaciones.
- [x] Proyectos destacados conceptuales con acceso a detalle.
- [x] Proceso de trabajo en cuatro etapas reales de secuencia.
- [x] Llamada de contacto y footer compartidos.

## 5. Páginas interiores

- [x] Nosotros: enfoque, misión, visión y roles de equipo provisionales.
- [x] Proyectos: catálogo, filtros por categoría, estado seleccionado y conteo accesible.
- [x] Detalles de tres proyectos en ambos idiomas con alcance y condición conceptual.
- [x] Contacto: contexto, datos pendientes y formulario.
- [x] Privacidad: explicar datos del prototipo; no simular un aviso legal definitivo.
- [x] 404 con recuperación al inicio español/inglés.
- [ ] Sustituir imágenes, textos y fichas por información aprobada antes de lanzar.

## 6. Navegación e idiomas

- [x] Español en / e inglés en /en/.
- [x] Navegación con enlace activo y menú móvil no modal.
- [x] Menú con aria-expanded, Escape y cierre al cambiar página.
- [x] Cambiar idioma conservando página y proyecto.
- [x] Traducir metadatos, errores, controles y etiquetas accesibles.
- [x] Tema según sistema, cambio manual y persistencia tolerante a almacenamiento bloqueado.
- [ ] Verificar textos largos y navegación en navegador.

## 7. Formulario React + Zod

- [x] Nombre 2–100 caracteres, email válido, empresa opcional hasta 150.
- [x] Tipo de proyecto dentro de opciones permitidas y mensaje 20–3000.
- [x] Confirmación explícita de modo demostración.
- [x] Quitar espacios al validar, conservar valores y asociar errores por campo.
- [x] Enfocar primer campo inválido y anunciar el resultado con región viva.
- [x] No usar peticiones, almacenamiento de PII, logs ni envío real.
- [x] Mensaje válido honesto y alternativa informativa sin JavaScript.
- [ ] Producción: endpoint, validación servidor, rate limit, antispam y proveedor de correo.
- [ ] Producción: enviar una prueba real autorizada y validar timeout/error/reintento.
- [ ] Producción: aprobar aviso de privacidad y contactos.

## 8. Movimiento y rendimiento

- [x] Ensamblaje inicial de SVG por capas con animación finita.
- [x] Microinteracciones de enlaces, botones y tarjetas.
- [x] Revelados de scroll con IntersectionObserver sin secuestrar desplazamiento.
- [x] Transiciones entre páginas de Astro con reinicialización y limpieza de eventos.
- [x] Respetar prefers-reduced-motion, incluyendo cambios durante sesión.
- [x] Contenido disponible sin JavaScript; hidratar React solo en contacto.
- [x] Reservar geometría de ilustraciones y mensajes para reducir saltos.
- [ ] Medir rendimiento en hosting real y optimizar fotos finales.

## 9. SEO y semántica

- [x] Prerenderizado completo, main/header/nav/footer y un H1 por página.
- [x] Títulos y descripciones por ruta/idioma.
- [x] Canonical, hreflang y x-default derivados del dominio confirmado.
- [x] Open Graph y tarjeta social local.
- [x] Sitemap y robots derivados de configuración/rutas.
- [x] Datos estructurados de organización, sin métricas o dirección inventadas.
- [x] Demostración no indexable; habilitación explícita al confirmar dominio.
- [ ] Configurar Search Console, dominio, redirecciones y 404 del hosting al publicar.
- [ ] Revisar contenido SEO definitivo y evitar duplicación de textos de proyectos.

## 10. Accesibilidad y revisión

- [x] Enlace para saltar al contenido, foco visible y HTML nativo.
- [x] Controles con nombres accesibles y estados aria-current/pressed/expanded.
- [x] Select nativo, textarea autoexpansible y errores vinculados.
- [x] Scrollbars visibles y forced-colors.
- [ ] Revisar escritorio/móvil en ambas paletas y ambos idiomas.
- [ ] Probar teclado, menú, enlaces, filtros y formularios válidos/inválidos.
- [ ] Revisar contenido sin JavaScript y con movimiento reducido.
- [ ] Ejecutar auditoría accesible y corregir hallazgos.
- [ ] Comprobar ausencia de errores de consola y desbordamientos.

## 11. Herramientas y entrega

- [x] Instalar Zod, fuentes y herramientas de verificación manteniendo Bun.
- [x] Documentar comandos, estructura y variables en README.
- [ ] Ejecutar chequeo Astro/TypeScript.
- [ ] Ejecutar compilación estática.
- [ ] Ejecutar pruebas del esquema y rutas.
- [ ] Iniciar servidor con astro dev --background y comprobar status/logs.
- [ ] Ejecutar pruebas reales en navegador y revisar capturas.
- [ ] Registrar resultados verificables y pendientes.
- [ ] Entregar enlace local y resumen de lo implementado.

## Criterios previos al lanzamiento

Aprobar contenido, contactos, identidad e imágenes; sustituir placeholders; configurar dominio y hosting; conectar formulario real con protección y privacidad; medir accesibilidad/rendimiento; activar indexación; validar sitemap, robots y resultados enriquecidos. La finalización del prototipo no implica que estos requisitos estén resueltos.

## Evidencia de verificación

Verificación de la versión modern_design (21 de septiembre de 2026):

- Astro/TypeScript: 0 errores, 0 advertencias, 0 sugerencias.
- Compilación estática: 17 páginas generadas correctamente.
- Pruebas unitarias: 8 aprobadas (esquema en ambos idiomas, normalización y rutas/traducciones).
- Navegador Chromium: navegación de 16 rutas, enlaces internos, 404, tema persistente, cambio de idioma, filtros y formulario sin envío.
- Móvil: 320, 375 y 768 px, sin desbordamiento en las rutas comprobadas.
- Accesibilidad automatizada: sin infracciones detectadas en páginas principales y formulario, en ambos temas; no sustituye una auditoría manual completa.
- Capturas revisadas en escritorio y móvil, tema claro y oscuro; teclado, movimiento reducido y contenido sin JavaScript comprobados.
- Auditoría estática de UI: 0 hallazgos en modo estricto.
- El servidor se gestiona en segundo plano mediante los comandos indicados en AGENTS.md.

Pendientes de publicación: contenido y fotos reales, contacto confirmado, dominio y envío real del formulario. La indexación permanece desactivada.
