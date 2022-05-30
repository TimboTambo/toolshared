import { Link, Outlet, useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";

import type { Tool } from "~/models/tools.server";
import { getUsersTools } from "~/models/tools.server";
import { requireUserId } from "~/session.server";
import { H2 } from "~/components/typography";
import { PrimaryBtn } from "~/components/buttons";

type LoaderData = {
  tools: Tool[];
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);

  const tools = await await getUsersTools({ userId });

  return json<LoaderData>({ tools });
};

export default function ToolsManagePage() {
  const { tools } = useLoaderData() as LoaderData;

  return (
    <>
      <div className="mb-4">
        <H2>Your tools</H2>
        {tools.length > 0 ? (
          <ul>
            {tools.map((tool) => (
              <li key={tool.id}>
                <Link to={`/tool/${tool.id}`}>{tool.name}</Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>You currently do not have any tools</p>
        )}
      </div>
      <div className="mb-4">
        <Link to="new">
          <PrimaryBtn>Add tool</PrimaryBtn>
        </Link>
      </div>

      <Outlet />
    </>
  );
}
