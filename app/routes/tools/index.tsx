import { Link, useLoaderData } from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";

import { getSubCategories } from "~/models/tools.server";
import type { SubCategory } from "~/models/tools.server";
import { requireUserId } from "~/session.server";

type LoaderData = {
  subCategories: SubCategory[];
};

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireUserId(request);

  const subCategories = await getSubCategories();

  return json<LoaderData>({ subCategories });
};

export default function ToolsIndexPage() {
  const data = useLoaderData() as LoaderData;

  return (
    <>
      <h1>Sub categories</h1>
      <ul>
        {data.subCategories.map((subCategory) => (
          <li key={subCategory.id}>{subCategory.name}</li>
        ))}
      </ul>
    </>
  );
}
