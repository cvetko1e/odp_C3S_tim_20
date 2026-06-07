import axios from "axios";
import type { ICommunityAPIService } from "./ICommunityAPIService";
import { emptyCommunity, type Community, type CommunityMemberRole, type CommunityMemberStatus } from "../../types/communities/Community";
import type { CreateCommunityDto } from "../../types/communities/CreateCommunityDto";
import type { UpdateCommunityDto } from "../../types/communities/UpdateCommunityDto";
import type {
  CommunityActionResponse,
  CommunityMemberListResponse,
  CommunityListResponse,
  SingleCommunityResponse,
} from "../../types/communities/CommunityApiResponse";

const BASE_API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1";
const API_URL = `${BASE_API_URL.replace(/\/+$/, "")}/communities`;

const authHeader = (token: string) => ({ Authorization: `Bearer ${token}` });

export const communityApi: ICommunityAPIService = {
  async getPublicCommunities(): Promise<Community[]> {
    const response = await axios.get<CommunityListResponse>(API_URL);
    if (!response.data.success) {
      throw new Error(response.data.message ?? "Failed to load communities");
    }
    return response.data.data ?? [];
  },

  async getMyCommunities(token: string): Promise<Community[]> {
    try {
      const response = await axios.get<CommunityListResponse>(`${API_URL}/mine`, { headers: authHeader(token) });
      return response.data.success ? (response.data.data ?? []) : [];
    } catch {
      return [];
    }
  },

  async getAllCommunities(token: string): Promise<Community[]> {
    try {
      const response = await axios.get<CommunityListResponse>(`${API_URL}/all`, { headers: authHeader(token) });
      return response.data.success ? (response.data.data ?? []) : [];
    } catch {
      return [];
    }
  },

  async getCommunityById(id: number, token?: string): Promise<Community> {
    try {
      const headers = token ? authHeader(token) : undefined;
      const response = await axios.get<SingleCommunityResponse>(`${API_URL}/${id}`, { headers });
      return response.data.success ? (response.data.data ?? emptyCommunity) : emptyCommunity;
    } catch {
      return emptyCommunity;
    }
  },

  async createCommunity(token: string, dto: CreateCommunityDto): Promise<Community> {
    try {
      const response = await axios.post<SingleCommunityResponse>(API_URL, dto, { headers: authHeader(token) });
      return response.data.success ? (response.data.data ?? emptyCommunity) : emptyCommunity;
    } catch {
      return emptyCommunity;
    }
  },

  async updateCommunity(token: string, id: number, dto: UpdateCommunityDto): Promise<boolean> {
    try {
      const response = await axios.put<CommunityActionResponse>(`${API_URL}/${id}`, dto, { headers: authHeader(token) });
      return response.data.success;
    } catch {
      return false;
    }
  },

  async deleteCommunity(token: string, id: number): Promise<boolean> {
    try {
      const response = await axios.delete<CommunityActionResponse>(`${API_URL}/${id}`, { headers: authHeader(token) });
      return response.data.success;
    } catch {
      return false;
    }
  },

  async joinCommunity(token: string, id: number): Promise<CommunityActionResponse> {
    try {
      const response = await axios.post<CommunityActionResponse>(`${API_URL}/${id}/join`, {}, { headers: authHeader(token) });
      return {
        success: response.data.success,
        message: response.data.message ?? (response.data.success ? "Joined community successfully" : "Join failed"),
      };
    } catch (err) {
      if (axios.isAxiosError<CommunityActionResponse>(err)) {
        const message = err.response?.data?.message;
        return { success: false, message: typeof message === "string" ? message : "Join failed" };
      }
      return { success: false, message: "Join failed" };
    }
  },

  async leaveCommunity(token: string, id: number): Promise<boolean> {
    try {
      const response = await axios.delete<CommunityActionResponse>(`${API_URL}/${id}/leave`, { headers: authHeader(token) });
      return response.data.success;
    } catch {
      return false;
    }
  },

  async getMembers(token: string, id: number) {
    try {
      const response = await axios.get<CommunityMemberListResponse>(`${API_URL}/${id}/members`, { headers: authHeader(token) });
      return response.data.success ? (response.data.data ?? []) : [];
    } catch {
      return [];
    }
  },

  async updateMemberRole(token: string, id: number, userId: number, role: CommunityMemberRole): Promise<CommunityActionResponse> {
    try {
      const response = await axios.patch<CommunityActionResponse>(`${API_URL}/${id}/members/${userId}/role`, { role }, { headers: authHeader(token) });
      return { success: response.data.success, message: response.data.message };
    } catch (err) {
      if (axios.isAxiosError<CommunityActionResponse>(err)) {
        return { success: false, message: err.response?.data?.message ?? "Failed to update member role" };
      }
      return { success: false, message: "Failed to update member role" };
    }
  },

  async updateMemberStatus(token: string, id: number, userId: number, status: CommunityMemberStatus): Promise<CommunityActionResponse> {
    try {
      const response = await axios.patch<CommunityActionResponse>(`${API_URL}/${id}/members/${userId}/status`, { status }, { headers: authHeader(token) });
      return { success: response.data.success, message: response.data.message };
    } catch (err) {
      if (axios.isAxiosError<CommunityActionResponse>(err)) {
        return { success: false, message: err.response?.data?.message ?? "Failed to update member status" };
      }
      return { success: false, message: "Failed to update member status" };
    }
  },

  async removeMember(token: string, id: number, userId: number): Promise<CommunityActionResponse> {
    try {
      const response = await axios.delete<CommunityActionResponse>(`${API_URL}/${id}/members/${userId}`, { headers: authHeader(token) });
      return { success: response.data.success, message: response.data.message };
    } catch (err) {
      if (axios.isAxiosError<CommunityActionResponse>(err)) {
        return { success: false, message: err.response?.data?.message ?? "Failed to remove member" };
      }
      return { success: false, message: "Failed to remove member" };
    }
  },
};
