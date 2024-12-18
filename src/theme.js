import { createContext, useState, useMemo } from "react";
import { createTheme } from "@mui/material/styles";

// example of how to use fine grain colors
{/* <Button
                onSelect={() => { console.log('selected') }}
                // sx={{
                //   backgroundColor: theme.palette.primary.main,
                //   "&:hover": {
                //     backgroundColor: theme.palette.primary.hover,
                //   },
                //   "&.Mui-selected": {
                //     backgroundColor: theme.palette.primary.main,
                //   },
                //   "&.Mui-doubleClicked": {
                //     backgroundColor: theme.palette.primary.doubleClicked,
                //   },
                //   // "&:focus": {
                //   //   outline: "none", // Removes the default focus ring
                //   //   boxShadow: "none", // Removes the focus box-shadow if present
                //   // },
                // }}
                onClick={() => showAll()}
                style={{ border: "0" }}
                color="primary"
              //   variant={open ? "contained" : "outlined"}
              >
                <Icon icon="mdi:eye" />
              </Button>

               */}


// color design tokens export
export const tokens = (mode) => ({
  ...(mode === "dark"
    ? {
      grey: {
        100: "#e0e0e0", // light text
        200: "#c2c2c2",
        300: "#a3a3a3",
        400: "#858585",
        500: "#666666",
        600: "#525252",
        700: "#3d3d3d",
        800: "#292929",
        900: "#141414",
        1000: "#141414" // basicly black
      },
      primary: {
        100: "#2A2E2C", // background
        200: "#a1a4ab",
        300: "#727681",
        400: "#4A514D", // box/ panel color
        // 400: "#1F2A40",
        500: "#141b2d",
        600: "#101624",
        700: "#0c101b",
        800: "#080b12",
        900: "#040509",
        contrastText: "#e0e0e0",
        hover: "#db4f4a",
        selected: "#0d47a1",
        doubleClicked: "#004ba0",
      },
      greenAccent: {
        100: "#dbf5ee",
        200: "#b7ebde",
        300: "#94e2cd",
        // 400: "#70d8bd",
        400: "#A0C3AF",
        //500: "#4cceac",
        500: "#A0C3AF", // subtitles and second text
        600: "#A0C3AF",
        // 600: "#3da58a",
        700: "#2e7c67",
        800: "#1e5245",
        900: "#0f2922",
      },
      redAccent: {
        100: "#f8dcdb",
        200: "#f1b9b7",
        300: "#e99592",
        400: "#e2726e",
        500: "#db4f4a",
        600: "#af3f3b",
        700: "#832f2c",
        800: "#58201e",
        900: "#2c100f",
      },
      blueAccent: {
        100: "#e1e2fe",
        200: "#c3c6fd",
        300: "#a4a9fc",
        400: "#868dfb",
        500: "#6870fa",
        600: "#535ac8",
        700: "#3e4396", // main action buttons
        800: "#2a2d64",
        900: "#151632",
      },
    }
    : {
      grey: {
        100: "#141414", // general text
        200: "#3d3d3d",//"#292929", // used for button icons
        300: "#525252",
        400: "#525252",
        500: "#666666",
        600: "#858585",
        700: "#a3a3a3",
        800: "#c2c2c2",
        900: "#e0e0e0",
        1000: "#fcfcfc" // basicly white same as background

      },
      primary: {
        100: "#fcfcfc", // back ground
        200: "#080b12",
        300: "#0c101b",
        400: "#f2f0f0", // manually changed
        500: "#141b2d",
        600: "#1F2A40",
        700: "#727681",
        800: "#a1a4ab",
        900: "#d0d1d5",
        contrastText: "#e0e0e0",
        hover: "#db4f4a", // red 300
        selected: "#0d47a1",
        doubleClicked: "#004ba0",
      },
      greenAccent: {
        100: "#0f2922",
        200: "#1e5245",
        300: "#2e7c67",
        400: "#3da58a", // 
        // 500: "#4cceac",
        500: "#A0C3AF", // sub titles and high light text
        600: "#70d8bd",
        700: "#94e2cd",
        800: "#b7ebde",
        900: "#dbf5ee",
      },
      redAccent: {
        100: "#2c100f",
        200: "#58201e",
        300: "#832f2c",
        400: "#af3f3b",
        500: "#db4f4a",
        600: "#e2726e",
        700: "#e99592",
        800: "#f1b9b7",
        900: "#f8dcdb",
      },
      blueAccent: {
        100: "#151632",
        200: "#2a2d64",
        300: "#3e4396",
        400: "#535ac8",
        500: "#6870fa",
        600: "#868dfb",
        700: "#a4a9fc", // main action button
        800: "#c3c6fd",
        900: "#e1e2fe",
      },
    }),
});

// mui theme settings
export const themeSettings = (mode) => {
  const colors = tokens(mode);
  return {
    palette: {
      mode: mode,
      ...(mode === "dark"
        ? {
          // palette values for dark mode
          primary: {
            main: colors.primary[500],
            hover: colors.primary.hover, // Reference hover color
            selected: colors.primary.selected, // Reference selected color
          },
          secondary: {
            main: colors.greenAccent[500],
            hover: colors.greenAccent[300], // Example secondary hover

          },
          neutral: {
            main: colors.grey[500],
            light: colors.grey[100],
            dark: colors.grey[700],
            hover: colors.grey[300],
          },
          background: {
            //default: colors.primary[500],
            default: "#2A2E2C"
          },
        }
        : {
          // palette values for light mode
          primary: {
            main: colors.primary[400],
            hover: colors.primary.hover,
            selected: colors.primary.selected,
            doubleClicked: colors.primary.doubleClicked,
          },
          secondary: {
            main: colors.greenAccent[500],
            hover: colors.greenAccent[300],
          },
          neutral: {
            main: colors.grey[500],
            light: colors.grey[100],
            dark: colors.grey[700],
            hover: colors.grey[300],
          },
          background: {
            default: "#fcfcfc",
          },
        }),
    },
    MuiButton: {
      styleOverrides: {
        root: {
          "&:focus": {
            outline: "none",
            boxShadow: "none",
          },
        },
      },
    },
    typography: {
      fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
      fontSize: 10,
      h1: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 40,
      },
      h2: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 32,
      },
      h3: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 24,
      },
      h4: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 20,
      },
      h5: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 16,
      },
      h6: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 14,
      },
    },
  };
};

// context for color mode
export const ColorModeContext = createContext({
  toggleColorMode: () => { },
});

export const useMode = () => {
  const [mode, setMode] = useState("light");

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () =>
        setMode((prev) => (prev === "light" ? "dark" : "light")),
    }),
    []
  );

  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  return [theme, colorMode];
};
