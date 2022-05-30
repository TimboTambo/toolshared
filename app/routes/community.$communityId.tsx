import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { PrimaryBtn } from "~/components/buttons";
import Layout from "~/components/layout";
import { H1, H2 } from "~/components/typography";
import type { CommunityEnriched } from "~/models/community.server";
import { getCommunity } from "~/models/community.server";
import { requireUserId } from "~/session.server";

type LoaderData = {
  community: CommunityEnriched;
  isAdmin: boolean;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);

  invariant(params.communityId, "communityId not found");

  const community = await getCommunity({ id: params.communityId });
  const isAdmin =
    community?.members.find((member) => member.userId == userId)
      ?.permissionId === "Admin";

  if (!community) {
    throw new Response("Not Found", { status: 404 });
  }
  return json<LoaderData>({ community, isAdmin });
};

export default function CommunityDetailsPage() {
  const { community, isAdmin } = useLoaderData() as LoaderData;

  return (
    <>
      <H1>{community.name}</H1>
      <div className="mb-6">
        <H2>Members</H2>
        <ul>
          {community.members.map((member, i) => (
            <li key={i}>
              {member.user.firstName} {member.user.lastName}
            </li>
          ))}
          <li></li>
        </ul>
      </div>
      {isAdmin && (
        <>
          <H2>Invites</H2>
          <div className="mb-4">
            {community.invites.length > 0 ? (
              <ul>
                {community.invites.map((invite) => (
                  <li key={invite.userEmail}>
                    {invite.userEmail} - {invite.statusId}
                  </li>
                ))}
                <li></li>
              </ul>
            ) : (
              <p>No invitations to show</p>
            )}
          </div>
          <div className="mb-6">
            <Link to={`invites/new`}>
              <PrimaryBtn>Invite new member</PrimaryBtn>
            </Link>
          </div>
          <Outlet />
        </>
      )}
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
    return <div>Community not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
