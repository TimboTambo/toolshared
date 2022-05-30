import type { Community, Invitation, Member, User } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Community, Invitation, User };

export type MemberPermission = "Admin" | "Member";
export type InvitationStatus = "Open" | "Accepted" | "Rejected" | "Expired";

export type CommunityEnriched = Community & {
  members: (Member & { user: Pick<User, "firstName" | "lastName"> })[];
  invites: Invitation[];
};

export function getMemberPermissions() {
  return prisma.memberPermission.findMany();
}

export function getCommunity({
  id,
}: {
  id: Community["id"];
}): Promise<CommunityEnriched | null> {
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
              name: "Admin",
            },
          },
        },
      },
    },
  });
}

export type InvitationEnriched = Invitation & {
  community: Pick<Community, "name">;
};

export function getInvitesByUserEmail(
  userEmail: Invitation["userEmail"]
): Promise<InvitationEnriched[] | null> {
  return prisma.invitation.findMany({
    where: {
      userEmail,
    },
    include: {
      community: {
        select: {
          name: true,
        },
      },
    },
  });
}

export function getInviteById(
  id: Invitation["id"]
): Promise<InvitationEnriched | null> {
  return prisma.invitation.findUnique({
    where: {
      id,
    },
    include: {
      community: {
        select: {
          name: true,
        },
      },
    },
  });
}

export async function createInvite({
  communityId,
  userEmail,
}: Pick<Invitation, "communityId" | "userEmail">) {
  return prisma.invitation.create({
    data: {
      community: {
        connect: {
          id: communityId,
        },
      },
      userEmail,
      status: {
        connect: {
          name: "Open",
        },
      },
    },
  });
}

export async function actionInvite({
  id,
  accepted,
  userId,
}: Pick<Invitation, "id"> & { accepted: boolean } & Pick<
    Member,
    "userId"
  >): Promise<Invitation> {
  const updatedInvite = await prisma.invitation.update({
    where: {
      id,
    },
    data: {
      lastUpdatedAt: new Date(),
      statusId: accepted ? "Accepted" : "Rejected",
    },
  });

  await prisma.community.update({
    where: {
      id: updatedInvite.communityId,
    },
    data: {
      members: {
        create: {
          userId: userId,
          permissionId: "Member",
        },
      },
    },
  });

  return updatedInvite;
}
