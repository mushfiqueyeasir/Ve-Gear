import {
  isLightPalette,
  normalizePalette,
  paletteToCssVars,
  type ThemePalette,
} from "@/lib/theme/palette";

/**
 * Injects the saved color palette onto `:root` so every page and component
 * (storefront + admin) inherits the same CSS variables.
 */
export default function ThemeStyle({
  palette,
}: {
  palette?: ThemePalette | null;
}) {
  const normalized = normalizePalette(palette);
  const vars = paletteToCssVars(normalized);
  const scheme = isLightPalette(normalized) ? "light" : "dark";
  const css = Object.entries(vars)
    .map(([key, value]) => `${key}:${value}`)
    .join(";");

  return (
    <style
      // Applied globally — must stay in <head>/<body> for cascade into all trees
      dangerouslySetInnerHTML={{
        __html: `:root{color-scheme:${scheme};${css}}`,
      }}
    />
  );
}
