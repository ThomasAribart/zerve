// tamagui constants

import * as TamaguiColors from "@tamagui/colors";

import { createFont, createTokens } from "tamagui";

// SHORTHANDS::

export const Shorthands = {
  ac: "alignContent",
  ai: "alignItems",
  als: "alignSelf",
  bblr: "borderBottomLeftRadius",
  bbrr: "borderBottomRightRadius",
  bc: "backgroundColor",
  br: "borderRadius",
  btlr: "borderTopLeftRadius",
  btrr: "borderTopRightRadius",
  f: "flex",
  fb: "flexBasis",
  fd: "flexDirection",
  fg: "flexGrow",
  fs: "flexShrink",
  fw: "flexWrap",
  h: "height",
  jc: "justifyContent",
  m: "margin",
  mb: "marginBottom",
  ml: "marginLeft",
  mr: "marginRight",
  mt: "marginTop",
  mx: "marginHorizontal",
  my: "marginVertical",
  p: "padding",
  pb: "paddingBottom",
  pe: "pointerEvents",
  pl: "paddingLeft",
  pr: "paddingRight",
  pt: "paddingTop",
  px: "paddingHorizontal",
  py: "paddingVertical",
  w: "width",
  zi: "zIndex",

  // figure out text specifics
  lh: "lineHeight",
  ta: "textAlign",
  // TODO
  // fs: 'fontSize',
} as const;

// COLORS:

const LightColors = {
  ...TamaguiColors.blue,
  ...TamaguiColors.gray,
  ...TamaguiColors.grayA,
  ...TamaguiColors.green,
  ...TamaguiColors.indigo,
  ...TamaguiColors.orange,
  ...TamaguiColors.pink,
  ...TamaguiColors.purple,
  ...TamaguiColors.red,
  ...TamaguiColors.violet,
  ...TamaguiColors.yellow,
};

const DarkColors = {
  ...TamaguiColors.blueDark,
  ...TamaguiColors.grayDark,
  ...TamaguiColors.grayDarkA,
  ...TamaguiColors.greenDark,
  ...TamaguiColors.indigoDark,
  ...TamaguiColors.orangeDark,
  ...TamaguiColors.pinkDark,
  ...TamaguiColors.purpleDark,
  ...TamaguiColors.redDark,
  ...TamaguiColors.violetDark,
  ...TamaguiColors.yellowDark,
};

export type ColorNamesLight = keyof typeof LightColors;
export type ColorNamesDark = keyof typeof DarkColors;

export const Colors = {
  light: LightColors,
  dark: DarkColors,
  darkColorsPostfixed: Object.fromEntries(
    // Dark
    Object.entries(DarkColors).map(([k, v]) => [`${k}Dark`, v])
  ) as {
    [key in `${keyof typeof DarkColors}Dark`]: string;
  },
  colorNamesLight: Object.keys(LightColors) as ColorNamesLight[],
  colorNamesDark: Object.keys(DarkColors) as ColorNamesDark[],
} as const;

// TOKENS::

const size = {
  0: 0,
  1: 4,
  2: 8,
  3: 14,
  4: 18,
  5: 24,
  6: 32,
  7: 44,
  8: 56,
  9: 78,
  10: 100,
  true: 10,
};

const space = {
  ...size,
  "-0": -0,
  "-1": -5,
  "-2": -10,
  "-3": -15,
  "-4": -20,
  "-5": -25,
  "-6": -30,
  "-7": -40,
  "-8": -50,
  "-9": -75,
  "-10": -100,
};

const defaultFont = createFont({
  family: "Arial",
  size: {
    1: 10,
    2: 12,
    3: 14,
    4: 15,
    5: 17,
    6: 18,
    7: 20,
    8: 21,
    9: 38,
    10: 44,
    11: 68,
    12: 76,
  },
  lineHeight: {
    1: 15,
    2: 20,
    3: 23,
    4: 25,
    5: 30,
    6: 31,
    7: 35,
    8: 42,
    9: 48,
    10: 56,
    11: 75,
    12: 88,
  },
  weight: {
    4: "300",
    7: "600",
    8: "700",
  },
  letterSpacing: {
    4: 0,
    7: -1,
    9: -2,
    10: -3,
    12: -4,
  },
});

export const Tokens = createTokens({
  size,
  space,
  font: {
    title: defaultFont,
    body: defaultFont,
  },
  zIndex: {
    0: 0,
    1: 100,
    2: 200,
    3: 300,
    4: 400,
    5: 500,
  },
  color: {
    ...Colors.light,
    ...Colors.darkColorsPostfixed,
  },
  radius: {
    0: 0,
    1: 3,
    2: 5,
    3: 10,
    4: 15,
    5: 20,
  },
});

// THEMES::

export type MyTheme = typeof LightTheme;

const lightColors = Object.fromEntries(
  Object.entries(Tokens.color).filter(([k]) => !k.endsWith("Dark"))
);
const darkColors = Object.fromEntries(
  Object.entries(Tokens.color)
    .filter(([k]) => k.endsWith("Dark"))
    .map(([k, v]) => [k.replace("Dark", ""), v])
);

const LightTheme = {
  bg: "#fff",
  bg2: Tokens.color.gray2,
  bg3: Tokens.color.gray4,
  bg4: Tokens.color.gray5,
  bgTransparent: Tokens.color.grayA1,
  borderColor: Tokens.color.gray4,
  borderColor2: Tokens.color.gray6,
  color: Tokens.color.gray12,
  color2: Tokens.color.gray11,
  color3: Tokens.color.gray10,
  color4: Tokens.color.gray9,
  shadowColor: Tokens.color.grayA4,
  shadowColor2: Tokens.color.grayA6,
  ...lightColors,
};

const DarkTheme = {
  bg: "#171717",
  bg2: Tokens.color.gray2Dark,
  bg3: Tokens.color.gray3Dark,
  bg4: Tokens.color.gray4Dark,
  bgTransparent: Tokens.color.grayA1Dark,
  borderColor: Tokens.color.gray3Dark,
  borderColor2: Tokens.color.gray4Dark,
  color: "#ddd",
  color2: Tokens.color.gray11Dark,
  color3: Tokens.color.gray10Dark,
  color4: Tokens.color.gray9Dark,
  shadowColor: "#00000055",
  shadowColor2: "#00000099",
  ...darkColors,
};

const colorThemes: Record<string, typeof Colors.light> = {};
const colorKeys = Object.keys(TamaguiColors);

for (const key of colorKeys) {
  if (key.endsWith("A")) continue;
  const colorName = key.replace("Dark", "");
  const colorValues = (TamaguiColors as any)[key];
  const isDark = key.endsWith("Dark");
  const nameKey = isDark ? key.replace("Dark", "-dark") : `${key}-light`;
  colorThemes[nameKey] = {
    // @ts-ignore
    color: colorValues[`${colorName}12`],
    color2: colorValues[`${colorName}11`],
    color3: colorValues[`${colorName}10`],
    color4: colorValues[`${colorName}9`],
    bg: colorValues[`${colorName}2`],
    bg2: colorValues[`${colorName}3`],
    bg3: colorValues[`${colorName}4`],
    bg4: colorValues[`${colorName}5`],
    borderColor: colorValues[`${colorName}2`],
    borderColor2: colorValues[`${colorName}4`],
  };
}

export const Themes = {
  dark: DarkTheme,
  light: LightTheme,
  ...colorThemes,
  "active-light": colorThemes["pink-light"],
  "active-dark": colorThemes["pink-dark"],
} as const;

export type MyThemes = typeof Themes;
