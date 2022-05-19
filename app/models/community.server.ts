import type {
  Community,
  Invitation,
  InvitationStatus,
  Member,
  User,
} from "@prisma/client";

import { prisma } from "~/db.server";

export type { Community, Invitation, InvitationStatus, User };

export type CommunityFull = Community & {
  members: (Member & { user: Pick<User, "email"> })[];
  invites: Invitation[];
};

export function getMemberPermissions() {
  return prisma.memberPermission.findMany();
}

export function getCommunity({
  id,
}: {
  id: Community["id"];
}): Promise<CommunityFull | null> {
  return prisma.community.findUnique({
    where: {
      id,
    },
    include: {
      members: {
        include: {
          user: true,
        },
      },
      invites: true,
    },
  });
}

export async function createCommunity({
  name,
  userId,
}: Pick<Community, "name"> & Pick<Member, "userId">) {
  const permissions = await getMemberPermissions();
  const admin = permissions.find((permission) => permission.name === "Admin");

  if (!admin) {
    //TODO: handle
  }

  return prisma.community.create({
    data: {
      name,
      members: {
        create: {
          user: {
            connect: {
              id: userId,
            },
          },
          permission: {
            connect: {
              id: admin?.id,
            },
          },
        },
      },
    },
  });
}
