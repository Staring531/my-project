# Contract: Token Preview

What a reviewer sees on the sample page. Colors come only from [data-model.md](../data-model.md). The page does not read the photo library and does not decide contrast.

The page address during development is `/token-preview.html` on the Vite origin. The library server is not required.

## First view

- The light appearance is showing.
- Every semantic role from the catalog is visible, with its name and a sample of its paired text.
- Supporting swatches for border, input outline, and focus emphasis are visible and labeled. They are not presented as text-contrast samples.
- A corner using the shared radius is visible.
- No photo-organizer control is on the page.

## Switching appearance

- A single control switches between light and dark.
- The control's label states the appearance that is currently showing.
- After the switch, the same role names are still on the page and the address is unchanged.
- Switching back returns the light values.

## Observable markup

The view function returns markup that tests can read without a browser:

- Each role row includes the role name and the text name.
- The surface element uses the custom property for that role, and the text uses the paired text property. The markup does not contain a hexadecimal color, a named color, or a color function.
- The root records the appearance as `light` or `dark`.
- The switch control is present in both appearances.

## What this page does not do

- It does not sign a person in, list albums, or change a photo.
- It does not import the photo organizer stylesheet.
- It does not calculate contrast. The contrast proof is the test described in [color-check.md](color-check.md).
