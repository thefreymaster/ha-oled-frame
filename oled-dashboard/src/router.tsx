import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/Layout";
import { Blank } from "./routes/Blank";
import { Photos } from "./routes/Photos";
import { Mobile } from "./routes/Mobile";
import { HomeOverview } from "./routes/HomeOverview";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: (
          <Navigate
            to={
              /Mobi|Android/i.test(navigator.userAgent) ? "/control" : "/home"
            }
            replace
          />
        ),
      },
      { path: "/blank", element: <Blank /> },
      { path: "/photos", element: <Photos /> },
      { path: "/control", element: <Mobile /> },
      { path: "/home", element: <HomeOverview /> },
    ],
  },
]);
