# Lily Bouquet

A generative lily bouquet drawn entirely with tiny dots on an HTML canvas. No images and no libraries, just plain HTML, CSS and JavaScript. The flowers sway gently, the stars twinkle, and clicking the page grows a new bouquet.

![Lily bouquet](screenshot.png)

Inspired by an ASCII lily bouquet video I saw online. I wanted the same stippled look, but made of dots instead of letters.

## Run it

1. Clone or download this repo.
2. Open the folder in VS Code.
3. Install the **Live Server** extension.
4. Right-click `index.html` and choose **Open with Live Server**.

You can also just double-click `index.html` to open it in your browser.

## Controls

- **Click** anywhere to generate a new bouquet with different colors and petal shapes.
- Resize the window and it rebuilds to fit.

## Project structure

| File | What it does |
|------|--------------|
| `index.html` | The page. Holds one `<canvas>` and loads the CSS and JS. |
| `style.css` | Makes the canvas fill the whole screen on a black background. |
| `lily.js` | All the drawing and animation logic. |

## How `lily.js` works

The big idea: **everything is made of thousands of tiny rectangles (dots)**. Each dot gets a random position inside a shape, and a color based on where it is.

### Helpers

- `rand(a, b)`: returns a random number between `a` and `b`.
- `lerpColor(a, b, t)`: blends two colors. `t = 0` gives color `a`, `t = 1` gives color `b`. Used for gradients.
- `rgb(c)`: turns a color list like `[255, 60, 60]` into the string canvas needs.

### Data

- `PALETTES`: the color sets for each lily type (red, pink, cream, yellow, peach, magenta). Each has a base color (center), a tip color, an edge glow, and a vein color.
- `LAYOUT`: one row per flower: `[x, y, size, tilt, rotation, palette]`. Edit this to rearrange the bouquet.

### Drawing functions

- `makeLily(size, pal, tilt, rot)`: draws one full lily onto a hidden canvas, once.
  - Builds 6 petals, 60 degrees apart. Outer petals are slimmer, inner ones wider.
  - `point(pe, t, s)` turns a spot on a petal into an x,y position. `t` is how far along the petal (0 = base, 1 = tip) and `s` is how far across it (-1 to 1). Petal width follows a sine curve, so it's pointy at both ends and wide in the middle.
  - Fills each petal with a dark shape first, so petals hide whatever is behind them.
  - Scatters dots over the petal. Color goes from base to tip, edges get brighter, the center line is a darker vein, and a few dark speckles appear near the base.
  - Draws 6 stamens: thin stalks with orange dot clusters on the end.
  - `tilt` squashes the flower vertically so it looks angled toward you instead of flat.
- `makeLeaves()`: draws about 16 green leaves once, using the same petal-shape idea, pointing up and outward from the bottom of the bouquet.
- `build()`: sets the canvas size, creates all the lilies from `LAYOUT`, makes the leaves, and scatters the stars. It runs on load, on window resize, and on click.
- `frame(ms)`: runs about 60 times per second to animate.
  1. Clears the screen to black.
  2. Draws the twinkling stars (their brightness follows a sine wave).
  3. Draws the pre-made leaves.
  4. Works out each lily's position, with a small sine-wave sway.
  5. Draws the dashed green stems as curves from the bottom point to each flower.
  6. Draws each lily on top, rocking slightly.

### Why draw lilies onto hidden canvases?

One bouquet is over 100,000 dots. Redrawing them all 60 times a second would make the page lag. Instead, each flower is drawn **once** onto its own hidden canvas, and every frame just copies that image to the screen with `drawImage`, which is very fast.

## Ideas to make it your own

- Change the colors in `PALETTES`.
- Move or resize flowers in `LAYOUT`.
- Make the dots bigger or smaller (the `2.2` and `1.2` in the `fillRect` calls).
- Change the sway speed (the `0.6` and `0.5` in `frame`).
- Add a glow behind the biggest flower with `ctx.shadowBlur`.

## Built with

HTML5 Canvas, CSS and vanilla JavaScript.