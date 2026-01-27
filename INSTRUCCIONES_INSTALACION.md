# Guía de Instalación del Proyecto

Si deseas mover este proyecto a otra computadora, sigue estos pasos detallados.

## 1. Prerrequisitos (Instalar en la nueva PC)

Antes de copiar el proyecto, necesitas tener instalado el software base:

### Node.js (Obligatorio)
Es el entorno necesario para ejecutar JavaScript fuera del navegador.
1. Ve a [nodejs.org](https://nodejs.org/).
2. Descarga la versión **LTS** (Recommended for Most Users).
3. Instálalo siguiendo los pasos del instalador (siguiente, siguiente, instalar).
4. Para verificar que se instaló, abre una terminal (CMD o PowerShell) y escribe:
   ```bash
   node -v
   npm -v
   ```
   Deberías ver números de versión (ej. v20.x.x).

### Git (Opcional pero recomendado)
Si usas Git para mover el código (GitHub/GitLab), instálalo desde [git-scm.com](https://git-scm.com/).

---

## 2. Copiar el Proyecto

Tienes dos opciones:

### Opción A: Copiar carpeta (USB / Red)
1. Copia toda la carpeta del proyecto `alm`.
2. **IMPORTANTE**: NO necesitas copiar la carpeta `node_modules`. Es muy pesada y contiene miles de archivos. Se volverá a generar en la nueva PC.
3. Pega la carpeta en la nueva computadora.

### Opción B: Clonar desde GitHub (si lo subiste)
1. En la nueva PC, abre terminal:
   ```bash
   git clone <URL_DE_TU_REPOSITORIO>
   cd alm
   ```

---

## 3. Instalación de Dependencias

Una vez tengas la carpeta en la nueva computadora:

1. Abre la terminal (CMD o PowerShell).
2. Navega hasta la carpeta del proyecto:
   ```bash
   cd ruta\a\tu\carpeta\alm\alm
   # Asegúrate de estar donde está el archivo "package.json"
   ```
3. Ejecuta el comando mágico para instalar todo:
   ```bash
   npm install
   ```
   *Esto descargará todas las librerías necesarias (React, Supabase, etc.) basándose en el archivo `package.json` y creará la carpeta `node_modules`.*

---

## 4. Configurar Variables de Entorno

El proyecto necesita credenciales para conectarse a Supabase.

1. Busca el archivo `.env.example` en la carpeta.
2. Haz una copia de ese archivo y renómbralo a `.env` (sin texto antes del punto).
3. Abre el archivo `.env` con el Bloc de notas o VS Code.
4. Rellena los valores con tus claves de Supabase:
   ```env
   REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=tu-clave-anonima-larga
   ```

---

## 5. Ejecutar el Proyecto

Finalmente, para iniciar la aplicación:

```bash
npm start
```

Esto abrirá automáticamente el navegador en `http://localhost:3000`.

---

## Resumen de Comandos (CMD)

```bash
# 1. Entrar a la carpeta
cd ruta\del\proyecto

# 2. Instalar dependencias (solo la primera vez)
npm install

# 3. Iniciar el servidor
npm start
```
