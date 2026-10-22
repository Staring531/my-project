# Research: Client Web Design

## No new package

**Decision**: Add no package. The look stays in `src/client/tokens.css` and `src/client/styles.css`. Language and appearance memory stay in one small preference module that reads and writes an injectable storage object. The browser passes `localStorage`. Interface sentences stay in one copy module.

**Rationale**: The constitution allows the React, Tailwind, and shadcn dependencies already in the project, and requires a named reason before any new one. A translation library, a toast library, and a font package would each repeat a behavior the page can do with the elements it has.

**Alternatives considered**: An i18n package would be a second list of the sentences Interface copy already names. A toast package would be a second confirmation. A downloaded font would break the rule that type comes from the device.

## Retune the existing roles

**Decision**: Keep the role names in `src/client/token-roles.js`. Change their `oklch()` values in `src/client/tokens.css`. Do not add a parallel palette and do not put a hexadecimal color in a screen style sheet.

Light: page and card are white; body text and the main action are near-black; the main action's text is white. Dark: the page is pure black (`oklch(0 0 0)`); the card is a near-black lift; the main action is a light fill with near-black text. `info` is the blue used for links and small marks, dark enough that white text on it and the blue on white both clear 4.5 to 1. `accent` stays a neutral hover tint so a button hover is not a blue fill. `destructive` stays a red pair. `--ring` is a gray, and the focus outline in `styles.css` becomes 3 pixels. `--radius` becomes 12 pixels so cards and dialogs that use the large radius match FR-006. Buttons and fields set a 6-pixel radius directly, because the medium radius is defined as the large radius minus 2 pixels and would otherwise be 10 pixels.

The header uses a token `oklch()` value with an alpha, referenced from `styles.css` as a variable, so the bar can show the page faintly through it without a named color. The existing contrast test only parses `oklch(L C H)` without alpha, and it only checks the semantic pairs, so this extra token does not enter that parser.

**Rationale**: Spec 003 fixes the role names, and spec 008 says those names stay while the displayed values change. The tokens profile allows `oklch()` and rejects hexadecimal colors. FR-002 forbids a blue main action. FR-005 forbids a blue button fill. FR-012 still requires 4.5 to 1 on every text pair, which `tests/unit/token-contrast.test.js` already checks.

**Alternatives considered**: Painting the web-design hexadecimal values into `styles.css` would fail the screen color check. Adding a `link` role would rename the sample catalog, which the spec forbids. Using `accent` for the blue would turn `hover:bg-accent` into a blue button fill.

## One copy module, server strings stay English

**Decision**: `src/client/copy.js` holds every Interface copy row and the month-heading pattern. Screens ask it for the active language. The server keeps the English sentences in `src/server/server.js` and `src/client/notice.js`. The client maps a known English sentence to the active language and shows an unknown sentence as received.

**Rationale**: Contract tests assert the English API errors. Translating them on the server would break those contracts and would duplicate the table. Principle I wants one implementation of each sentence.

**Alternatives considered**: Replacing the server strings with Chinese would make the English interface depend on a second server path. Scattering the Chinese sentences through the screen files would make a missed row invisible until a screenshot.

## Remember appearance and language in one place

**Decision**: A preference module reads and writes `{ appearance, language }` through storage methods `getItem` and `setItem`. Missing values are `light` and `zh`. The organizer loads them once and writes them when either changes. `appearance.js` still only toggles the document class. `document.documentElement.lang` follows the language (`zh` or `en`).

**Rationale**: FR-019 and FR-022 both say the next visit opens on the choice the person made, and the first visit is light and Chinese. Today `organizer.jsx` starts from the constant `"light"` and does not store it. Two storage keys written from two modules would be two implementations of the same memory rule. Tests pass a memory storage object, so they do not touch the browser.

**Alternatives considered**: A cookie or a server column would remember the choice across browsers and would add a request the spec does not ask for. Reading `prefers-color-scheme` would override spec 004's light-first rule, which spec 008 keeps.

## Language switch shares the appearance exception

**Decision**: The language switch sits immediately before the appearance switch. On a narrow window both sit in More; when signed out, More holds only those two and Sign in stays visible. Choosing either switch does not close an open menu, panel, dialog, or enlarged picture. The same outside-dismiss exception spec 006 added for `#appearance-switch` gains the language switch.

**Rationale**: FR-022 places the switch and says the page stays. Radix closes a layer on an outside press. The narrow More menu is what keeps the 56-pixel header on one line at 320 pixels.

**Alternatives considered**: Leaving both switches visible beside Sign in on a narrow signed-out header crowds the title and risks sideways scroll, which FR-014 forbids.

## Loading blocks and a timed confirmation

**Decision**: The organizer keeps a loading flag until the first library response settles. The library and the album show quiet blocks in the card shape while that flag is set, and they do not show the empty sentences yet. A create, delete, or privacy change that succeeds sets a confirmation whose sentences are the four rows in Interface copy. A clock argument clears it at 4 seconds. Reduced motion removes the confirmation and skeleton animation and does not clear a dialog's positioning transform.

**Rationale**: FR-016 requires the blocks and the confirmation, and it forbids a blocking alert. The empty sentences are for a loaded library that has nothing in it. An injectable clock keeps the 4-second check deterministic.

**Alternatives considered**: A browser `alert()` is forbidden. Guessing the load from an empty array would show "there are no public photos" during the request.

## Enter during composition does not submit

**Decision**: The sign-in form and the New album form ignore Enter on keydown while `event.isComposing` is true or `event.keyCode` is 229. The character is confirmed. A later Enter submits as it does today.

**Rationale**: FR-015. Those are the three fields the spec names. The check lives on the two forms, not on a global key listener.

**Alternatives considered**: Disabling Enter entirely would block the keyboard submit spec 006 requires after composition finishes.
