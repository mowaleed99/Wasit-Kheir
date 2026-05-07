import { QueryClient, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { apiClient } from "./mutator";

export { apiClient } from "./mutator";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 401) return false;
        return failureCount < 3;
      },
    },
  },
});

// ─── Re-export all generated hooks ───────────────────────────────────────────
export * from "./generated/auth/auth";
export * from "./generated/categories/categories";
export * from "./generated/chat/chat";
export * from "./generated/reports/reports";
export * from "./generated/sub-categories/sub-categories";
export * from "./generated/users/users";
export * from "./generated/notifications/notifications";
export * from "./generated/matching/matching";
export * from "./generated/home/home";
export * from "./generated/lostAndFoundAPI.schemas";

// ─── Query key helpers ────────────────────────────────────────────────────────
export {
  getGetApiReportsQueryKey,
  getGetApiReportsIdQueryKey,
  getGetApiReportsMyReportsQueryKey,
} from "./generated/reports/reports";

export { getGetApiUsersMeQueryKey } from "./generated/users/users";

export {
  getGetApiChatSessionsQueryKey,
  getGetApiChatSessionsSessionIdMessagesQueryKey,
} from "./generated/chat/chat";

// ─── Backward-compat aliases ──────────────────────────────────────────────────
import { useGetApiChatSessions } from "./generated/chat/chat";
import { useGetApiCategoriesTree } from "./generated/categories/categories";
import { usePostApiAuthLogin } from "./generated/auth/auth";
import { useGetApiUsersMe } from "./generated/users/users";
import { usePostApiReports } from "./generated/reports/reports";
import { useGetApiReportsId } from "./generated/reports/reports";
import { useGetApiAuthVerifyAccount } from "./generated/auth/auth";
import { usePostApiAuthSignup } from "./generated/auth/auth";

export const useChatSessionsQuery = useGetApiChatSessions;
export const useCategoriesTree = useGetApiCategoriesTree;
export const useLogin = usePostApiAuthLogin;
export const useUser = useGetApiUsersMe;
export const useCreateReport = usePostApiReports;
export const useReportByIdQuery = useGetApiReportsId;
export const useAuthVerifyAccountQuery = useGetApiAuthVerifyAccount;
export const usePostApiAuthSignupMutation = usePostApiAuthSignup;

// ─── Response shape helpers ───────────────────────────────────────────────────
// The API returns: { success, message, data: { data: [...], page, totalPages, ... } }
// customInstance strips the axios wrapper -> returns the HTTP body directly
// So the shape is: { success, data: { data: [], page, totalPages } }
const extractList = (res: any): any[] => {
  if (!res) return [];
  // { data: { data: [] } }  <- standard paginated wrapper
  if (Array.isArray(res?.data?.data)) return res.data.data;
  // { data: [] }  <- flat list wrapper
  if (Array.isArray(res?.data)) return res.data;
  // already an array
  if (Array.isArray(res)) return res;
  return [];
};

// ─── useReports: infinite scroll for home feed ───────────────────────────────
export const useReports = (
  params?: {
    Type?: string;
    Status?: string;
    Search?: string;
    CategoryId?: number;
    SubCategoryId?: number;
    PageSize?: number;
  },
  enabled: boolean = true
) =>
  useInfiniteQuery({
    queryKey: ["reports-feed", params],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiClient.get("/api/Reports", {
        params: { ...params, Page: pageParam, PageSize: params?.PageSize || 20 },
      });
      // response.data is the HTTP body: { success, data: { data: [], page, totalPages } }
      return response.data;
    },
    enabled,
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) => {
      // Handle both { data: { page, totalPages } } and { page, totalPages }
      const pagination = lastPage?.data ?? lastPage;
      const page = pagination?.page ?? pagination?.currentPage;
      const totalPages = pagination?.totalPages;
      if (page != null && totalPages != null && page < totalPages) {
        return page + 1;
      }
      return undefined;
    },
    select: (data) => data, // keep raw pages for manual extraction
  });

// ─── useFilteredReports: single-page filtered query for category sidebar ─────
export const useFilteredReports = (
  params: {
    CategoryId?: number;
    SubCategoryId?: number;
    Type?: string;
    Search?: string;
    Page?: number;
    PageSize?: number;
  },
  enabled: boolean = true
) =>
  useQuery({
    queryKey: ["reports-filtered", params],
    queryFn: async () => {
      const response = await apiClient.get("/api/Reports", {
        params: { ...params },
      });
      return response.data;
    },
    enabled,
  });

// ─── useMyReports: current user's own reports for Profile page ───────────────
export const useMyReports = (params?: { page?: number; pageSize?: number }) =>
  useQuery({
    queryKey: ["reports-mine", params],
    queryFn: async () => {
      const response = await apiClient.get("/api/Reports/my-reports", { params });
      return response.data;
    },
  });

// ─── Re-export extractor so pages can use it ─────────────────────────────────
export { extractList };
