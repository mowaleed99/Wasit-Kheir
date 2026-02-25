import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api";

export const useLogin = (options: any = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      apiClient.post("/api/auth/login", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user"] }),
    ...options,
  });
};

export const useSignup = (options: any = {}) => {
  return useMutation({
    mutationFn: (data: any) => apiClient.post("/api/auth/signup", data),
    ...options,
  });
};

export const usePosts = (page = 1, pageSize = 20) => {
  return useQuery({
    queryKey: ["posts", page],
    queryFn: () =>
      apiClient
        .get(`/api/posts?page=${page}&pageSize=${pageSize}`)
        .then((res) => res.data),
  });
};

export const useCategoriesTree = () => {
  return useQuery({
    queryKey: ["categoriesTree"],
    queryFn: () =>
      apiClient.get("/api/categories/tree").then((res) => res.data),
  });
};

export const useUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: () => apiClient.get("/api/users/me").then((res) => res.data),
  });
};
