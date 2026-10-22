# Research: Update Client Interface

## No new dependency

**Decision**: Add no package. Menus and dialogs stay the Radix components already copied under `src/client/components/ui/`. Placement stays the Playwright checks already in `tests/layout/`. Motion stays CSS. The full name of a shortened album stays on the element that already shows it.

**Rationale**: The constitution allows the React, Tailwind, and shadcn dependencies already in the project, and requires a named reason before any new one. Focus restore, Escape, and a 2-pixel focus ring are already available from those components plus `styles.css`. A tooltip package, an icon package, and a motion package would each repeat a behavior the page can do with the elements it has.

**Alternatives considered**: `motion` or `framer-motion` can cross-fade icons. This feature does not add icon swaps, and FR-017 only requires that reduced motion remove slides and scales. A tooltip library would be a second way to show a name the card already has.

## Appearance does not dismiss an overlay

**Decision**: The appearance switch is excluded from outside-dismiss on every dialog, popover, and menu. Choosing it, including the copy inside More, does not call the overlay's close handler and does not change the route. It only toggles the appearance class on the document, as `appearance.js` already does.

**Rationale**: FR-005 says an open menu, New album panel, dialog, or enlarged picture stays open. Radix treats a press outside the layer as a close. On a wide window the appearance switch sits outside that layer, so the press closes it. Inside More, the switch must also leave More open, because More is one of those layers.

**Alternatives considered**: Moving the appearance switch inside every overlay would satisfy the press, and would break the header order from spec 005. Closing and reopening the layer after the toggle fails FR-005.

## Focus returns to the opener

**Decision**: Dialogs, the New album panel, and menus keep Radix focus restore. The enlarged picture is not a Radix dialog; `preview.jsx` records the picture control that opened it and moves focus back to that control on Close, backdrop, and Escape. Closing the notice strip moves focus to the header's main action, Add photos or Sign in.

**Rationale**: FR-004 and the Notices section name those targets. Radix already returns focus when the trigger stays mounted, which the delete dialog does today. The enlarged layer is a custom cover, so it has to restore focus itself.

**Alternatives considered**: Rebuilding the enlarged picture as a dialog would restore focus and would also change its full-window placement from spec 005.

## Showable cover stays on the server

**Decision**: Date-album cover choice stays `showableCoverName` in `src/server/library.js`. The client does not pick a different cover. A card whose cover URL is missing while `photoCount` is greater than zero, or whose image fails to load, shows `This picture cannot be shown.` Named-album covers stay the first picture. A failed named-album cover uses the same sentence. Pictures that cannot be shown stay in the album and in the count.

**Rationale**: FR-002 and Principle I keep one visibility rule. The cover rule is presentation of that list, and the server already walks the date album in order. A second walk in the client would diverge when a file is missing. The sentence is the client's job because a file can fail after the page has the URL.

**Alternatives considered**: Choosing the cover in the browser from image load errors would skip a later good picture only after several failed requests, and would still need the server for the public library's first paint.

## Full name without a new widget

**Decision**: The album card's link and the album title use the full name as their accessible name. The visible line stays one line and truncated. Pointing at the line, or moving the keyboard to that link or title, shows the full name in a tooltip drawn by the page from a `data-full` attribute. The count uses tabular numerals so a change from 9 to 10 does not move the name.

**Rationale**: FR-009 requires the full name on point and on keyboard focus. The native `title` attribute is not shown for keyboard focus in every browser. The card already receives keyboard focus, so no extra tab stop is added.

**Alternatives considered**: Expanding the line on focus wraps the card and breaks the one-line rule from spec 005. A tooltip component adds a dependency the research above rejects.

## Focus ring, hit size, and field text

**Decision**: `button` and `input` stop clearing the focus outline. `styles.css` keeps one `:focus-visible` rule: a 2-pixel solid outline in the existing `--ring` role, on buttons, links, and inputs. On a window under 640 pixels wide, the header's main action and every close control are at least 44 by 44 pixels; every other visible control stays at least 24 by 24. Name and Secret use 16-pixel text at that width. `index.html` keeps `width=device-width, initial-scale=1` and does not add `maximum-scale`.

**Rationale**: FR-006, FR-015, and FR-016. The button variant currently sets `focus-visible:outline-none` and a 1-pixel ring, which is under the 2-pixel rule and hides the outline already in `styles.css`. A 16-pixel field is what stops a phone from zooming the page. Blocking pinch zoom would fail the same requirement for people who need to zoom.

**Alternatives considered**: A second focus color would be a new palette, which the spec forbids. `maximum-scale=1` stops the zoom and fails FR-016's purpose.

## Reduced motion

**Decision**: Any slide or scale on a dialog, menu, or screen is wrapped so it runs only when the person has not asked the device to reduce motion. Under that request the layer appears with no slide and no scale. No entrance animation is added.

**Rationale**: FR-017. The current overlays do not need a new animation. The rule stops a later transition from sliding a dialog that should simply be open.

**Alternatives considered**: Removing every transition, including the focus outline, is more than the spec asks. The outline is a state, not a slide.

## More menu

**Decision**: The narrow More menu lists New album, the appearance switch, and Sign out. The extra Cancel row is removed. Escape still closes More. The picture menu on a narrow window keeps the Cancel row spec 005 requires.

**Rationale**: FR-011 names More and does not remove the picture menu's Cancel. Spec 005's header section lists the remaining header controls inside More and does not list Cancel.

**Alternatives considered**: Keeping Cancel makes a second close next to Escape and fails the header section of this spec.
