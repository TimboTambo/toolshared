import { Community } from "@prisma/client";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import type { CommunityFull } from "~/models/community.server";
import { getCommunity } from "~/models/community.server";

import type { Note } from "~/models/note.server";
import { deleteNote } from "~/models/note.server";
import { getNote } from "~/models/note.server";
import { requireUserId } from "~/session.server";

type LoaderData = {
  community: CommunityFull;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  invariant(params.communityId, "communityId not found");

  const community = await getCommunity({ id: params.communityId });

  if (!community) {
    throw new Response("Not Found", { status: 404 });
  }
  return json<LoaderData>({ community });
};

// export const action: ActionFunction = async ({ request, params }) => {
//   const userId = await requireUserId(request);
//   invariant(params.noteId, "noteId not found");

//   await deleteNote({ userId, id: params.noteId });

//   return redirect("/notes");
// };

export default function CommunityDetailsPage() {
  const { community } = useLoaderData() as LoaderData;

  return (
    <div>
      <h1 className="text-2xl font-bold">{community.name}</h1>
      <h2>Members</h2>
      <ul>
        {community.members.map((member) => (
          <li key={member.user.email}>{member.user.email}</li>
        ))}
        <li></li>
      </ul>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Community not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
