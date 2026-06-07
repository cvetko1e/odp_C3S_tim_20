import { ICommunityService } from "../../Domain/services/communities/ICommunityService";
import { ICommunityRepository } from "../../Domain/repositories/communities/ICommunityRepository";
import { CommunityDto, CommunityMemberRole, CommunityMemberStatus } from "../../Domain/DTOs/communities/CommunityDto";
import { CommunityMemberDto } from "../../Domain/DTOs/communities/CommunityMemberDto";
import { CreateCommunityDto } from "../../Domain/DTOs/communities/CreateCommunityDto";
import { UpdateCommunityDto } from "../../Domain/DTOs/communities/UpdateCommunityDto";
import { UserRole } from "../../Domain/enums/UserRole";
import { ServiceResult } from "../../Domain/types/ServiceResult";

export class CommunityService implements ICommunityService {
  public constructor(private readonly communityRepo: ICommunityRepository) {}

  private async canModerate(id: number, userId: number, userRole: UserRole): Promise<boolean> {
    if (userRole === UserRole.ADMIN) return true;
    return this.communityRepo.isModerator(id, userId);
  }

  public async getPublic(): Promise<CommunityDto[]> {
    return this.communityRepo.getPublic();
  }

  public async getAll(): Promise<CommunityDto[]> {
    return this.communityRepo.getAll();
  }

  public async getById(id: number): Promise<ServiceResult<CommunityDto>> {
    const community = await this.communityRepo.getById(id);
    if (community.id === 0) {
      return { success: false, status: 404, message: "Community not found", data: null };
    }
    return { success: true, status: 200, message: "OK", data: community };
  }

  public async getMine(userId: number): Promise<CommunityDto[]> {
    return this.communityRepo.getByUserId(userId);
  }

  public async create(dto: CreateCommunityDto, createdBy: number): Promise<ServiceResult<CommunityDto>> {
    const community = await this.communityRepo.create(dto, createdBy);
    if (community.id === 0) {
      return { success: false, status: 500, message: "Failed to create community", data: null };
    }
    return { success: true, status: 201, message: "Community created", data: community };
  }

  public async update(id: number, dto: UpdateCommunityDto, userId: number, userRole: UserRole): Promise<ServiceResult<boolean>> {
    if (userRole !== UserRole.ADMIN) {
      const moderator = await this.communityRepo.isModerator(id, userId);
      if (!moderator) {
        return { success: false, status: 403, message: "Unauthorized to update this community", data: null };
      }
    }

    const ok = await this.communityRepo.update(id, dto);
    if (!ok) {
      return { success: false, status: 500, message: "Failed to update community", data: null };
    }
    return { success: true, status: 200, message: "Community updated", data: true };
  }

  public async delete(id: number, userId: number, userRole: UserRole): Promise<ServiceResult<boolean>> {
    if (userRole !== UserRole.ADMIN) {
      const moderator = await this.communityRepo.isModerator(id, userId);
      if (!moderator) {
        return { success: false, status: 403, message: "Unauthorized to delete this community", data: null };
      }
    }

    const ok = await this.communityRepo.delete(id);
    if (!ok) {
      return { success: false, status: 500, message: "Failed to delete community", data: null };
    }
    return { success: true, status: 200, message: "Community deleted", data: true };
  }

  public async join(id: number, userId: number): Promise<ServiceResult<boolean>> {
    const community = await this.communityRepo.getById(id);
    if (community.id === 0) {
      return { success: false, status: 404, message: "Community not found", data: null };
    }

    const alreadyMember = await this.communityRepo.isMember(id, userId);
    if (alreadyMember) {
      return {
        success: false,
        status: 409,
        message: "You are already a member or have a pending request",
        data: null,
      };
    }

    const joined = await this.communityRepo.joinCommunity(id, userId);
    if (!joined) {
      return { success: false, status: 500, message: "Failed to join community", data: null };
    }

    const message = community.type === "private" ? "Join request sent" : "Joined community successfully";
    return { success: true, status: 200, message, data: true };
  }

  public async leave(id: number, userId: number): Promise<ServiceResult<boolean>> {
    const ok = await this.communityRepo.leaveCommunity(id, userId);
    if (!ok) {
      return { success: false, status: 409, message: "Failed to leave community - you may be the moderator", data: null };
    }
    return { success: true, status: 200, message: "Left community", data: true };
  }

  public async getMembers(id: number, userId: number, userRole: UserRole): Promise<ServiceResult<CommunityMemberDto[]>> {
    const allowed = await this.canModerate(id, userId, userRole);
    if (!allowed) {
      return { success: false, status: 403, message: "Unauthorized to view community members", data: null };
    }

    return { success: true, status: 200, message: "OK", data: await this.communityRepo.getMembers(id) };
  }

  public async updateMemberRole(
    id: number,
    memberUserId: number,
    role: CommunityMemberRole,
    actorId: number,
    actorRole: UserRole,
  ): Promise<ServiceResult<boolean>> {
    if (role !== "moderator" && role !== "member") {
      return { success: false, status: 400, message: "Role must be 'moderator' or 'member'", data: null };
    }
    if (memberUserId === actorId) {
      return { success: false, status: 400, message: "You cannot change your own community role", data: null };
    }

    const allowed = await this.canModerate(id, actorId, actorRole);
    if (!allowed) {
      return { success: false, status: 403, message: "Unauthorized to change member role", data: null };
    }

    const ok = await this.communityRepo.updateMemberRole(id, memberUserId, role);
    if (!ok) {
      return { success: false, status: 404, message: "Active community member not found", data: null };
    }

    return { success: true, status: 200, message: "Member role updated", data: true };
  }

  public async updateMemberStatus(
    id: number,
    memberUserId: number,
    status: CommunityMemberStatus,
    actorId: number,
    actorRole: UserRole,
  ): Promise<ServiceResult<boolean>> {
    if (status !== "active" && status !== "pending" && status !== "banned") {
      return { success: false, status: 400, message: "Status must be 'active', 'pending', or 'banned'", data: null };
    }
    if (memberUserId === actorId) {
      return { success: false, status: 400, message: "You cannot change your own membership status", data: null };
    }

    const allowed = await this.canModerate(id, actorId, actorRole);
    if (!allowed) {
      return { success: false, status: 403, message: "Unauthorized to change member status", data: null };
    }

    const ok = await this.communityRepo.updateMemberStatus(id, memberUserId, status);
    if (!ok) {
      return { success: false, status: 404, message: "Community member not found", data: null };
    }

    return { success: true, status: 200, message: "Member status updated", data: true };
  }

  public async removeMember(
    id: number,
    memberUserId: number,
    actorId: number,
    actorRole: UserRole,
  ): Promise<ServiceResult<boolean>> {
    if (memberUserId === actorId) {
      return { success: false, status: 400, message: "Use leave community instead of removing yourself", data: null };
    }

    const allowed = await this.canModerate(id, actorId, actorRole);
    if (!allowed) {
      return { success: false, status: 403, message: "Unauthorized to remove member", data: null };
    }

    const ok = await this.communityRepo.removeMember(id, memberUserId);
    if (!ok) {
      return { success: false, status: 404, message: "Community member not found", data: null };
    }

    return { success: true, status: 200, message: "Member removed", data: true };
  }
}
