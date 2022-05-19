import { Link, useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";

import type { Community } from "~/models/community.server";
import { requireUserId } from "~/session.server";
import { getCommunitiesByUserId } from "~/models/user.server";

type LoaderData = {
  communities: Community[];
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  const communities = await getCommunitiesByUserId(userId);

  if (!communities) {
    throw new Response("Not Found", { status: 404 });
  }

  return json<LoaderData>({ communities });
};

export default function NoteIndexPage() {
  const { communities } = useLoaderData() as LoaderData;

  return (
    <div>
      <ul>
        {communities.map((community) => (
          <li key={community.id}>
            <Link to="id" className="text-blue-500 underline">
              {community.name}
            </Link>
          </li>
        ))}
      </ul>
      <Link to="new">
        <button>Create new community</button>
      </Link>
    </div>
  );
}
