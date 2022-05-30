import type {
  ActionFunction,
  LoaderFunction,
  UploadHandlerArgs,
} from "@remix-run/node";
import { unstable_parseMultipartFormData } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import * as React from "react";
import { PrimaryBtn, SecondaryBtn } from "~/components/buttons";
import { H3 } from "~/components/typography";
import type { Category, SubCategory } from "~/models/tools.server";
import { uploadToolImage } from "~/models/tools.server";
import { createTool } from "~/models/tools.server";
import { getCategories, getSubCategories } from "~/models/tools.server";

import { requireUserId } from "~/session.server";

type ActionData = {
  errors?: {
    name?: string;
    description?: string;
    subCategory?: string;
    image?: string;
    upload?: boolean;
  };
};

type LoaderData = {
  categories: Category[];
  subCategoriesLookup: Record<string, SubCategory[]>;
};

export const loader: LoaderFunction = async () => {
  const categories = await getCategories();

  const subCategoriesLookup = (await getSubCategories()).reduce(
    (lookup: Record<string, SubCategory[]>, subCategory: SubCategory) => {
      const categorySubCategories = lookup[subCategory.categoryId] ?? [];
      categorySubCategories.push(subCategory);
      lookup[subCategory.categoryId] = categorySubCategories;
      return lookup;
    },
    {}
  );

  return json<LoaderData>({ categories, subCategoriesLookup });
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  let formData;
  try {
    formData = await unstable_parseMultipartFormData(
      request,
      ({ stream, filename, mimetype }: UploadHandlerArgs) =>
        uploadToolImage({ stream, filename, mimetype, userId })
    );
  } catch {
    return json<ActionData>({ errors: { upload: true } }, { status: 500 });
  }

  const name = formData.get("name");
  const description = formData.get("description");
  const subCategoryId = formData.get("subCategory");
  const imageUrl = formData.get("image");

  if (typeof name !== "string" || name.length === 0) {
    return json<ActionData>(
      { errors: { name: "Name is required" } },
      { status: 400 }
    );
  }

  if (typeof description !== "string" || description.length === 0) {
    return json<ActionData>(
      { errors: { description: "Description is required" } },
      { status: 400 }
    );
  }

  if (typeof subCategoryId !== "string" || subCategoryId.length === 0) {
    return json<ActionData>(
      { errors: { subCategory: "Subcategory is required" } },
      { status: 400 }
    );
  }

  const tool = await createTool({
    name,
    description,
    subCategoryId,
    userId,
    imageUrl: imageUrl?.toString() ?? null,
  });

  return redirect(`/tool/${tool.id}`);
};

export default function NewToolPage() {
  const { categories, subCategoriesLookup } = useLoaderData() as LoaderData;
  const actionData = useActionData() as ActionData;
  const nameRef = React.useRef<HTMLInputElement>(null);
  const descriptionRef = React.useRef<HTMLTextAreaElement>(null);
  const subCategoryRef = React.useRef<HTMLSelectElement>(null);
  const imageRef = React.useRef<HTMLInputElement>(null);
  const [selectedCategory, setSelectedCategory] = React.useState("");
  const [subCategories, setSubCategories] = React.useState<SubCategory[]>([]);
  const [selectedSubCategory, setSelectedSubCategory] = React.useState("");

  const navigate = useNavigate();

  React.useEffect(() => {
    if (actionData?.errors?.name) {
      nameRef.current?.focus();
    } else if (actionData?.errors?.description) {
      descriptionRef.current?.focus();
    } else if (actionData?.errors?.subCategory) {
      subCategoryRef.current?.focus();
    }
  }, [actionData]);

  const onCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setSubCategories(subCategoriesLookup[e.target.value] ?? []);
  };

  return (
    <>
      <H3>Add new tool</H3>
      <Form
        method="post"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          width: "100%",
        }}
        encType="multipart/form-data"
      >
        {actionData?.errors?.upload && (
          <div className="pt-1 text-red-700" id="title-error">
            There was an error while saving
          </div>
        )}
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

        <div>
          <label className="flex w-full flex-col gap-1">
            <span>Description: </span>
            <textarea
              ref={descriptionRef}
              name="description"
              className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
              aria-invalid={actionData?.errors?.description ? true : undefined}
              aria-errormessage={
                actionData?.errors?.description
                  ? "description-error"
                  : undefined
              }
            />
          </label>
          {actionData?.errors?.description && (
            <div className="pt-1 text-red-700" id="description-error">
              {actionData.errors.description}
            </div>
          )}
        </div>

        <div>
          <label className="flex w-full flex-col gap-1">
            <span>Category: </span>
            <select
              name="category"
              value={selectedCategory}
              onChange={onCategoryChange}
            >
              <option></option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <label className="flex w-full flex-col gap-1">
            <span>Subcategory: </span>
            <select
              name="subCategory"
              ref={subCategoryRef}
              value={selectedSubCategory}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setSelectedSubCategory(e.target.value)
              }
              aria-invalid={actionData?.errors?.subCategory ? true : undefined}
              aria-errormessage={
                actionData?.errors?.subCategory
                  ? "subCategory-error"
                  : undefined
              }
            >
              <option></option>
              {subCategories.map((subCategory) => (
                <option key={subCategory.id} value={subCategory.id}>
                  {subCategory.name}
                </option>
              ))}
            </select>
          </label>
          {actionData?.errors?.subCategory && (
            <div className="pt-1 text-red-700" id="subCategory-error">
              {actionData.errors.subCategory}
            </div>
          )}
        </div>

        <div>
          <label className="flex w-full flex-col gap-1">
            <span>Image: </span>
            <input
              name="image"
              ref={imageRef}
              type="file"
              aria-invalid={actionData?.errors?.image ? true : undefined}
              aria-errormessage={
                actionData?.errors?.image ? "image-error" : undefined
              }
            />
          </label>
          {actionData?.errors?.image && (
            <div className="pt-1 text-red-700" id="image-error">
              {actionData.errors.image}
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
