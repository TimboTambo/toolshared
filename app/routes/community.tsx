import { Link, Outlet, useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";

import type { Community, InvitationEnriched } from "~/models/community.server";
import { getInvitesByUserEmail } from "~/models/community.server";
import { requireUser } from "~/session.server";
import { getCommunitiesByUserId } from "~/models/user.server";
import { H1, H2 } from "~/components/typography";
import { PrimaryBtn } from "~/components/buttons";

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
  const openInvites = invites.filter((invite) => invite.statusId === "Open");
  return (
    <>
      <div className="mb-6">
        <H1>Communities</H1>
        <H2>Communities you belong to</H2>
        <ul className="mb-4">
          {communities.map((community) => (
            <li key={community.id}>
              <Link to={community.id} className="text-blue-500 underline">
                {community.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-4">
        <H2>Outstanding invitations</H2>
        {openInvites.length ? (
          <>
            <ul>
              {openInvites.map((invite) => (
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
          </>
        ) : (
          <p>No outstanding invites</p>
        )}
      </div>
      <div className="mb-4">
        <Link to="new">
          <PrimaryBtn>Create new community</PrimaryBtn>
        </Link>
      </div>
      <Outlet />
    </>
  );
}
