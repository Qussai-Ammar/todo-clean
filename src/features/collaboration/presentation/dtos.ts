import { z } from "zod";
import { COLLABORATOR_ROLES } from "../domain/role";

export const inviteMemberSchema = z.object({
  email: z.string().email("A valid email is required"),
  role: z.enum(COLLABORATOR_ROLES).default("viewer"),
});

export const changeRoleSchema = z.object({
  role: z.enum(COLLABORATOR_ROLES),
});

export type InviteMemberDto = z.infer<typeof inviteMemberSchema>;
export type ChangeRoleDto = z.infer<typeof changeRoleSchema>;
