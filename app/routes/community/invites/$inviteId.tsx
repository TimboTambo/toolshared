import { Form, useLoaderData } from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";

import type { InvitationEnriched } from "~/models/community.server";
import { actionInvite } from "~/models/community.server";
import { getInviteById } from "~/models/community.server";
import invariant from "tiny-invariant";
import { requireUserId } from "~/session.server";

type LoaderData = {
  invite: InvitationEnriched;
};

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.inviteId, "inviteId not found");

  const invite = await getInviteById(params.inviteId);

  if (!invite) {
    throw new Response("Not Found", { status: 404 });
  }

  return json<LoaderData>({ invite });
};

type ActionData = {
  errors?: {
    action?: string;
  };
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);

  invariant(params.inviteId, "inviteId not found");

  const formData = await request.formData();
  const action = formData.get("action");

  if (typeof action !== "string" || action.length === 0) {
    return json<ActionData>(
      { errors: { action: "Action is required" } },
      { status: 400 }
    );
  }

  const invitation = await actionInvite({
    id: params.inviteId,
    accepted: action === "accept",
    userId,
  });

  return redirect(`/community/${invitation.communityId}`);
};

export default function InviteDetailsPage() {
  const { invite } = useLoaderData() as LoaderData;

  return (
    <div>
      <h1>Invite</h1>
      <div>Community: {invite.community.name}</div>
      <Form method="post">
        <input type="hidden" name="action" value="accept" />
        <button type="submit">Accept</button>
      </Form>
      <Form method="post">
        <input type="hidden" name="action" value="reject" />
        <button type="submit">Reject</button>
      </Form>
    </div>
  );
}
