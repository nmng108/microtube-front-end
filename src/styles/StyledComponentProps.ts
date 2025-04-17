export interface Theme {
  bg: string,
  primaryColor: string,
  secondaryColor: string,
  grey: string,
  darkGrey: string,
  black: string,
  red: string,
  blue: string,
  white: string,
  pink: string,
  purple: string,
  font: string,
}

export interface StyledComponentProps {
  theme?: Theme,
  grey?: boolean,
}