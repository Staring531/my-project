# Research: Organizer Screen Layout

## Menus, panels, and dialogs

**Decision**: Add three Radix packages that this project does not have, and copy three shadcn component files that use them: `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, and `@radix-ui/react-popover`, as `src/client/components/ui/dialog.jsx`, `dropdown-menu.jsx`, and `popover.jsx`. The sign-in dialog, the delete confirmation, the Add pictures dialog, and every narrow-window bottom panel use Dialog. The wide-window picture menu uses Dropdown Menu. The wide-window New album panel uses Popover, anchored under the New album control. A narrow window does not use a fourth component: the same form or action list is placed in a Dialog that sits on the bottom edge.

**Rationale**: The constitution allows the React, Tailwind, and shadcn dependencies already in the project, and requires a named reason for any new one. Focus trapping, Escape to close, and returning focus to the opener are what FR-017 requires. The Node standard library and the three components already present (`button`, `input`, `card`) do not provide them. Dialog covers both centered dialogs and the bottom panel, so a separate sheet package is not needed. `@radix-ui/react-slot` is already installed and stays the slot primitive these components use.

**Alternatives considered**: Hand-built menus and dialogs keep the dependency count at zero and fail FR-017 as soon as focus handling is incomplete. A sheet component repeats Dialog. `lucide-react` is named in `components.json` but is not installed; copied components must not import it. Icon-only controls use a short text glyph plus the accessible name the spec requires, which adds no package.

## Placement checks

**Decision**: Add `playwright` as a dev dependency and run one Chromium check from `node --test`, in `tests/layout/screen-layout.test.js`. It loads the built organizer, sets the viewport to 320, 375, 640, 960, and 1440 pixels wide, and reads element rectangles. `npm test` runs this file with the rest of the suite. The quickstart records `npx playwright install chromium` as the one-time browser setup.

**Rationale**: FR-021 says a placement rule must fail when a rendered screen breaks it. `node:test` and string markup cannot measure overlap, a two-column grid, or sideways scrolling. No browser runner is in the project today.

**Alternatives considered**: Asserting CSS class names does not fail when two controls overlap. jsdom returns empty rectangles, so it cannot check FR-016.

## One React tree

**Decision**: `App.jsx` renders the header and the open screen directly. `photo-app.js` keeps the session, route, and screen state and stops creating a second root inside `#app`. Screen modules are JSX and use the shared `Button`, `Input`, and `Card`.

**Rationale**: A second root was only there so `node:test` could import string-rendering modules. Those modules cannot import the shadcn JSX files, which is why the header and the screens look like two products. Presence checks for owner-only controls, empty copy, and confirm-or-cancel move into the browser check, with the same outcomes. That is a move of assertions, not a weaker one.

**Alternatives considered**: Keeping `renderToStaticMarkup` wrappers in `.js` files avoids Playwright and keeps the two style systems. That is the current screen, which this feature replaces.

## Notice lifetime

**Decision**: `notice.js` keeps the batch summary until the person closes it or another batch replaces it. `consumePendingNotice` no longer clears the notice on the next library render. The unit test that expects one-time consumption is replaced by a test that the notice survives a render and clears on close.

**Rationale**: The spec's Assumptions section records this as a presentation change. The sentences reported for a skip, a duplicate, and an error stay the ones in specs 001 and 002.

**Alternatives considered**: Leaving the consume-once behavior would fail the Notices section of the spec.

## Truncation and the color check

**Decision**: One-line card text uses the Tailwind class `truncate`. New screen modules are added to the file list in `tests/unit/screen-color.test.js`. Copied shadcn sources must also pass `findScreenColors`: replace `white`, `black`, and `transparent` utility classes with the semantic roles from `tokens.css`. The word `white` is a named color to that scanner, so `white-space` must not appear in `styles.css`; truncation stays in the class name, where it is one word and is not matched.

**Rationale**: Spec 004 still scans organizer sources. A copied dialog that ships with `bg-white` would fail that check, and a `white-space` declaration in `styles.css` already failed it once.

**Alternatives considered**: Leaving the new JSX files off the scanner would hide a direct color on a screen, which spec 004 FR-008 forbids.

## Server and behavior

**Decision**: `src/server/` and `src/client/api.js` do not change. Date membership, visibility, deletion, and publication stay the rules in specs 001 and 002. The global `button, a` rule in `styles.css` is removed so a link and a primary action no longer share one size.

**Rationale**: FR-002 keeps those outcomes. The shared button rule is why a privacy control and a card link render at the same weight.

**Alternatives considered**: Restyling around the global rule leaves every new control the same size as every other control.
