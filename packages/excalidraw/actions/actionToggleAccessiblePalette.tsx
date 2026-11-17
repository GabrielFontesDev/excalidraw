import { CaptureUpdateAction } from "@excalidraw/element";

import { eyeIcon } from "../components/icons";

import { register } from "./register";

/** swaps the stroke top picks for the colorblind-safe ones
 * (`ACCESSIBLE_ELEMENT_STROKE_PICKS`). Does not recolor existing elements. */
export const actionToggleAccessiblePalette = register({
  name: "accessiblePalette",
  label: "labels.accessiblePalette",
  icon: eyeIcon,
  keywords: ["colorblind", "color blind", "accessible", "contrast", "palette"],
  viewMode: false,
  trackEvent: {
    category: "canvas",
    predicate: (appState) => !appState.accessiblePaletteEnabled,
  },
  perform(elements, appState) {
    return {
      appState: {
        ...appState,
        accessiblePaletteEnabled: !this.checked!(appState),
      },
      captureUpdate: CaptureUpdateAction.NEVER,
    };
  },
  checked: (appState) => appState.accessiblePaletteEnabled,
});
