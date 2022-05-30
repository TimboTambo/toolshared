import { Outlet } from "@remix-run/react";

import { H1 } from "~/components/typography";

export default function ToolsIndexPage() {
  return (
    <>
      <H1>Tools</H1>
      <Outlet />
    </>
  );
}
