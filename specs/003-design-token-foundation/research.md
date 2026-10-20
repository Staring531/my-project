# Research: Design Token Foundation

## One stylesheet, two appearances

- **Decision**: Store the placeholder palette in `src/client/tokens.css`. `:root` holds the light appearance. `.dark` on the sample page's root element holds the dark appearance. Each semantic role is a custom property written with `oklch()`. The sample page switches appearance by adding or removing `dark` on that root. It does not navigate to a second page.
- **Rationale**: The specification asks for one page and two appearances. A class on the page is the smallest switch that keeps both value sets in one file (Principle I, Code Quality; Principle III, Maintainability). `oklch()` is the form of the placeholder values already chosen for this feature, so the file does not translate them into another numeric form.
- **Alternatives considered**: A second sample page for the dark appearance. Rejected because the spec says the reviewer stays on the same page. A media query that only follows the operating system. Rejected because the reviewer must be able to switch on purpose. Tailwind `@theme` mappings and a component library. Rejected in the dependency decision below.

## The role catalog is one module

- **Decision**: `src/client/token-roles.js` exports the closed list: page background with its general text color, and card, popover, primary, secondary, muted, accent, destructive, success, warning, and info, each with a paired text color. It also exports the supporting names `border`, `input`, `ring`, and `radius`. The sample page renders that list. The contrast test requires every paired role to exist under both `:root` and `.dark` in `tokens.css`.
- **Rationale**: A second handwritten list in the page would be a second catalog (Principle I, Code Quality). Supporting names are in the catalog so the preview can show them, and they are marked as non-text so the contrast rule is not applied to them.
- **Alternatives considered**: Parsing the catalog only from the CSS file. Rejected because a typo in a property name would silently drop a role from the page and the test would have nothing independent to compare. Generating the CSS from the module. Rejected because the CSS file is the value source a later reader edits.

## Placeholder blue-violet brand

- **Decision**: Use the supplied placeholder values. Light primary, ring, and the matching text colors use hue 262. Dark primary and ring use the lighter counterpart of that same hue. Warning, success, info, and destructive keep their own hues. Replacing the brand later means editing the hue and chroma of primary, ring, secondary, muted, and accent in both appearances, then re-running the contrast test. Role names do not change.
- **Rationale**: The specification says the final brand color is out of scope and the current emphasis is a placeholder. Keeping those values avoids inventing a second palette.
- **Alternatives considered**: Inventing a neutral gray brand. Rejected because a placeholder was already chosen. Locking the hue in JavaScript. Rejected because the stylesheet is the value source.

## Contrast is computed in the test

- **Decision**: `tests/unit/token-contrast.test.js` parses `tokens.css`, converts each `oklch()` pair to sRGB, and asserts WCAG 2.x contrast of at least 4.5 to 1 for every text-and-background pair in both appearances. The conversion function lives in that test file. Borders, input outlines, and focus emphasis are not asserted. A pair that falls short fails the test with the role name and the appearance.
- **Rationale**: The specification's contrast rule is an observable outcome and must be proven by a test (Principle II, Testing). A comment that claims the pairs were checked is not that proof. Node has no color library, and Quality Constraints forbid a dependency the standard library and a short function can replace.
- **Alternatives considered**: A manual screenshot as the only contrast evidence. Rejected because it is not repeatable. A color library. Rejected because the conversion is a fixed formula and a dependency is not required.

## Two color checks, neither is a new linter

- **Decision**: `node:test` hosts both checks, and both run under the existing `npm test` script. The style-sheet check reads CSS text and reports a raw numeric color (`#` hexadecimal, `rgb()`, `hsl()`, or a similar function other than `oklch()` inside `tokens.css`) or a CSS named color. `token-preview.css` may contain `var(--...)` and no color literals. The screen check is a different function in a different test file. It reads the sample page's script and markup and reports a raw color or a named color set directly on an element. A passing style-sheet result does not satisfy the screen test. Findings include the kind of color and the offending text. The photo organizer's `styles.css` is not an input to either check.
- **Rationale**: The specification requires the style-sheet failure and, separately, a finding for a color painted on a screen. Existing `node:test` already has to pass before merge (Principle II, Testing). The photo organizer is a business screen and is out of scope, so a repository-wide stylesheet lint would fail for colors this feature is not allowed to rewrite.
- **Alternatives considered**: Stylelint with only `color-no-hex` and `color-named`. Rejected because it is a new dependency, and turning it on for every stylesheet would fail the existing photo styles that this feature must leave alone. An ESLint rule for a TypeScript component. Rejected because this client is JavaScript and the screen check only needs to read the sample page source. Relying on human review alone for the screen. Rejected because Principle II requires an automated proof, and the spec allows a check. The check still does not pretend to be the style-sheet check.

## The sample page stays out of the photo shell

- **Decision**: `src/client/token-preview.html` is a second document in the Vite client root. It loads `token-preview.css`, `tokens.css`, and `token-preview.js` only. The reviewer opens it from the dev server path `/token-preview.html`. The control that switches appearance is a button on that page. The photo `index.html`, `main.js`, and `styles.css` are not modified.
- **Rationale**: Importing the photo stylesheet would put one-off colors on the sample page and would fail the sample page's own rule (Principle I, Code Quality). A route inside the photo shell would couple a review page to sign-in and album layout (Principle III, Maintainability).
- **Alternatives considered**: A section on the photo library page. Rejected because the library page's stylesheet is full of one-off colors and the spec excludes business screens. A build-time rewrite of `styles.css` onto tokens. Rejected because that is a visual change to the organizer, which is out of scope.

## No new UI stack

- **Decision**: Do not add React, TypeScript, Tailwind CSS, or a component generator. Semantic roles are custom properties. The sample page uses ordinary elements and `var(--role)`.
- **Rationale**: The specification is met by the stylesheet, the catalog, the sample page, and the two checks. Quality Constraints allow a dependency only when the language and the existing project cannot meet the requirement. They can. Principle III requires the simplest design that meets the current spec.
- **Alternatives considered**: A new Vite React TypeScript app with Tailwind v4 utility classes mapped from the same variables. Rejected because it adds a second client, a compiler, and a utility framework for a review page that does not need them. The token names stay stable, so a later feature can map them into utilities if a future spec requires that mapping.
