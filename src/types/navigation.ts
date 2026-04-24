import type { Route } from "next";

export type NavigationItem = {
  title: string;
  href: Route;
  description: string;
};
