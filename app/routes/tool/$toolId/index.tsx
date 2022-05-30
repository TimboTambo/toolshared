import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { SecondaryBtn } from "~/components/buttons";
import type { ToolEnriched } from "~/models/tools.server";
import { getTool } from "~/models/tools.server";
import { requireUserId } from "~/session.server";

type LoaderData = {
  tool: ToolEnriched;
  isOwner: boolean;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);

  invariant(params.toolId, "toolId not found");

  const tool = await getTool(params.toolId);

  if (!tool) {
    throw new Response("Not Found", { status: 404 });
  }

  const isOwner = tool?.userId === userId;

  return json<LoaderData>({ tool, isOwner });
};

export default function CommunityDetailsPage() {
  const { tool, isOwner } = useLoaderData() as LoaderData;

  return (
    <>
      <h1 className="text-2xl font-bold">{tool.name}</h1>
      <p>Description: {tool.description}</p>
      <p>Category: {tool.subCategory.category.name}</p>
      <p>Subcategory: {tool.subCategory.name}</p>
      <p>
        Owner:{" "}
        {isOwner ? "You" : `${tool.user.firstName} ${tool.user.lastName}`}
      </p>
      {tool.imageUrl && (
        <a href={tool.imageUrl}>
          <img src={tool.imageUrl} alt={`${tool.name}`} className="max-w-md" />
        </a>
      )}
      <div className="flex justify-end space-x-2 text-right">
        <a href="/tool/manage">
          <SecondaryBtn>Back</SecondaryBtn>
        </a>
      </div>
    </>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Tool not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
