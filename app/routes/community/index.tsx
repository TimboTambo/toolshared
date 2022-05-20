import { Link, useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";

import type { Community, InvitationEnriched } from "~/models/community.server";
import { getInvitesByUserEmail } from "~/models/community.server";
import { requireUser } from "~/session.server";
import { getCommunitiesByUserId } from "~/models/user.server";

type LoaderData = {
  communities: Community[];
  invites: InvitationEnriched[];
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireUser(request);
  const communities = (await getCommunitiesByUserId(user.id)) ?? [];
  const invites = (await getInvitesByUserEmail(user.email)) ?? [];

  return json<LoaderData>({ communities, invites });
};

export default function NoteIndexPage() {
  const { communities, invites } = useLoaderData() as LoaderData;

  return (
    <div>
      <h2>Communities</h2>
      <ul>
        {communities.map((community) => (
          <li key={community.id}>
            <Link to={community.id} className="text-blue-500 underline">
              {community.name}
            </Link>
          </li>
        ))}
      </ul>
      <Link to="new">
        <button>Create new community</button>
      </Link>
      <h2>Invites</h2>
      <ul>
        {invites.map((invite) => (
          <li key={invite.id}>
            <Link
              to={`invites/${invite.id}`}
              className="text-blue-500 underline"
            >
              {invite.community.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
