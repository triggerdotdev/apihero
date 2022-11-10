/** @type {import('tailwindcss').Config} */
const parentConfig = require("@apihero/tailwind-config/tailwind.config");
module.exports = {
  ...parentConfig,
  theme: {
    ...parentConfig.theme,
    extend: {
      ...parentConfig.theme.extend,
      height: {
        mainMobileContainerHeight: "calc(100vh - 140px)",
        mainDesktopContainerHeight: "calc(100vh - 64px)",
        editEndpointContainerHeight: "calc(100vh - 112px)",
      },
    },
  },
};
