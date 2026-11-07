# Text Helper

A simple text color editor with solid colors, gradients, and per-letter customization.

## Run on Windows

1. Extract the ZIP file.
2. Open `index.html` in Chrome, Edge, or Firefox.
3. Enter your text and choose **Solid**, **Gradient**, or **Per letter**.
4. Adjust HEX 1 and HEX 2. In **Per letter** mode, you can edit each character or use the gradient as a starting point.
5. Click **Copy** to copy the generated code.

No Node.js, installation, or local server is required.

## Files

- `index.html`: page interface.
- `styles.css`: page styles.
- `app.js`: preview and code generation.

## Page colors

- Background: `#11222C`
- Panel: `#18333E`

## Generated format

The editor generates one `<font color='#RRGGBB'>` tag per character. A gradient is simulated by assigning a different color to each letter. Compatibility with the title displayed above a mouse in E=MouseC² must be tested in the game.
