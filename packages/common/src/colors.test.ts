import {
  ACCESSIBLE_COLOR_PALETTE,
  ACCESSIBLE_COLOR_MAP,
  ACCESSIBLE_ELEMENT_STROKE_PICKS,
  applyAccessiblePaletteFilter,
  applyColorFilters,
  applyDarkModeFilter,
  COLOR_PALETTE,
  COLOR_TOP_PICKS_SLOTS,
  DEFAULT_ELEMENT_STROKE_PICKS,
  getContrastRatio,
  meetsContrast,
  removeDarkModeFilter,
  rgbToHex,
  WCAG_MIN_CONTRAST_GRAPHICS,
  WCAG_MIN_CONTRAST_TEXT,
} from "@excalidraw/common";

describe("COLOR_PALETTE", () => {
  it("color palette doesn't regress", () => {
    expect(COLOR_PALETTE).toMatchSnapshot();
  });
});

describe("applyDarkModeFilter", () => {
  describe("basic transformations", () => {
    it("transforms black to near-white", () => {
      const result = applyDarkModeFilter("#000000");
      // Black inverted 93% + hue rotate should be near white/light gray
      expect(result).toBe("#ededed");
    });

    it("transforms white to near-black", () => {
      const result = applyDarkModeFilter("#ffffff");
      // White inverted 93% should be near black/dark gray
      expect(result).toBe("#121212");
    });

    it("transforms pure red", () => {
      const result = applyDarkModeFilter("#ff0000");
      // Invert 93% + hue rotate 180deg produces a cyan-ish tint
      expect(result).toBe("#ff9090");
    });

    it("transforms pure green", () => {
      const result = applyDarkModeFilter("#00ff00");
      // Invert 93% + hue rotate 180deg
      expect(result).toBe("#008f00");
    });

    it("transforms pure blue", () => {
      const result = applyDarkModeFilter("#0000ff");
      // Invert 93% + hue rotate 180deg produces a light purple
      expect(result).toBe("#cdcdff");
    });
  });

  describe("color formats", () => {
    it("handles hex with hash", () => {
      const result = applyDarkModeFilter("#ff0000");
      // Fully opaque colors return 6-char hex
      expect(result).toMatch(/^#[0-9a-f]{6}$/);
    });

    it("handles named colors", () => {
      const result = applyDarkModeFilter("red");
      // "red" = #ff0000, fully opaque
      expect(result).toBe("#ff9090");
    });

    it("handles rgb format", () => {
      const result = applyDarkModeFilter("rgb(255, 0, 0)");
      expect(result).toBe("#ff9090");
    });

    it("handles rgba format and preserves alpha", () => {
      const result = applyDarkModeFilter("rgba(255, 0, 0, 0.5)");
      expect(result).toMatch(/^#[0-9a-f]{8}$/);
      // Alpha 0.5 = 128 in hex = 80
      expect(result).toBe("#ff909080");
    });

    it("handles transparent", () => {
      const result = applyDarkModeFilter("transparent");
      // transparent = rgba(0,0,0,0), inverted should still have 0 alpha
      expect(result).toBe("#ededed00");
    });

    it("handles shorthand hex", () => {
      const result = applyDarkModeFilter("#f00");
      expect(result).toBe("#ff9090");
    });
  });

  describe("alpha preservation", () => {
    it("omits alpha for full opacity", () => {
      const result = applyDarkModeFilter("#ff0000ff");
      // Full opacity returns 6-char hex (no alpha suffix)
      expect(result).toBe("#ff9090");
    });

    it("preserves 50% opacity", () => {
      const result = applyDarkModeFilter("#ff000080");
      expect(result.slice(-2)).toBe("80");
    });

    it("preserves 0% opacity", () => {
      const result = applyDarkModeFilter("#ff000000");
      expect(result.slice(-2)).toBe("00");
    });
  });

  describe("COLOR_PALETTE regression tests", () => {
    it("transforms black from palette", () => {
      // COLOR_PALETTE.black is #1e1e1e (not pure black)
      const result = applyDarkModeFilter(COLOR_PALETTE.black);
      expect(result).toBe("#d3d3d3");
    });

    it("transforms white from palette", () => {
      const result = applyDarkModeFilter(COLOR_PALETTE.white);
      expect(result).toBe("#121212");
    });

    it("transforms transparent from palette", () => {
      const result = applyDarkModeFilter(COLOR_PALETTE.transparent);
      expect(result).toBe("#ededed00");
    });

    // Test each color family from the palette (all opaque, so 6-char hex)
    describe("red shades", () => {
      const redShades = COLOR_PALETTE.red;
      it.each(redShades.map((color, i) => [color, i]))(
        "transforms red shade %s (index %d)",
        (color) => {
          const result = applyDarkModeFilter(color as string);
          expect(result).toMatch(/^#[0-9a-f]{6}$/);
        },
      );
    });

    describe("blue shades", () => {
      const blueShades = COLOR_PALETTE.blue;
      it.each(blueShades.map((color, i) => [color, i]))(
        "transforms blue shade %s (index %d)",
        (color) => {
          const result = applyDarkModeFilter(color as string);
          expect(result).toMatch(/^#[0-9a-f]{6}$/);
        },
      );
    });

    describe("green shades", () => {
      const greenShades = COLOR_PALETTE.green;
      it.each(greenShades.map((color, i) => [color, i]))(
        "transforms green shade %s (index %d)",
        (color) => {
          const result = applyDarkModeFilter(color as string);
          expect(result).toMatch(/^#[0-9a-f]{6}$/);
        },
      );
    });

    describe("gray shades", () => {
      const grayShades = COLOR_PALETTE.gray;
      it.each(grayShades.map((color, i) => [color, i]))(
        "transforms gray shade %s (index %d)",
        (color) => {
          const result = applyDarkModeFilter(color as string);
          expect(result).toMatch(/^#[0-9a-f]{6}$/);
        },
      );
    });

    describe("bronze shades", () => {
      const bronzeShades = COLOR_PALETTE.bronze;
      it.each(bronzeShades.map((color, i) => [color, i]))(
        "transforms bronze shade %s (index %d)",
        (color) => {
          const result = applyDarkModeFilter(color as string);
          expect(result).toMatch(/^#[0-9a-f]{6}$/);
        },
      );
    });

    // Snapshot test for full palette to catch any regressions
    it("matches snapshot for all palette colors", () => {
      const transformedPalette: Record<string, string | string[]> = {};

      transformedPalette.black = applyDarkModeFilter(COLOR_PALETTE.black);
      transformedPalette.white = applyDarkModeFilter(COLOR_PALETTE.white);
      transformedPalette.transparent = applyDarkModeFilter(
        COLOR_PALETTE.transparent,
      );

      // Transform color arrays
      for (const colorName of [
        "gray",
        "red",
        "pink",
        "grape",
        "violet",
        "blue",
        "cyan",
        "teal",
        "green",
        "yellow",
        "orange",
        "bronze",
      ] as const) {
        const shades = COLOR_PALETTE[colorName];
        transformedPalette[colorName] = shades.map((shade) =>
          applyDarkModeFilter(shade),
        );
      }

      expect(transformedPalette).toMatchSnapshot();
    });
  });

  describe("caching", () => {
    it("returns same result for same input (cached)", () => {
      const result1 = applyDarkModeFilter("#ff0000");
      const result2 = applyDarkModeFilter("#ff0000");
      expect(result1).toBe(result2);
    });
  });
});

describe("removeDarkModeFilter", () => {
  it("restores black and white", () => {
    expect(removeDarkModeFilter("#ededed")).toBe("#000000");
    expect(removeDarkModeFilter("#121212")).toBe("#ffffff");
  });

  it.each([
    COLOR_PALETTE.black,
    COLOR_PALETTE.white,
    COLOR_PALETTE.red[4],
    COLOR_PALETTE.green[4],
    COLOR_PALETTE.blue[4],
  ])("preserves the rendered dark-mode color for %s", (color) => {
    const filtered = applyDarkModeFilter(color);
    expect(applyDarkModeFilter(removeDarkModeFilter(filtered))).toBe(filtered);
  });
});

describe("rgbToHex", () => {
  describe("basic RGB conversion", () => {
    it("converts black (0,0,0)", () => {
      expect(rgbToHex(0, 0, 0)).toBe("#000000");
    });

    it("converts white (255,255,255)", () => {
      expect(rgbToHex(255, 255, 255)).toBe("#ffffff");
    });

    it("converts red (255,0,0)", () => {
      expect(rgbToHex(255, 0, 0)).toBe("#ff0000");
    });

    it("converts green (0,255,0)", () => {
      expect(rgbToHex(0, 255, 0)).toBe("#00ff00");
    });

    it("converts blue (0,0,255)", () => {
      expect(rgbToHex(0, 0, 255)).toBe("#0000ff");
    });

    it("converts arbitrary color", () => {
      expect(rgbToHex(30, 30, 30)).toBe("#1e1e1e");
    });
  });

  describe("leading zeros preservation", () => {
    it("preserves leading zeros for low values", () => {
      expect(rgbToHex(0, 0, 1)).toBe("#000001");
      expect(rgbToHex(0, 1, 0)).toBe("#000100");
      expect(rgbToHex(1, 0, 0)).toBe("#010000");
    });

    it("preserves zeros for single-digit hex values", () => {
      expect(rgbToHex(15, 15, 15)).toBe("#0f0f0f");
    });
  });

  describe("alpha handling", () => {
    it("omits alpha when undefined", () => {
      expect(rgbToHex(255, 0, 0)).toBe("#ff0000");
      expect(rgbToHex(255, 0, 0, undefined)).toBe("#ff0000");
    });

    it("omits alpha when fully opaque (1)", () => {
      expect(rgbToHex(255, 0, 0, 1)).toBe("#ff0000");
    });

    it("includes alpha for semi-transparent (0.5)", () => {
      // 0.5 * 255 = 127.5 -> rounds to 128 = 0x80
      expect(rgbToHex(255, 0, 0, 0.5)).toBe("#ff000080");
    });

    it("includes alpha for fully transparent (0)", () => {
      expect(rgbToHex(255, 0, 0, 0)).toBe("#ff000000");
    });

    it("includes alpha for near-opaque (0.99)", () => {
      // 0.99 * 255 = 252.45 -> rounds to 252 = 0xfc
      expect(rgbToHex(255, 0, 0, 0.99)).toBe("#ff0000fc");
    });

    it("pads alpha with leading zero when needed", () => {
      // 0.05 * 255 = 12.75 -> rounds to 13 = 0x0d
      expect(rgbToHex(255, 0, 0, 0.05)).toBe("#ff00000d");
    });
  });
});

describe("getContrastRatio", () => {
  it("returns 21 for black on white (WCAG maximum)", () => {
    expect(getContrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
  });

  it("returns 1 for the same color (WCAG minimum)", () => {
    expect(getContrastRatio("#e03131", "#e03131")).toBeCloseTo(1, 5);
  });

  it("is symmetric", () => {
    expect(getContrastRatio("#1971c2", "#ffffff")).toBeCloseTo(
      getContrastRatio("#ffffff", "#1971c2"),
      10,
    );
  });

  it("matches known values", () => {
    // default red x default green stroke picks
    expect(getContrastRatio("#e03131", "#2f9e44")).toBeCloseTo(1.31, 2);
    expect(getContrastRatio("#1971c2", "#ffffff")).toBeCloseTo(5.02, 2);
  });

  it("accepts any format tinycolor understands", () => {
    expect(getContrastRatio("black", "#fff")).toBeCloseTo(21, 5);
    expect(getContrastRatio("rgb(0, 0, 0)", "white")).toBeCloseTo(21, 5);
  });

  it("throws for invalid colors", () => {
    expect(() => getContrastRatio("not-a-color", "#ffffff")).toThrow();
    expect(() => getContrastRatio("#ffffff", "")).toThrow();
  });

  it("throws for colors that are not fully opaque", () => {
    expect(() => getContrastRatio("transparent", "#ffffff")).toThrow();
    expect(() => getContrastRatio("#00000080", "#ffffff")).toThrow();
  });
});

describe("meetsContrast", () => {
  it("uses the WCAG 1.4.11 graphics threshold (3:1) by default", () => {
    expect(WCAG_MIN_CONTRAST_GRAPHICS).toBe(3);
    // #2f9e44 on white = 3.45
    expect(meetsContrast("#2f9e44", "#ffffff")).toBe(true);
    // #f08c00 on white = 2.48
    expect(meetsContrast("#f08c00", "#ffffff")).toBe(false);
  });

  it("accepts a custom threshold", () => {
    expect(WCAG_MIN_CONTRAST_TEXT).toBe(4.5);
    // #2f9e44 on white = 3.45
    expect(meetsContrast("#2f9e44", "#ffffff", WCAG_MIN_CONTRAST_TEXT)).toBe(
      false,
    );
  });

  it("passes when the ratio is exactly the threshold", () => {
    expect(meetsContrast("#000000", "#ffffff", 21)).toBe(true);
  });
});

describe("DEFAULT_ELEMENT_STROKE_PICKS contrast baseline", () => {
  // documents the problem the accessible palette addresses
  it("yellow pick is below 3:1 on the default white canvas", () => {
    const yellow = DEFAULT_ELEMENT_STROKE_PICKS[4];
    expect(yellow).toBe(COLOR_PALETTE.yellow[4]);
    expect(getContrastRatio(yellow, COLOR_PALETTE.white)).toBeCloseTo(2.48, 2);
  });

  it("red and green picks are 1.31:1 apart", () => {
    const [, red, green] = DEFAULT_ELEMENT_STROKE_PICKS;
    expect(getContrastRatio(red, green)).toBeCloseTo(1.31, 2);
  });
});

describe("ACCESSIBLE_COLOR_PALETTE", () => {
  it("doesn't regress", () => {
    expect(ACCESSIBLE_COLOR_PALETTE).toMatchSnapshot();
  });

  it.each(Object.entries(ACCESSIBLE_COLOR_PALETTE))(
    "%s (%s) meets 3:1 on the default white canvas",
    (_name, color) => {
      expect(meetsContrast(color, COLOR_PALETTE.white)).toBe(true);
    },
  );

  it("has no duplicate colors", () => {
    const colors = Object.values(ACCESSIBLE_COLOR_PALETTE);
    expect(new Set(colors).size).toBe(colors.length);
  });
});

describe("ACCESSIBLE_ELEMENT_STROKE_PICKS", () => {
  it("fills every top-picks slot", () => {
    expect(ACCESSIBLE_ELEMENT_STROKE_PICKS).toHaveLength(COLOR_TOP_PICKS_SLOTS);
  });

  it("only uses colors from the accessible palette", () => {
    const palette: readonly string[] = Object.values(ACCESSIBLE_COLOR_PALETTE);
    for (const color of ACCESSIBLE_ELEMENT_STROKE_PICKS) {
      expect(palette).toContain(color);
    }
  });

  it("every pick meets 3:1 on the default white canvas", () => {
    for (const color of ACCESSIBLE_ELEMENT_STROKE_PICKS) {
      expect(meetsContrast(color, COLOR_PALETTE.white)).toBe(true);
    }
  });
});

describe("applyAccessiblePaletteFilter", () => {
  it("maps each default stroke pick to the accessible pick in the same slot", () => {
    DEFAULT_ELEMENT_STROKE_PICKS.forEach((color, i) => {
      expect(applyAccessiblePaletteFilter(color)).toBe(
        ACCESSIBLE_ELEMENT_STROKE_PICKS[i],
      );
    });
  });

  it("maps red to vermillion and green to bluish green", () => {
    expect(applyAccessiblePaletteFilter(COLOR_PALETTE.red[4])).toBe("#d55e00");
    expect(applyAccessiblePaletteFilter(COLOR_PALETTE.green[4])).toBe(
      "#009e73",
    );
  });

  it("is case-insensitive", () => {
    expect(applyAccessiblePaletteFilter("#E03131")).toBe("#d55e00");
  });

  it("keeps the alpha channel of a mapped color", () => {
    expect(applyAccessiblePaletteFilter("#e0313180")).toBe("#d55e0080");
  });

  it("leaves colors outside the map unchanged", () => {
    expect(applyAccessiblePaletteFilter("#123456")).toBe("#123456");
    expect(applyAccessiblePaletteFilter("transparent")).toBe("transparent");
    expect(applyAccessiblePaletteFilter(COLOR_PALETTE.red[1])).toBe(
      COLOR_PALETTE.red[1],
    );
  });

  it("does nothing when disabled", () => {
    expect(applyAccessiblePaletteFilter(COLOR_PALETTE.red[4], false)).toBe(
      COLOR_PALETTE.red[4],
    );
  });

  it("every mapped color meets 3:1 on the default white canvas", () => {
    for (const color of Object.values(ACCESSIBLE_COLOR_MAP)) {
      expect(meetsContrast(color, COLOR_PALETTE.white)).toBe(true);
    }
  });
});

describe("applyColorFilters", () => {
  it("is the identity with both filters off", () => {
    expect(
      applyColorFilters("#e03131", {
        isDarkMode: false,
        accessiblePalette: false,
      }),
    ).toBe("#e03131");
  });

  it("applies the accessible palette before the dark mode filter", () => {
    expect(
      applyColorFilters("#e03131", {
        isDarkMode: true,
        accessiblePalette: true,
      }),
    ).toBe(applyDarkModeFilter("#d55e00"));
  });
});
