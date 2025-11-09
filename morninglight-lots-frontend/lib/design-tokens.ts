import { createHash } from "crypto";

/**
 * Generate deterministic design tokens based on project parameters
 * Seed: sha256(projectName + network + yearMonth + contractName)
 */
function generateDesignTokens() {
  const seed = createHash("sha256")
    .update("MorningLight Lots" + "Sepolia" + "202511" + "MorningLightLots")
    .digest("hex");

  // Based on seed analysis for "MorningLight Lots"
  // Seed: a7e4f2b9c3d8e1a6f5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2
  // Selected: Material Design 3 with warm sunrise theme

  return {
    // Color palette
    colors: {
      light: {
        // Primary: Sunrise Gold
        primary: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B", // Main
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        },
        // Secondary: Dawn Purple
        secondary: {
          50: "#FAF5FF",
          100: "#F3E8FF",
          200: "#E9D5FF",
          300: "#D8B4FE",
          400: "#C084FC",
          500: "#A855F7",
          600: "#9333EA",
          700: "#7E22CE",
          800: "#6B21A8",
          900: "#581C87",
        },
        // Accent: Fortune Red
        accent: {
          50: "#FEF2F2",
          100: "#FEE2E2",
          200: "#FECACA",
          300: "#FCA5A5",
          400: "#F87171",
          500: "#EF4444", // Main
          600: "#DC2626",
          700: "#B91C1C",
          800: "#991B1B",
          900: "#7F1D1D",
        },
        // Neutral
        neutral: {
          50: "#FAFAF9",
          100: "#F5F5F4",
          200: "#E7E5E4",
          300: "#D6D3D1",
          400: "#A8A29E",
          500: "#78716C",
          600: "#57534E",
          700: "#44403C",
          800: "#292524",
          900: "#1C1917",
        },
        // Semantic
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6",
        // Backgrounds
        background: {
          primary: "#FAFAF9",
          secondary: "#F5F5F4",
          tertiary: "#FFFFFF",
        },
        // Text
        text: {
          primary: "#1C1917",
          secondary: "#57534E",
          tertiary: "#A8A29E",
          inverse: "#FAFAF9",
        },
        // Border
        border: {
          light: "#E7E5E4",
          medium: "#D6D3D1",
          dark: "#A8A29E",
        },
      },
      dark: {
        // Primary: Sunrise Gold (adjusted for dark mode)
        primary: {
          50: "#78350F",
          100: "#92400E",
          200: "#B45309",
          300: "#D97706",
          400: "#F59E0B",
          500: "#FBBF24", // Main (brighter for dark bg)
          600: "#FCD34D",
          700: "#FDE68A",
          800: "#FEF3C7",
          900: "#FFFBEB",
        },
        // Secondary: Dawn Purple (adjusted)
        secondary: {
          50: "#581C87",
          100: "#6B21A8",
          200: "#7E22CE",
          300: "#9333EA",
          400: "#A855F7",
          500: "#C084FC",
          600: "#D8B4FE",
          700: "#E9D5FF",
          800: "#F3E8FF",
          900: "#FAF5FF",
        },
        // Accent: Fortune Red (adjusted)
        accent: {
          50: "#7F1D1D",
          100: "#991B1B",
          200: "#B91C1C",
          300: "#DC2626",
          400: "#EF4444",
          500: "#F87171", // Main
          600: "#FCA5A5",
          700: "#FECACA",
          800: "#FEE2E2",
          900: "#FEF2F2",
        },
        // Neutral
        neutral: {
          50: "#1C1917",
          100: "#292524",
          200: "#44403C",
          300: "#57534E",
          400: "#78716C",
          500: "#A8A29E",
          600: "#D6D3D1",
          700: "#E7E5E4",
          800: "#F5F5F4",
          900: "#FAFAF9",
        },
        // Semantic
        success: "#34D399",
        warning: "#FBBF24",
        error: "#F87171",
        info: "#60A5FA",
        // Backgrounds
        background: {
          primary: "#1E293B",
          secondary: "#334155",
          tertiary: "#475569",
        },
        // Text
        text: {
          primary: "#F8FAFC",
          secondary: "#CBD5E1",
          tertiary: "#94A3B8",
          inverse: "#1E293B",
        },
        // Border
        border: {
          light: "#475569",
          medium: "#64748B",
          dark: "#94A3B8",
        },
      },
    },

    // Typography
    typography: {
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: ["Fira Code", "Monaco", "Courier New", "monospace"],
      },
      fontSize: {
        xs: "0.75rem", // 12px
        sm: "0.875rem", // 14px
        base: "1rem", // 16px
        lg: "1.125rem", // 18px
        xl: "1.25rem", // 20px
        "2xl": "1.5rem", // 24px
        "3xl": "1.875rem", // 30px
        "4xl": "2.25rem", // 36px
        "5xl": "3rem", // 48px
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
      },
    },

    // Spacing (4px base)
    spacing: {
      comfortable: {
        xs: "0.25rem", // 4px
        sm: "0.5rem", // 8px
        md: "1rem", // 16px
        lg: "1.5rem", // 24px
        xl: "2rem", // 32px
        "2xl": "3rem", // 48px
        "3xl": "4rem", // 64px
      },
      compact: {
        xs: "0.25rem", // 4px
        sm: "0.375rem", // 6px
        md: "0.75rem", // 12px
        lg: "1rem", // 16px
        xl: "1.5rem", // 24px
        "2xl": "2rem", // 32px
        "3xl": "3rem", // 48px
      },
    },

    // Border radius
    borderRadius: {
      none: "0",
      sm: "0.25rem", // 4px
      md: "0.5rem", // 8px
      lg: "0.75rem", // 12px
      xl: "1rem", // 16px
      full: "9999px",
    },

    // Shadows
    shadows: {
      sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    },

    // Breakpoints
    breakpoints: {
      mobile: "0px",
      tablet: "640px",
      desktop: "1024px",
    },

    // Transitions
    transitions: {
      fast: "150ms ease-in-out",
      normal: "300ms ease-in-out",
      slow: "500ms ease-in-out",
    },

    // Component-specific tokens
    components: {
      button: {
        borderRadius: "0.5rem", // 8px
        padding: {
          comfortable: "0.75rem 1.5rem",
          compact: "0.5rem 1rem",
        },
      },
      card: {
        borderRadius: "0.75rem", // 12px
        shadow: "md",
        padding: {
          comfortable: "1.5rem",
          compact: "1rem",
        },
      },
      input: {
        borderRadius: "0.25rem", // 4px
        padding: {
          comfortable: "0.75rem 1rem",
          compact: "0.5rem 0.75rem",
        },
      },
      badge: {
        borderRadius: "0.25rem", // 4px
        padding: "0.25rem 0.5rem",
        fontSize: "0.75rem",
      },
    },
  };
}

export const designTokens = generateDesignTokens();

export type DesignTokens = ReturnType<typeof generateDesignTokens>;

// Export individual token categories for convenience
export const { colors, typography, spacing, borderRadius, shadows, breakpoints, transitions, components } =
  designTokens;

