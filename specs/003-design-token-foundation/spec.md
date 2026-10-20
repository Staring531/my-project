# Feature Specification: Design Token Foundation

**Feature Branch**: `003-design-token-foundation`

**Created**: 2026-10-19

**Status**: Draft

**Input**: User description: "建立设计 token 基础。语义色包括 background、foreground、card、popover、primary、secondary、muted、accent、destructive，以及 success、warning、info，每个都有配套的前景色。同时支持亮色与深色，并提供一个示例页面供人工检查。样式表中的硬编码颜色必须被项目检查拒绝。画面上直接写死的颜色由审查或检查发现，不要求与样式表检查是同一种自动检查。示例页面在两种外观下都可读。品牌主色的最终确定和业务页面不在范围内。"

## User Scenarios & Testing *(mandatory)*

A reviewer can look at one sample page and see every semantic color in a light appearance and a dark appearance, with text that stays readable on its paired background. The shared color set is the only source of color. A style sheet that introduces a one-off color fails the project's color check. A color painted directly onto a screen is found by review or by a check, and that finding is not assumed to come from the style-sheet check.

### User Story 1 - Review the color set (Priority: P1)

A reviewer opens a sample page that shows every semantic color with its paired text. They can switch the whole page between a light appearance and a dark appearance and confirm that each role remains readable.

**Why this priority**: Later screens depend on one shared color set. The sample page is how a person checks that the set is complete and readable before any business screen uses it.

**Independent Test**: Open the sample page, read every role name in the light appearance, switch to the dark appearance, and confirm the same roles are still shown and still readable.

**Acceptance Scenarios**:

1. **Given** the sample page is open in the light appearance, **When** a reviewer looks at it, **Then** they see every semantic role listed in this specification, each shown with its paired text.
2. **Given** the sample page is showing the light appearance, **When** the reviewer switches to the dark appearance, **Then** the same roles are shown with the dark values, and the page does not need to be replaced by a different page.
3. **Given** the sample page is showing either appearance, **When** a reviewer reads the text on each paired background, **Then** every text-and-background pair meets a contrast of at least 4.5 to 1.
4. **Given** the sample page is showing either appearance, **When** a reviewer looks for a one-off color, **Then** the page uses only the semantic roles and supporting appearance values in this specification.

---

### User Story 2 - Reject a one-off color in a style sheet (Priority: P1)

Someone adding a screen tries to put a raw color into a style sheet. The project's color check fails until that color is removed.

**Why this priority**: A shared color set only stays shared if a one-off color cannot slip into a style sheet unnoticed.

**Independent Test**: Add one raw numeric color code, or one named color, to a style sheet and run the project's color check. Remove it and run the check again.

**Acceptance Scenarios**:

1. **Given** the color check is passing, **When** a style sheet is given a raw numeric color code such as a hexadecimal color, **Then** the color check fails.
2. **Given** the color check is passing, **When** a style sheet is given a named color such as red, **Then** the color check fails.
3. **Given** a style sheet change made the color check fail, **When** that one-off color is removed, **Then** the color check passes again.
4. **Given** a style sheet uses only the semantic roles and supporting appearance values, **When** the color check runs, **Then** it passes.

---

### User Story 3 - Find a color painted directly on a screen (Priority: P2)

Someone sets a color directly on a screen instead of using a semantic role. A reviewer or a check finds that choice. The style-sheet check is not required to be the thing that finds it.

**Why this priority**: The sample page and the style-sheet check come first. A color written directly on a screen is a second way the shared set can be bypassed, and it is caught even when the style-sheet check does not look there.

**Independent Test**: Set a raw color directly on one screen element and confirm that review or a check records the finding. Confirm that passing the style-sheet check alone is not treated as proof that the screen has no direct color.

**Acceptance Scenarios**:

1. **Given** a screen sets a raw color directly on an element, **When** the work is reviewed or checked, **Then** that direct color is found.
2. **Given** a screen sets a raw color directly on an element and the style sheets themselves contain no one-off color, **When** only the style-sheet color check is run, **Then** a passing style-sheet check is not treated as proof that the direct color was found.
3. **Given** a screen uses only semantic roles, **When** the work is reviewed or checked, **Then** no direct color is reported.

---

### Edge Cases

- A semantic color role is incomplete if it has text on it but no paired text color, or if it has a light value but no dark value.
- The warning color is lighter than the other emphasis colors. Its paired text still meets a contrast of at least 4.5 to 1 in both appearances.
- Switching appearance updates every role. A role does not keep the other appearance's color.
- Borders, input outlines, and focus emphasis are visible in both appearances. They are not held to the 4.5 to 1 text contrast rule.
- The sample page has no business task. An empty or unfinished business screen is not a substitute for it.
- Replacing the placeholder brand color does not rename the roles and does not remove the dark values.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The product MUST define these semantic color roles, and each role that carries text MUST have a paired text color: page background with its general text color, card, popover, primary, secondary, muted, accent, destructive, success, warning, and info.
- **FR-002**: Every semantic color role MUST have one value for the light appearance and one value for the dark appearance.
- **FR-003**: Text shown on its paired background MUST have a contrast of at least 4.5 to 1 in both the light appearance and the dark appearance.
- **FR-004**: A sample page MUST show every semantic role together with its paired text, in both appearances, so a person can check them without opening a business screen.
- **FR-005**: A person MUST be able to switch the sample page between the light appearance and the dark appearance and remain on that page.
- **FR-006**: The sample page MUST use only the semantic roles and the supporting appearance values. It MUST NOT introduce a one-off color.
- **FR-007**: The project's color check MUST fail when a style sheet contains a raw numeric color code or a named color. It MUST pass when style sheets use only the semantic roles and supporting appearance values.
- **FR-008**: A color set directly on a screen, instead of through a semantic role, MUST be found by review or by a check. A passing style-sheet color check MUST NOT be treated as proof that the direct color was found.
- **FR-009**: The shared appearance set MUST include values for borders, input outlines, focus emphasis, and one shared corner size. These supporting values are not text colors and MUST NOT be required to meet the 4.5 to 1 text contrast rule.
- **FR-010**: The brand emphasis color MUST be a placeholder that can be replaced later without renaming the semantic roles or dropping either appearance.

### Key Entities

- **Semantic color role**: A named purpose for color, such as primary or warning. It has a light value, a dark value, and, when text sits on it, a paired text color.
- **Appearance**: The light or dark presentation of the whole sample page. Switching appearance changes the values, not the role names.
- **Supporting appearance value**: A shared border, input outline, focus emphasis, or corner size. It is part of the foundation and is not a text color.
- **Sample page**: A review surface that shows the color set. It is not a business screen.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In one review sitting, a reviewer can point to every semantic role on the sample page in both appearances, and none of the roles in this specification are missing.
- **SC-002**: Every text-and-background pair on the sample page measures at least 4.5 to 1 in the light appearance and at least 4.5 to 1 in the dark appearance.
- **SC-003**: In 5 trials that each add one raw numeric color code or one named color to a style sheet, the color check fails all 5 times. Removing that color makes the check pass.
- **SC-004**: In 5 trials that each set one raw color directly on a screen, review or a check finds all 5. None of those 5 findings depend on the style-sheet check being the detector.
- **SC-005**: A reviewer can switch the sample page from light to dark and back in under 10 seconds, and the same role names remain visible after each switch.

## Assumptions

- The current brand emphasis is a placeholder in a blue-violet family. Choosing the final brand color is out of scope. Business screens are out of scope.
- "Paired text color" means the foreground that is meant to be read on that role. The page background's pair is the general text color. Card, popover, primary, secondary, muted, accent, destructive, success, warning, and info each have their own paired text color.
- The 4.5 to 1 rule applies to text on its paired background. Borders, input outlines, and focus emphasis are excluded from that rule.
- The automated color check looks at style sheets. It is not assumed to look at colors written directly on a screen. Those direct colors are found by review or by a separate check.
- A raw numeric color code includes hexadecimal colors. A named color includes ordinary color names such as red. Semantic role names are not named colors.
- Later business work will reuse these roles. This specification does not require those screens to exist yet.
- Acceptance scenarios in this specification are the behaviors that must be demonstrated before release (Principle II, Testing). The semantic roles are the one color source (Principle I, Code Quality). The sample page is a review surface and does not add a business workflow (Principle III, Maintainability).
