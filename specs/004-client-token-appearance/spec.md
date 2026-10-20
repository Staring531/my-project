# Feature Specification: Client Token Appearance

**Feature Branch**: `004-client-token-appearance`

**Created**: 2026-10-19

**Status**: Draft

**Input**: User description: "according new token design，update src/client"

## User Scenarios & Testing *(mandatory)*

A person using the photo library sees the same shared color set that was reviewed on the sample page. Every existing screen uses that set in a light appearance and a dark appearance. Text stays readable on its paired background. The tasks people already do with albums and pictures stay the same.

### User Story 1 - See the shared colors on the photo library (Priority: P1)

A person opens the photo library and moves through the screens they already use: the library, an album, and an enlarged picture. Surfaces, text, and actions use the shared semantic colors. The light appearance is showing.

**Why this priority**: The shared color set has no effect on the product until the screens people use are painted with it.

**Independent Test**: Open the library, an album, and an enlarged picture in the light appearance. Confirm each screen uses only the shared semantic colors and supporting appearance values, and that adding a photo, opening an album, and closing an enlarged picture still work.

**Acceptance Scenarios**:

1. **Given** the photo library is open in the light appearance, **When** a person looks at the library, an album, and an enlarged picture, **Then** each screen shows the shared semantic colors with paired text, including empty states, account forms, notices, and actions.
2. **Given** a screen is showing the light appearance, **When** a person reads text on its paired background, **Then** every text-and-background pair meets a contrast of at least 4.5 to 1.
3. **Given** any of those screens is showing, **When** a person looks for a one-off color, **Then** the screen uses only the semantic roles and supporting appearance values from the shared color set.
4. **Given** a person is doing an existing task, **When** the screen uses the shared colors, **Then** creating an account, signing in, adding a photo, opening an album, enlarging a picture, and leaving that picture still have their current outcomes.

---

### User Story 2 - Switch the library between light and dark (Priority: P1)

A person switches the whole photo library between the light appearance and the dark appearance and stays on the screen they were using.

**Why this priority**: The shared color set includes both appearances. A library that only shows one of them does not match that set.

**Independent Test**: Open an album, switch to the dark appearance, and confirm the same album is still open with the dark values. Switch back and confirm the light values return without leaving the album.

**Acceptance Scenarios**:

1. **Given** the library, an album, or an enlarged picture is open in the light appearance, **When** the person switches to the dark appearance, **Then** the same screen shows the dark values and does not need to be replaced by a different screen.
2. **Given** a screen is showing the dark appearance, **When** the person switches back, **Then** the light values return and the screen they were on is unchanged.
3. **Given** an album is open, a picture is enlarged, or a delete confirmation is showing, **When** the person switches appearance, **Then** that album, picture, or confirmation remains, and the person is not signed out.
4. **Given** either appearance is showing, **When** the person reads text on each paired background, **Then** every text-and-background pair meets a contrast of at least 4.5 to 1.

---

### User Story 3 - Reject a one-off color on a library screen (Priority: P2)

Someone tries to put a one-off color on a photo library screen. The project's color check fails until that color is removed. A passing check of the sample page is not proof that the library screen is clean.

**Why this priority**: The library stays on the shared set only if a one-off color on these screens is caught the same way a one-off color on the sample page is caught.

**Independent Test**: Add one raw numeric color or one named color to a library screen and run the color check. Remove it and run the check again. Confirm that a passing sample-page check was not the evidence.

**Acceptance Scenarios**:

1. **Given** the color check is passing, **When** a library style sheet is given a raw numeric color or a named color, **Then** the color check fails.
2. **Given** a library screen sets a raw color directly on an element, **When** the work is reviewed or checked, **Then** that direct color is found, and a passing style-sheet check is not treated as that finding.
3. **Given** the one-off color is removed, **When** the color check runs again, **Then** it passes.
4. **Given** the library screens use only the shared semantic roles, **When** the color check runs, **Then** it passes for those screens.

---

### Edge Cases

- An empty library and a library with no public photos remain readable in both appearances.
- A picture that cannot be shown still explains that failure, and the explanation stays readable.
- A delete confirmation stays visible and distinct in both appearances, and switching appearance does not confirm or cancel the delete.
- A duplicate-picture notice and other short notices stay readable in both appearances.
- Switching appearance does not change which album is open, which picture is enlarged, or whether the person is signed in.
- The colors inside a photograph stay the photograph's own colors. The frame around it uses the shared set.
- Borders, input outlines, and focus emphasis are visible in both appearances. They are not held to the 4.5 to 1 text contrast rule.
- The sample page still shows the full color set. The photo library does not replace it.
- Replacing the placeholder brand color does not rename roles and does not remove either appearance from the library screens.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The photo library, album, enlarged picture, account forms, empty states, notices, and actions MUST use the existing shared semantic color roles and their paired text colors.
- **FR-002**: Every one of those screens MUST be readable in the light appearance and in the dark appearance.
- **FR-003**: Text on its paired background MUST have a contrast of at least 4.5 to 1 in both appearances.
- **FR-004**: A person MUST be able to switch the photo library between the light appearance and the dark appearance and remain on the same screen.
- **FR-005**: Switching appearance MUST NOT sign the person out, change the open album, dismiss an enlarged picture, or confirm or cancel a pending delete.
- **FR-006**: Borders, input outlines, focus emphasis, and corners on these screens MUST use the shared supporting appearance values. Those supporting values MUST NOT be required to meet the 4.5 to 1 text contrast rule.
- **FR-007**: The project's color check MUST fail when a photo library style sheet contains a raw numeric color or a named color. It MUST pass when those style sheets use only the shared semantic roles and supporting appearance values.
- **FR-008**: A color set directly on a photo library screen MUST be found by review or by a check. A passing style-sheet check, including a passing check of the sample page, MUST NOT be treated as proof that the direct color was found.
- **FR-009**: Existing photo library tasks MUST keep their current outcomes. This feature MUST NOT add or remove an album, picture, account, or privacy behavior.
- **FR-010**: A photograph MUST keep its own colors. Only the surrounding screen uses the shared color set.
- **FR-011**: The sample page that reviews the shared color set MUST remain available and MUST still show every semantic role in both appearances.

### Key Entities

- **Organizer screen**: A photo library surface a person already uses, including the library, an album, an enlarged picture, account entry, empty states, and notices. It is painted from the shared color set.
- **Appearance choice**: The light or dark presentation of the whole organizer. It changes colors, not the open task. Light is the appearance a person sees first.
- **Semantic color role**: A named purpose for color from the existing shared set, such as the page background, a card, a primary action, or a warning. This feature uses that set and does not define a second one.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In one review sitting, a person can open the library, an album, and an enlarged picture in both appearances, and none of those screens introduces a color outside the shared set.
- **SC-002**: Every text-and-background pair on those screens measures at least 4.5 to 1 in the light appearance and at least 4.5 to 1 in the dark appearance.
- **SC-003**: A person can switch from light to dark and back while an album is open in under 10 seconds, and the same album is still open afterward.
- **SC-004**: In 5 trials that each add one raw numeric color or one named color to a library screen, the color check fails all 5 times. Removing that color makes the check pass. None of those failures depend on the sample page being the only screen that was checked.
- **SC-005**: A person can still create an account, sign in, add a photo, open an album, enlarge a picture, and close that picture on the first attempt, with the same outcomes as before this appearance change.

## Assumptions

- "The new token design" means the shared semantic color set already defined for this product: page background with its general text color, and card, popover, primary, secondary, muted, accent, destructive, success, warning, and info, each with paired text, plus shared values for borders, input outlines, focus emphasis, and one corner size. Both a light appearance and a dark appearance already exist. This feature does not choose a new brand color and does not rename those roles.
- The light appearance is the one a person sees first. The choice lasts while they are using the organizer and is not saved as part of their account.
- The screens in scope are the ones a person already uses to view the library, manage albums and pictures, and enter an account. New business tasks are out of scope. The sample page stays a review surface and is not removed.
- A raw numeric color includes a hexadecimal color. A named color includes an ordinary color name such as red. Semantic role names are not named colors.
- The 4.5 to 1 rule applies to text on its paired background. Borders, input outlines, and focus emphasis are excluded.
- The style-sheet check and the separate check for a color painted directly on a screen already exist. This feature extends their coverage to the photo library screens. A passing result for the sample page does not cover those screens.
- Photographs are content, not part of the color set.
- Acceptance scenarios in this specification are the behaviors that must be demonstrated before release (Principle II, Testing). The existing semantic roles remain the one color source (Principle I, Code Quality). This feature changes appearance only and does not add a business workflow (Principle III, Maintainability).
