# Text Helper

A small browser-based editor for solid text colors, two-color gradients, and per-letter colors.

## Run locally

1. Extract the ZIP file.
2. Open `index.html` in a browser.
3. Enter text and choose **Solid**, **Gradient**, or **Per letter**.
4. Set the HEX colors. In **Per letter** mode, edit each character or apply a gradient first.
5. Press **Copy** to copy the generated markup.

No installation, Node.js, or local server is required.

## Files

- `index.html` — page structure.
- `styles.css` — layout and colors.
- `app.js` — preview, color interpolation, and code generation.

## Colors

- Background: `#11222C`
- Input surface: `#18333E`

The output uses `<font color='#RRGGBB'>` tags. A gradient is represented by assigning a different HEX color to each character. Compatibility with the title displayed above a mouse in MiceForce has not been independently confirmed.
