import { Outlet, useLocation } from "react-router";
import { SocketViewListener } from "./SocketViewListener";
import { PageTransition } from "./PageTransition";

export function Layout() {
  const location = useLocation();

  return (
    <>
      <SocketViewListener />
      <PageTransition key={location.pathname}>
        <Outlet />
      </PageTransition>
    </>
  );
}
