export interface ServiceResult<T> {
  success: boolean;
  status: number;
  message: string;
  data: T | null;
}
