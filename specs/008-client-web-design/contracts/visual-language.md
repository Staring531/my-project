# Contract: Visual Language

This contract is the rendered check for spec 008. Spec 005 `contracts/screen-layout.md` and spec 006 `contracts/interface-interaction.md` still decide region order, keyboard completion, and who can see a picture. This contract wins where the paint, the language, the loading blocks, and the confirmation differ.

A task that changes a screen cites Principle IV and this contract.

## Paint

Checked on the library, a date album, and an enlarged picture.

| Fact | Light | Dark |
| --- | --- | --- |
| Page | White | Pure black |
| Card | White, 1-pixel hairline, 12-pixel corner, no drop shadow | Near-black, 1-pixel hairline, 12-pixel corner, no drop shadow |
| Main action | Near-black fill, white text, 6-pixel corner, not blue | Light fill, near-black text, 6-pixel corner, not blue |
| Secondary action | Surface fill, 1-pixel border | Surface fill, 1-pixel border |
| Link | Blue text allowed | Blue text allowed |
| Focus | 3-pixel ring, visible | 3-pixel ring, visible |
| Header | 56 pixels, stays visible, 1-pixel bottom hairline | Same |

Hover changes color or the hairline only. A photograph keeps its own colors. Text on its paired background is at least 4.5 to 1. Dialogs may keep a soft shadow. Cards, buttons, and fields do not.

## Language

| Fact | Rule |
| --- | --- |
| First visit | Chinese. The switch reads `English`. The title is `照片日期相册`. |
| Switch | Exchanges every Interface copy row. The page, menu, and dialog stay open. |
| English selected | The switch reads `中文`. The title is `Photo Date Albums`. |
| Next visit | The language last chosen. Appearance memory is separate and still starts at light. |
| Not translated | Album names and stored dates. A month heading does translate. |
| Unknown server sentence | Shown as received. |

Wide and signed in, the header order is New album, Add photos, language, appearance, Sign out. Wide and signed out: language, appearance, Sign in. Narrow and signed in, More lists New album, language, appearance, Sign out. Narrow and signed out, More lists language and appearance, and Sign in stays visible.

## Loading, confirmation, and composition

| Fact | Rule |
| --- | --- |
| First library load | Quiet blocks in the card shape. The empty sentences are not shown yet. |
| Album created | `相册已创建。` or `Album created.` Gone within 4 seconds. |
| Picture deleted | `照片已删除。` or `Picture deleted.` |
| Privacy | `相册已公开。` / `Album is now public.` or `相册已设为私密。` / `Album is now private.` |
| Enter while composing | Name, Secret, and the album name do not submit. |

## Out of scope

Search, renaming, deleting a named album, dragging, and spec 007's reference file. The API request and response bodies stay the English contracts in specs 001 and 002.
