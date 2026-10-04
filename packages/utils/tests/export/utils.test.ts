import { describe, it, } from "@std/testing/bdd";
import { assertEquals, assertStringIncludes, } from "@std/assert";
import {
  calculateBacktickWrapper,
  formatMarkdownFile,
  generateHeader,
  mapExtension,
  matchesGlobs,
  normalizePath,
  shouldIncludeFile,
} from "../../src/export/formatter.ts";
import type { ExportConfig, } from "../../src/tools/interfaces.ts";

// Helper to create custom config in tests
function makeConfig(overrides: Partial<ExportConfig> = {},): ExportConfig {
  return {
    outputFile: "snapshot.md",
    includes: ["**/*",],
    includeVersion: false,
    customInstruction: "Test",
    ...overrides,
  };
}

// ============================================================================
// 🛠️ UTILITY FUNCTIONS
// ============================================================================

describe("normalizePath", () => {
  it("converts backslashes to normal slashes", () => {
    assertEquals(normalizePath("a\\b\\c",), "a/b/c",);
  });

  it("converts to lowercase", () => {
    assertEquals(normalizePath("ABC/DEF",), "abc/def",);
  });

  it("handles both simultaneously", () => {
    assertEquals(normalizePath("A\\B\\C/DEF",), "a/b/c/def",);
  });

  it("preserves already normalized path", () => {
    assertEquals(normalizePath("a/b/c",), "a/b/c",);
  });

  it("handles empty string", () => {
    assertEquals(normalizePath("",), "",);
  });
});

describe("calculateBacktickWrapper", () => {
  it("returns ``` for text without backticks", () => {
    assertEquals(calculateBacktickWrapper("normal text",), "```",);
  });

  it("returns ```` for text with ```", () => {
    assertEquals(calculateBacktickWrapper("code with ```",), "````",);
  });

  it("returns 6 backticks for text with `````", () => {
    assertEquals(calculateBacktickWrapper("text `````",), "``````",);
  });

  it("uses at least 3 backticks", () => {
    assertEquals(calculateBacktickWrapper("with ` one backtick",), "```",);
    assertEquals(calculateBacktickWrapper("with `` two",), "```",);
  });

  it("handles multiple sequences (uses the largest)", () => {
    assertEquals(
      calculateBacktickWrapper("with ` and ``` and ``",),
      "````",
    );
  });

  it("handles empty string", () => {
    assertEquals(calculateBacktickWrapper("",), "```",);
  });
});

describe("mapExtension", () => {
  it("maps .manifest to json", () => {
    assertEquals(mapExtension("manifest.manifest",), "json",);
  });

  it("maps .jsonc to json", () => {
    assertEquals(mapExtension("config.jsonc",), "json",);
  });

  it("maps .yml to yaml", () => {
    assertEquals(mapExtension("workflow.yml",), "yaml",);
  });

  it("maps .sh to bash", () => {
    assertEquals(mapExtension("deploy.sh",), "bash",);
  });

  it("maps .env* to properties", () => {
    assertEquals(mapExtension(".env",), "properties",);
    assertEquals(mapExtension(".env.example",), "properties",);
    assertEquals(mapExtension(".env.local",), "properties",);
  });

  it("returns extension as is for unmapped cases", () => {
    assertEquals(mapExtension("file.ts",), "ts",);
    assertEquals(mapExtension("file.tsx",), "tsx",);
    assertEquals(mapExtension("file.md",), "md",);
  });

  it("is case insensitive", () => {
    assertEquals(mapExtension("file.JSONC",), "json",);
    assertEquals(mapExtension("file.YML",), "yaml",);
  });
});

describe("matchesGlobs", () => {
  it("should match with simple wildcards", () => {
    assertEquals(matchesGlobs("src/main.ts", ["src/*.ts",],), true,);
    assertEquals(matchesGlobs("src/main.js", ["src/*.ts",],), false,);
  });

  it("should match with recursive globstar", () => {
    assertEquals(
      matchesGlobs("packages/ui/src/app.tsx", ["packages/ui/**",],),
      true,
    );
  });

  it("should match with brace expansion", () => {
    assertEquals(
      matchesGlobs("src/main.tsx", ["src/**/*.{ts,tsx}",],),
      true,
    );
    assertEquals(
      matchesGlobs("src/main.ts", ["src/**/*.{ts,tsx}",],),
      true,
    );
    assertEquals(
      matchesGlobs("src/main.css", ["src/**/*.{ts,tsx}",],),
      false,
    );
  });
});

// ============================================================================
// 🎯 FILTERING LOGIC
// ============================================================================

describe("shouldIncludeFile", () => {
  describe("anti-loop protection", () => {
    it("blocks any file inside exports/", () => {
      const config = makeConfig({
        includes: ["**/*",],
      },);
      assertEquals(shouldIncludeFile("exports/server.md", config,), false,);
      assertEquals(shouldIncludeFile("exports/sub/file.ts", config,), false,);
    });

    it("blocks even with valid extension", () => {
      const config = makeConfig({
        includes: ["**/*.{md,ts}",],
      },);
      assertEquals(shouldIncludeFile("exports/any.ts", config,), false,);
    });
  });

  describe("modern mode includes / excludes", () => {
    it("allows file matching includes and not matching excludes", () => {
      const config: ExportConfig = {
        outputFile: "snapshot.md",
        includes: ["src/**/*.{ts,tsx}",],
        excludes: ["**/*.test.ts",],
      };
      assertEquals(shouldIncludeFile("src/app.tsx", config,), true,);
      assertEquals(shouldIncludeFile("src/app.test.ts", config,), false,);
    });
  });

  describe("additional paths and root files via glob", () => {
    it("allows additional path with valid extension", () => {
      const config: ExportConfig = {
        outputFile: "snapshot.md",
        includes: ["src/**/*.{ts,tsx}", ".github/workflows/*.{yml,yaml}",],
      };
      assertEquals(
        shouldIncludeFile(".github/workflows/deploy.yml", config,),
        true,
      );
      assertEquals(
        shouldIncludeFile(".github/workflows/ci.yaml", config,),
        true,
      );
    });

    it("blocks path with extension not matching glob", () => {
      const config: ExportConfig = {
        outputFile: "snapshot.md",
        includes: [".github/workflows/*.yml",],
      };
      assertEquals(
        shouldIncludeFile(".github/workflows/secret.png", config,),
        false,
      );
    });

    it("allows exact file in additional path", () => {
      const config: ExportConfig = {
        outputFile: "snapshot.md",
        includes: ["README.md",],
      };
      assertEquals(shouldIncludeFile("README.md", config,), true,);
    });
  });

  describe("folders and subfolders via glob", () => {
    it("allows file inside permitted subfolder", () => {
      const config: ExportConfig = {
        outputFile: "snapshot.md",
        includes: ["monorepo/server/{src,docs}/**/*.{ts,md}",],
      };
      assertEquals(
        shouldIncludeFile("monorepo/server/src/main.ts", config,),
        true,
      );
      assertEquals(
        shouldIncludeFile("monorepo/server/docs/architecture.md", config,),
        true,
      );
    });

    it("blocks file outside included folders", () => {
      const config: ExportConfig = {
        outputFile: "snapshot.md",
        includes: ["monorepo/server/src/**/*",],
      };
      assertEquals(
        shouldIncludeFile("monorepo/ui/src/app.tsx", config,),
        false,
      );
    });

    it("blocks file in excluded subfolder", () => {
      const config: ExportConfig = {
        outputFile: "snapshot.md",
        includes: ["monorepo/server/**/*",],
        excludes: ["monorepo/server/dist/**/*",],
      };
      assertEquals(
        shouldIncludeFile("monorepo/server/dist/bundle.js", config,),
        false,
      );
    });
  });

  describe("root files via glob", () => {
    it("allows explicitly configured root files", () => {
      const config: ExportConfig = {
        outputFile: "snapshot.md",
        includes: ["monorepo/server/{deno.json,deploy.sh}",],
      };
      assertEquals(
        shouldIncludeFile("monorepo/server/deno.json", config,),
        true,
      );
      assertEquals(
        shouldIncludeFile("monorepo/server/deploy.sh", config,),
        true,
      );
    });

    it("blocks unconfigured root files", () => {
      const config: ExportConfig = {
        outputFile: "snapshot.md",
        includes: ["monorepo/server/deno.json",],
      };
      assertEquals(
        shouldIncludeFile("monorepo/server/package.json", config,),
        false,
      );
    });
  });

  describe("docs type configuration via glob", () => {
    it("captures root and docs subfolder", () => {
      const config: ExportConfig = {
        outputFile: "snapshot.md",
        includes: ["readme.md", "docs/**/*.md",],
      };
      assertEquals(shouldIncludeFile("readme.md", config,), true,);
      assertEquals(shouldIncludeFile("docs/architecture.md", config,), true,);
    });

    it("blocks source code outside docs", () => {
      const config: ExportConfig = {
        outputFile: "snapshot.md",
        includes: ["docs/**/*.md",],
      };
      assertEquals(shouldIncludeFile("src/main.ts", config,), false,);
    });
  });
});

// ============================================================================
// 📝 CONTENT GENERATION
// ============================================================================

describe("generateHeader", () => {
  it("includes custom instruction", () => {
    const config = makeConfig({
      customInstruction: "This is a TEST code.",
    },);
    const result = generateHeader(config, "test", "1.0.0",);
    assertStringIncludes(result, "TEST code",);
  });

  it("includes version when includeVersion is true", () => {
    const config = makeConfig({ includeVersion: true, },);
    const result = generateHeader(config, "ui", "1.2.3",);
    assertStringIncludes(result, "[v1.2.3]",);
    assertStringIncludes(result, "BuildIt [v1.2.3]",);
  });

  it("does not include version when includeVersion is false", () => {
    const config = makeConfig({ includeVersion: false, },);
    const result = generateHeader(config, "server", "1.2.3",);
    assertEquals(result.includes("[v1.2.3]",), false,);
  });

  it("includes mode name in uppercase", () => {
    const config = makeConfig();
    const result = generateHeader(config, "ui", "1.0.0",);
    assertStringIncludes(result, "Mode: UI",);
  });

  it("includes generation timestamp", () => {
    const config = makeConfig();
    const result = generateHeader(config, "ui", "1.0.0",);
    assertStringIncludes(result, "Automatically generated at:",);
  });

  it("uses default header with file guidelines when header is not provided", () => {
    const config = makeConfig();
    const result = generateHeader(config, "ui", "1.0.0",);
    assertStringIncludes(
      result,
      "> Each file starts with a title indicating its exact relative path (e.g., `## File: src/main.ts`).",
    );
    assertStringIncludes(
      result,
      "> Whenever suggesting changes, clearly indicate which file should be modified based on these paths and provide the complete new code for the file.",
    );
  });

  it("allows replacing header via header option", () => {
    const customHeader = "> Special and unique guideline for this project.";
    const config = makeConfig({ header: customHeader, },);
    const result = generateHeader(config, "ui", "1.0.0",);
    assertStringIncludes(result, customHeader,);
    assertEquals(
      result.includes(
        "Each file starts with a title indicating its exact relative path",
      ),
      false,
    );
  });

  it("allows customizing project name via project option", () => {
    const config = makeConfig({ project: "MySuperApp", },);
    const result = generateHeader(config, "ui", "1.0.0",);
    assertStringIncludes(
      result,
      "# Exported Context from Project MySuperApp - Mode: UI",
    );
  });
});

describe("formatMarkdownFile", () => {
  it("formats file with path and content", () => {
    const result = formatMarkdownFile(
      "src/main.ts",
      "console.log('hello');",
    );
    assertStringIncludes(result, "## File: `src/main.ts`",);
    assertStringIncludes(result, "```ts",);
    assertStringIncludes(result, "console.log('hello');",);
  });

  it("uses mapped extension for highlight", () => {
    const result = formatMarkdownFile("config.jsonc", "{}",);
    assertStringIncludes(result, "```json",);
  });

  it("increases backticks when content has ```", () => {
    const content = "code with ```\nmore code";
    const result = formatMarkdownFile("file.md", content,);
    assertStringIncludes(result, "````md",);
    assertStringIncludes(result, "````",);
  });

  it("includes separator at the end", () => {
    const result = formatMarkdownFile("src/main.ts", "code",);
    assertStringIncludes(result, "---",);
  });
});
