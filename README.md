# GEDCOM → Excalidraw

Convert GEDCOM genealogy files into interactive family tree diagrams in [Excalidraw](https://excalidraw.com).

**[Try it online](https://lavich.github.io/ged2excalidraw/)**

## Features

- Upload a `.ged` (GEDCOM) file and get an instant family tree visualization
- Editable canvas — drag, rearrange, and customize the diagram
- Download the result as a `.excalidraw` file to continue editing at [excalidraw.com](https://excalidraw.com)
- All processing happens in the browser — no server, no data upload

## How it works

1. Open the [app](https://lavich.github.io/ged2excalidraw/)
2. Drag & drop or select a `.ged` file
3. The family tree renders on an Excalidraw canvas
4. Edit freely or download the `.excalidraw` file

## Layout

- Person cards with avatar initials (blue = male, pink = female, gray = deceased)
- "Семья" (Family) blocks between parents and children
- Bound arrows that follow cards when dragged
- Grouped elements (card + avatar + text) move together

## Development

```bash
npm install
npm run dev    # dev server on http://localhost:3000
npm run build  # build to dist/
```

## Tech stack

- [Vite](https://vite.dev/) + React
- [@excalidraw/excalidraw](https://github.com/excalidraw/excalidraw) for the canvas
- Custom GEDCOM parser and tree layout engine
