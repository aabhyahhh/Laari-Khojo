import { alpha, makeStyles } from "@material-ui/core/styles";

export default makeStyles((theme) => ({
  appBar: {
    background: "linear-gradient(90deg, #FB5E50, #FF947A)", // New background gradient
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Subtle shadow for better visual depth
    position: "fixed", // Ensure the appBar is fixed to the top
    top: 0, // Align it to the top of the page
    width: "100%", // Make the appBar span the full width of the page
    zIndex: 1,
  },
  title: {
    display: "none",
    fontWeight: 700, // Bold font for title
    fontFamily: "'Roboto', sans-serif",
    letterSpacing: "0.5px",
    [theme.breakpoints.up("sm")]: {
      display: "block",
    },
  },
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    "&:hover": { backgroundColor: alpha(theme.palette.common.white, 0.25) },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(3),
      width: "auto",
    },
    transition: theme.transitions.create(["background-color", "box-shadow"], {
      duration: theme.transitions.duration.short,
    }),
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#FFFFFF", // White color for the icon
    top: "0",
  },
  inputRoot: {
    color: "inherit",
    fontFamily: "'Roboto', sans-serif",
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: { width: "20ch" },
    color: "#FFFFFF", // White color for input text
  },
  toolbar: {
    paddingTop: theme.spacing(2),
    display: "flex",
    justifyContent: "space-between",
    background: "linear-gradient(90deg, #FB5E50, #FF947A)",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
}));