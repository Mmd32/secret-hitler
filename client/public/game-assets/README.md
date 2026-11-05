# Secret Hitler — Tabletop Asset Kit v1

This is an **asset handoff** for an existing mobile-first Secret Hitler game. The package contains independently usable SVG and transparent/opaque PNG exports of new graphical components. The three previously approved photographic role cards are included unchanged as PNG. `references/moodboard_generated_not_for_gameplay.png` is **only a moodboard**; it does not have correct game-board geometry or guaranteed wording.

## What is included

- 3 approved role portrait PNGs
- 2 enacted-policy face cards; 2 membership cards
- 2 voting cards (JA / NEIN); 4 common card-back designs
- 2 office placards (PRESIDENT / CHANCELLOR)
- 4 board types — liberal, fascist 5–6, fascist 7–8, fascist 9–10 — each in desktop and mobile form (8 exact-slot boards)
- election tracker, veto badge, illustrated power/stack markers
- JSON manifest with all file paths, natural canvas sizes, **precise slot rectangles and power locations**

## Board correctness — IMPORTANT

The 5 Liberal slots correspond to 5 enacted Liberal laws. The 6 Fascist slots correspond to 6 enacted Fascist laws. Fascist powers depend on initial player count:

| Fascist law | 5–6 | 7–8 | 9–10 |
|---|---|---|---|
| 1 | — | — | Investigate |
| 2 | — | Investigate | Investigate |
| 3 | Policy Peek | Special Election | Special Election |
| 4 | Execution | Execution | Execution |
| 5 | Execution | Execution | Execution |
| 6 | Fascist win | Fascist win | Fascist win |

The images are **static board skins** and should not determine gameplay. Render enacted policy cards at the slot coordinates in `asset-manifest.json`. Use the correct desktop/mobile asset and preserve proportions. The 6th fascist space is victory, not an executive action. The 5th fascist policy unlocks veto for subsequent legislative sessions.

## Integration prompt

1. Place `role/`, `policy/`, `membership/`, `vote/`, `backs/`, `placards/`, `boards/`, `markers/` and `asset-manifest.json` in `public/game-assets/`.
2. Read `asset-manifest.json`; choose one of four board types from **initial** player count, then mobile/desktop responsive variant.
3. Render the board as responsive `svg` or `img` with a relatively positioned container; overlay enacted-policy cards using the manifest slot boxes normalized to that board's `naturalSize`. Use proper layering and aspect ratios.
4. Keep secret role cards in secure views only. Do not pre-render hidden role or law information into public DOM or send it to other online players.
5. Do not embed the player name on the placard; overlay live names as semantic text in a separate UI layer.
6. Provide localized dynamic labels and instructions (Persian/English) in CSS/HTML instead of relying on artwork text. Use `dir=rtl` and bidirectional isolates for Latin/numbers.
7. Separate public/secret privacy screens in offline Pass & Play; on restoration always open to public cover screen.
8. In tests inspect that each enacted policy renders at the exact slot coordinates for each board variant and player count.

## Technical note

SVG files are usable directly in browsers and in design tools. PNGs are rendered exports, not source assets. Preserve original SVG source for resizing. No font files are bundled.

## Rights and historical context

This is a historically themed game, not an endorsement of fascism. The three role portraits were provided/approved in this conversation and are retained unchanged; their factual/photo provenance is not independently verified. The game itself and directly derived assets may be subject to the original Secret Hitler licensing terms (CC BY-NC-SA 4.0). Check commercial/distribution rights and appropriate attribution before publication.
