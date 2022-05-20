import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import type { CommunityEnriched } from "~/models/community.server";
import { getCommunity } from "~/models/community.server";

type LoaderData = {
  community: CommunityEnriched;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  invariant(params.communityId, "communityId not found");

  const community = await getCommunity({ id: params.communityId });

  if (!community) {
    throw new Response("Not Found", { status: 404 });
  }
  return json<LoaderData>({ community });
};

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
      <h2>Invites</h2>
      <ul>
        {community.invites.map((invite) => (
          <li key={invite.userEmail}>
            {invite.userEmail} - {invite.status.name}
          </li>
        ))}
        <li></li>
      </ul>
      <Link to={`invites/new`}>
        <button>Invite new member</button>
      </Link>
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
