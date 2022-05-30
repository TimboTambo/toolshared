import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import * as React from "react";
import invariant from "tiny-invariant";
import { PrimaryBtn, SecondaryBtn } from "~/components/buttons";
import Layout from "~/components/layout";
import { H1, H3 } from "~/components/typography";
import { createInvite, getCommunity } from "~/models/community.server";

import { requireUserId } from "~/session.server";

type LoaderData = {
  communityId: string;
  communityName: string;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireUserId(request);
  invariant(params.communityId, "communityId not found");

  const community = await getCommunity({ id: params.communityId });

  if (!community) {
    throw new Response("Not Found", { status: 404 });
  }

  return json<LoaderData>({
    communityId: params.communityId,
    communityName: community.name,
  });
};

type ActionData = {
  errors?: {
    email?: string;
    communityId?: string;
  };
};

export const action: ActionFunction = async ({ request }) => {
  await requireUserId(request);

  const formData = await request.formData();
  const email = formData.get("email");
  const communityId = formData.get("communityId");

  if (typeof email !== "string" || email.length === 0) {
    return json<ActionData>(
      { errors: { email: "Name is required" } },
      { status: 400 }
    );
  }

  if (typeof communityId !== "string" || communityId.length === 0) {
    return json<ActionData>(
      { errors: { communityId: "CommunityId is required" } },
      { status: 400 }
    );
  }

  await createInvite({ userEmail: email, communityId });

  return redirect(`/community/${communityId}`);
};

export default function NewInvitePage() {
  const { communityId, communityName } = useLoaderData() as LoaderData;
  const actionData = useActionData() as ActionData;
  const emailRef = React.useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    }
  }, [actionData]);

  const goBack = () => {
    navigate(-1);
  };

  return (
    <>
      <H3>Send an invite to {communityName}</H3>
      <Form
        method="post"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          width: "100%",
        }}
      >
        <input type="hidden" name="communityId" value={communityId} />
        <div className="mb-4">
          <label className="flex w-full flex-col gap-1">
            <span>Name: </span>
            <input
              ref={emailRef}
              name="email"
              className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
              aria-invalid={actionData?.errors?.email ? true : undefined}
              aria-errormessage={
                actionData?.errors?.email ? "email-error" : undefined
              }
            />
          </label>
          {actionData?.errors?.email && (
            <div className="pt-1 text-red-700" id="title-error">
              {actionData.errors.email}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 text-right">
          <SecondaryBtn onClick={goBack}>Cancel</SecondaryBtn>
          <PrimaryBtn type="submit">Save</PrimaryBtn>
        </div>
      </Form>
    </>
  );
}
