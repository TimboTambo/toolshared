import { Link, useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";

import type { Tool } from "~/models/tools.server";
import { getAllBorrowableTools } from "~/models/tools.server";
import { requireUserId } from "~/session.server";
import { H2 } from "~/components/typography";
import { PrimaryBtn } from "~/components/buttons";

type LoaderData = {
  tools: Tool[];
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);

  const tools = await (
    await getAllBorrowableTools({ userId })
  ).flatMap((membership) =>
    membership.community.members.flatMap((member) => member.user.tools)
  );

  return json<LoaderData>({ tools });
};

export default function ToolsIndexPage() {
  const { tools } = useLoaderData() as LoaderData;

  return (
    <>
      <div className="mb-4">
        <H2>Tools available to borrow in your communities</H2>
        {tools.length > 0 ? (
          <ul>
            {tools.map((tool) => (
              <li key={tool.id}>{tool.name}</li>
            ))}
          </ul>
        ) : (
          <p>No tools available to borrow</p>
        )}
      </div>
      <Link to="/tool/manage">
        <PrimaryBtn>Manage your tools</PrimaryBtn>
      </Link>
    </>
  );
}
