# SolarPump Pro - Guía de Configuración Local

Este proyecto fue generado en Google AI Studio. Sigue estos pasos para ejecutarlo en tu propia computadora.

## Requisitos Previos
- [Node.js](https://nodejs.org/) (Versión 18 o superior)
- [npm](https://www.npmjs.com/)

## Instalación

1. **Descarga el código** y extrae el contenido en una carpeta.
2. **Instala las dependencias**:
   ```bash
   npm install
   ```

## Ejecución

### Modo Desarrollo
Para trabajar en el código con recarga en vivo:
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`.

### Construcción para Producción
Para generar los archivos optimizados:
```bash
npm run build
npm start
```

## Tecnologías Utilizadas
- **Frontend**: React 19, Vite, Tailwind CSS 4.
- **Animaciones**: Framer Motion.
- **Iconos**: Lucide React.
- **Gráficos**: Recharts.
- **Documentos**: jsPDF (PDF) y SheetJS (Excel).
- **Backend**: Express.js.

## Notas
- El servidor corre en el puerto `3000`.
- Si utilizas funciones de Gemini, asegúrate de configurar tu `GEMINI_API_KEY` en el entorno.
