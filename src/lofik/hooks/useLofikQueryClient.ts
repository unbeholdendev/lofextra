import { useQueryClient } from "@tanstack/react-query";

// https://github.com/TanStack/query/issues/3595
// https://github.com/TanStack/query/issues/5371
export const useLofikQueryClient = () => useQueryClient();
