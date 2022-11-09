/** @type {import('tailwindcss').Config} */
const parentConfig = require("@apihero/tailwind-config/tailwind.config");
module.exports = {
  ...parentConfig,
  theme: {
    ...parentConfig.theme,
    extend: {
      ...parentConfig.theme.extend,
      height: {
        mainMobileContainerHeight: "calc(100vh - 148px)",
        mainDesktopContainerHeight: "calc(100vh - 72px)",
        editEndpointContainerHeight: "calc(100vh - 112px)",
      },
    },
  },
};
