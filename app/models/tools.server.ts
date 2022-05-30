import type { Category, Member, SubCategory, Tool, User } from "@prisma/client";

import { prisma } from "~/db.server";
import type {
  AbortMultipartUploadCommandOutput,
  CompleteMultipartUploadCommandOutput,
} from "@aws-sdk/client-s3";
import { S3Client } from "@aws-sdk/client-s3";
import type { Readable } from "stream";
import { Upload } from "@aws-sdk/lib-storage";
import invariant from "tiny-invariant";
export type { Category, SubCategory, Tool };
export function getCategories(): Promise<Category[]> {
  return prisma.category.findMany();
}

export function getSubCategories(): Promise<SubCategory[]> {
  return prisma.subCategory.findMany();
}

export type MembershipTools = Member & {
  community: { members: { user: { tools: Tool[] } }[] };
};

export type ToolEnriched = Tool & {
  subCategory: SubCategory & { category: Category };
  user: Pick<User, "firstName" | "lastName">;
};

export function getTool(id: string): Promise<ToolEnriched | null> {
  return prisma.tool.findUnique({
    where: {
      id,
    },
    include: {
      subCategory: {
        include: {
          category: true,
        },
      },
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });
}

export function getUsersTools({
  userId,
  pageNumber = 1,
  pageSize = 20,
}: {
  userId: string;
  pageNumber?: number;
  pageSize?: number;
}): Promise<Tool[]> {
  return prisma.tool.findMany({
    where: {
      userId,
    },
    take: pageSize,
    skip: (pageNumber - 1) * pageSize,
  });
}

export function getAllBorrowableTools({
  userId,
  pageNumber = 1,
  pageSize = 20,
}: {
  userId: string;
  pageNumber?: number;
  pageSize?: number;
}): Promise<MembershipTools[]> {
  return prisma.member.findMany({
    where: {
      userId,
    },
    take: pageSize,
    skip: (pageNumber - 1) * pageSize,
    include: {
      community: {
        include: {
          members: {
            where: {
              userId: {
                not: {
                  equals: userId,
                },
              },
            },
            include: {
              user: {
                include: {
                  tools: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

function isSuccess(
  response:
    | CompleteMultipartUploadCommandOutput
    | AbortMultipartUploadCommandOutput
): response is CompleteMultipartUploadCommandOutput {
  return "Location" in response;
}

export async function uploadToolImage({
  stream,
  filename,
  mimetype,
  userId,
}: {
  stream: Readable;
  filename: string;
  mimetype: string;
  userId: string;
}): Promise<string | undefined> {
  if (!stream || !filename) {
    return;
  }

  const accessKeyId = process.env.AWS_S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_S3_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION;
  const bucketName = process.env.AWS_S3_IMAGE_BUCKET_NAME;

  invariant(
    accessKeyId && secretAccessKey && region && bucketName,
    "Necessary env vars not set"
  );

  const config = { credentials: { accessKeyId, secretAccessKey }, region };

  const randomNum = Math.round(Math.random() * 1000);

  const key = `toolImages/${userId}_${randomNum}_${filename}`;
  const client = new S3Client(config);

  try {
    const response = await new Upload({
      client,
      params: {
        Bucket: bucketName,
        Body: stream,
        Key: key,
        ContentType: mimetype,
      },
    }).done();

    if (isSuccess(response)) {
      return response.Location;
    }
    throw new Error();
  } catch (e) {
    console.log({ error: e });
    throw new Error("Image upload error");
  }
}

export async function createTool({
  name,
  description,
  subCategoryId,
  userId,
  imageUrl,
}: Pick<
  Tool,
  "name" | "description" | "subCategoryId" | "userId" | "imageUrl"
>): Promise<Tool> {
  return prisma.tool.create({
    data: {
      name,
      description,
      subCategoryId,
      userId,
      imageUrl,
    },
  });
}
