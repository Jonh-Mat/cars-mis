export const theme = {
  light: {
    primary: {
      gradient: "bg-gradient-to-r from-blue-500 to-blue-700",
      hover: "hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-800",
      text: "text-blue-600",
      border: "border-blue-500",
    },
    background: {
      main: "bg-gray-50",
      card: "bg-white",
      header: "bg-white",
    },
    text: {
      primary: "text-gray-900",
      secondary: "text-gray-600",
      accent: "text-blue-600",
    },
    card: {
      shadow: "shadow-sm hover:shadow-md",
      border: "border border-gray-100",
    },
  },
  dark: {
    primary: {
      gradient: "bg-gradient-to-r from-navy-600 to-navy-800",
      hover: "hover:bg-gradient-to-r hover:from-navy-700 hover:to-navy-900",
      text: "text-blue-400",
      border: "border-navy-500",
    },
    background: {
      main: "bg-navy-900",
      card: "bg-navy-800",
      header: "bg-navy-800",
    },
    text: {
      primary: "text-white",
      secondary: "text-gray-300",
      accent: "text-blue-400",
    },
    card: {
      shadow: "shadow-navy-700 hover:shadow-lg",
      border: "border border-navy-700",
    },
  },
};
