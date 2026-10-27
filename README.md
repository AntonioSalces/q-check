# Procesos industriales

Banco de preguntas para repasar Procesos industriales (Ingeniería de Diseño): examen final, conformado, defectos de fundición, máquinas-herramienta y un test de repaso. Son 357 preguntas.

Responde un bloque y pulsa **Corregir**. La página deja a la vista solo las que has fallado y señala la respuesta correcta. **Mostrar todas las correctas** abre la clave del bloque en el que estás. Las respuestas se guardan en el navegador.

Algunas preguntas del examen original iban con una figura. Esas láminas no están en el banco; el enunciado lo avisa y la corrección usa la clave escrita.

## Arranque en local

```bash
npm install
npm run dev
```

Abre http://127.0.0.1:4317

## Comprobar y compilar

```bash
npm run check
npm run build
```

`npm run build` deja el sitio estático en `dist/`, con rutas relativas, listo para GitHub Pages.

## Publicar en GitHub Pages

1. Sube este repositorio a GitHub.
2. En el repositorio: Settings → Pages → Build and deployment → Source: **GitHub Actions**.
3. Cada push a `main` ejecuta `.github/workflows/pages.yml`, que instala, compila y publica.

La dirección queda en `https://<usuario>.github.io/<repositorio>/`.

Si prefieres no usar Actions, ejecuta `npm run build` y publica el contenido de `dist/`.
