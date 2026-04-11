import { Outlet, useLocation } from "react-router";
import { Box } from "@chakra-ui/react";
import { SocketViewListener } from "./SocketViewListener";
import { PageTransition } from "./PageTransition";
import { PixelShift } from "./PixelShift";
import { LandscapeNav } from "./LandscapeNav";
import { useThemeMode } from "../hooks/useThemeMode";

export function Layout() {
  // Drives the auto-mode timer and keeps theme state in sync app-wide.
  useThemeMode();
  const location = useLocation();
  const isControl = location.pathname === "/control";
  const isBlank = location.pathname === "/blank";
  const showNav = !isControl && !isBlank;

  const content = (
    <PageTransition key={location.pathname}>
      <Outlet />
    </PageTransition>
  );

  return (
    <>
      <SocketViewListener />
      {showNav && (
        <Box
          display="none"
          css={{
            "@media (orientation: landscape)": {
              display: "block",
            },
          }}
        >
          <LandscapeNav />
        </Box>
      )}
      <Box
        overflow="hidden"
        css={
          showNav
            ? {
                "@media (orientation: landscape)": {
                  marginLeft: "56px",
                  width: "calc(100vw - 56px)",
                },
              }
            : undefined
        }
      >
        {isControl ? content : <PixelShift>{content}</PixelShift>}
      </Box>
    </>
  );
}
