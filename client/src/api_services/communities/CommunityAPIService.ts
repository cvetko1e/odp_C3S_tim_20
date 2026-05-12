import axios from "axios";
import type { ICommunityAPIService } from "./ICommunityAPIService";
import type { Community } from "../../types/communities/Community";
import type { CreateCommunityDto } from "../../types/communities/CreateCommunityDto";
import type { UpdateCommunityDto } from "../../types/communities/UpdateCommunityDto";
import type {
  CommunityActionResponse,
  CommunityListResponse,
  SingleCommunityResponse,
} from "../../types/communities/CommunityApiResponse";

const API_URL = import.meta.env.VITE_API_URL + "communities";

const authHeader = (token: string) => ({ Authorization: `Bearer ${token}` });

export const communityApi: ICommunityAPIService = {
  async getPublicCommunities(): Promise<Community[]> {
    try {
      const response = await axios.get<CommunityListResponse>(API_URL);
      return response.data.success ? (response.data.data ?? []) : [];
    } catch {
      return [];
    }
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

  async getCommunityById(id: number, token?: string): Promise<Community | null> {
    try {
      const headers = token ? authHeader(token) : undefined;
      const response = await axios.get<SingleCommunityResponse>(`${API_URL}/${id}`, { headers });
      return response.data.success ? (response.data.data ?? null) : null;
    } catch {
      return null;
    }
  },

  async createCommunity(token: string, dto: CreateCommunityDto): Promise<Community | null> {
    try {
      const response = await axios.post<SingleCommunityResponse>(API_URL, dto, { headers: authHeader(token) });
      return response.data.success ? (response.data.data ?? null) : null;
    } catch {
      return null;
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

  async joinCommunity(token: string, id: number): Promise<boolean> {
    try {
      const response = await axios.post<CommunityActionResponse>(`${API_URL}/${id}/join`, {}, { headers: authHeader(token) });
      return response.data.success;
    } catch {
      return false;
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
};
