# sass-library

A small Sass (SCSS) utility library with design tokens, mixins, and a lightweight grid + button system. The `demo/` folder contains a few static HTML pages that use the compiled CSS in `scss/`.

## What’s included

- **Design tokens**: `scss/partials/_vars.scss` (colors, spacing, radius, shadows, typography, breakpoints) + helper functions like `token()`, `space()`, `radius()`, `shadow()`.
- **Mixins**: `scss/mixins/_index.scss` (responsive `up/down/between`, accessibility helpers, layout helpers, etc.). Re-exported via `scss/mixins.scss`.
- **Grid**: `scss/partials/_grid.scss` generates `.row`, `.col`, `.row-phone`, `.row-tablet`, `.col-span-{1..12}`, `.col-span-auto`. Re-exported via `scss/grid.scss`.
- **Buttons**: `scss/partials/_buttons.scss` generates `.btn`, `.btn-{variant}`, `.btn-{size}`. Re-exported via `scss/buttons.scss`.
- **Alerts + toast**: `scss/partials/_alerts.scss` adds `.alert` variants and a `.toast-container` / `.toast` component (compiled CSS: `scss/alerts.css`, demo: `demo/alert.html`).

## Quick start

The demo HTML files already reference compiled CSS:

- Open any file in `demo/` (for example `demo/menu.html`) in a browser.
- It loads `scss/app.css`.

## Using in your own SCSS

Import what you need with Dart Sass’ module system (`@use` / `@forward`).

### Tokens

```scss
@use "scssartials/vars" as v;

.card {
    border-radius: v.radius(md);
    box-shadow: v.shadow(md);
    padding: v.space(4);
    color: v.token(colors, text, primary);
}
```

### Mixins

```scss
@use "scss/mixins" as m;

.container {
    @include m.container(72rem, 1rem);

    @include m.up(tablet) {
        @include m.container(80rem, 1.5rem);
    }
}
```

### Grid + buttons (generated classes)

```scss
@use "scss/grid";
@use "scss/buttons";
```

Then in HTML you can use:

- Grid: `.row` + `.col` + `.col-span-6` (etc), plus `.row-phone` / `.row-tablet`
- Buttons: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-sm`, `.btn-lg`, …

## Customizing defaults

Most modules expose `!default` variables so you can override configuration when you `@use` the underlying partials:

```scss
@use "scss/partials/grid" with (
  $grid-columns: 16,
  $grid-gutter: 1.25rem
);

@use "scss/partials/buttons" with (
  $button-variants: (
    primary: (bg: #111827, bg-hover: #000000, border: #000000, text: #ffffff)
  )
);
```

## Building CSS (optional)

If you have the Sass CLI installed:

```bash
sass scss/app.scss scss/app.css
sass --watch scss/app.scss:scss/app.css
```

## Notes

- This repo currently commits generated CSS and source maps in `scss/` (for example `scss/app.css`, `scss/grid.css`).
- No license is specified yet.
