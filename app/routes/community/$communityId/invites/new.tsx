import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import * as React from "react";
import invariant from "tiny-invariant";
import { createInvite } from "~/models/community.server";

import { requireUserId } from "~/session.server";

type LoaderData = {
  communityId: string;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireUserId(request);
  invariant(params.communityId, "communityId not found");

  return json<LoaderData>({ communityId: params.communityId });
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
  const { communityId } = useLoaderData() as LoaderData;
  const actionData = useActionData() as ActionData;
  const emailRef = React.useRef<HTMLInputElement>(null);
  console.log("RUNNING NEW INVITE PAGE!");
  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    }
  }, [actionData]);

  return (
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
      <div>
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

      <div className="text-right">
        <button
          type="submit"
          className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Save
        </button>
      </div>
    </Form>
  );
}
