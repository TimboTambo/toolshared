import type { ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigate } from "@remix-run/react";
import * as React from "react";
import { PrimaryBtn, SecondaryBtn } from "~/components/buttons";
import { H3 } from "~/components/typography";
import { createCommunity } from "~/models/community.server";

import { requireUserId } from "~/session.server";

type ActionData = {
  errors?: {
    name?: string;
  };
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const name = formData.get("name");

  if (typeof name !== "string" || name.length === 0) {
    return json<ActionData>(
      { errors: { name: "Name is required" } },
      { status: 400 }
    );
  }

  const community = await createCommunity({ name, userId });

  return redirect(`/community/${community.id}`);
};

export default function NewCommunityPage() {
  const actionData = useActionData() as ActionData;
  const nameRef = React.useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (actionData?.errors?.name) {
      nameRef.current?.focus();
    }
  }, [actionData]);

  return (
    <>
      <H3>Create a new community</H3>
      <Form
        method="post"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          width: "100%",
        }}
      >
        <div>
          <label className="flex w-full flex-col gap-1">
            <span>Name: </span>
            <input
              ref={nameRef}
              name="name"
              className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
              aria-invalid={actionData?.errors?.name ? true : undefined}
              aria-errormessage={
                actionData?.errors?.name ? "name-error" : undefined
              }
            />
          </label>
          {actionData?.errors?.name && (
            <div className="pt-1 text-red-700" id="title-error">
              {actionData.errors.name}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 text-right">
          <SecondaryBtn onClick={() => navigate(-1)}>Cancel</SecondaryBtn>
          <PrimaryBtn type="submit">Save</PrimaryBtn>
        </div>
      </Form>
    </>
  );
}
