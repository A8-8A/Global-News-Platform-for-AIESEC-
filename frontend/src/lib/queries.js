// React Query hooks. These wrap the existing vanilla `api` client
// (src/api/client.js) — the underlying HTTP layer is untouched.
//
// Every screen consumes data through these hooks so that loading,
// error and empty states are first-class everywhere.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

// Build a query string from a plain object, skipping empty values.
function qs(params) {
  if (!params) return '';
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ''
  );
  if (!entries.length) return '';
  return '?' + new URLSearchParams(entries).toString();
}

/* ---------------- Feed ---------------- */

export const useFeed = (opts) =>
  useQuery({
    queryKey: ['feed', opts ?? null],
    queryFn: () => api.get(`/api/feed${qs(opts)}`),
  });

export const usePost = (id) =>
  useQuery({
    queryKey: ['post', id],
    queryFn: () => api.get(`/api/feed/${id}`),
    enabled: !!id,
  });

/* ---------------- Engagement ---------------- */

export const useToggleLike = (postId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(`/api/posts/${postId}/like`),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ['post', postId] });
      const prev = qc.getQueryData(['post', postId]);
      qc.setQueryData(['post', postId], (old) => {
        if (!old) return old;
        // detail endpoint returns { post, comments }; feed returns a bare post
        const target = old.post ?? old;
        const next = {
          ...target,
          likedByMe: !target.likedByMe,
          likeCount: (target.likeCount ?? 0) + (target.likedByMe ? -1 : 1),
        };
        return old.post ? { ...old, post: next } : next;
      });
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev !== undefined) qc.setQueryData(['post', postId], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['post', postId] });
      qc.invalidateQueries({ queryKey: ['feed'] });
    },
  });
};

export const usePostComment = (postId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content) =>
      api.post(`/api/posts/${postId}/comments`, { content }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['post', postId] }),
  });
};

/* ---------------- Authoring ---------------- */

export const useCreatePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (post) => api.post('/api/posts', post),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['feed'] }),
  });
};

export const useMyPosts = () =>
  useQuery({
    queryKey: ['posts', 'mine'],
    queryFn: () => api.get('/api/posts/mine'),
  });

/* ---------------- Admin ---------------- */

export const usePendingPosts = () =>
  useQuery({
    queryKey: ['admin', 'pending'],
    queryFn: () => api.get('/api/admin/posts/pending'),
  });

export const useApprovePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.post(`/api/admin/posts/${id}/approve`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'pending'] });
      qc.invalidateQueries({ queryKey: ['feed'] });
    },
  });
};

export const useRejectPost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }) =>
      api.post(`/api/admin/posts/${id}/reject`, note ? { note } : undefined),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'pending'] }),
  });
};

export const useMcpActivity = (range = '30d') =>
  useQuery({
    queryKey: ['admin', 'mcp-activity', range],
    queryFn: () => api.get(`/api/admin/mcp-activity${qs({ range })}`),
  });

export const useAuditLog = (filter) =>
  useQuery({
    queryKey: ['admin', 'audit', filter ?? null],
    queryFn: () => api.get(`/api/admin/audit-log${qs(filter)}`),
  });

/* ---------------- Profiles ---------------- */

// For own profile we ALWAYS call /api/auth/me — never /api/users/:id.
// This means we don't need resolvedId to be set, and we bypass any
// UserService issues. For other users we call /api/users/:id.
export const useProfile = (id, isOwnProfile = false) =>
  useQuery({
    queryKey: ['profile', isOwnProfile ? 'me' : id],
    queryFn: () => isOwnProfile
      ? api.get('/api/auth/me')
      : api.get(`/api/users/${id}`),
    // For own profile: always enabled (we know the user is logged in
    // because the authLoading guard already passed).
    // For others: enabled only when we have a real id.
    enabled: isOwnProfile ? true : !!id,
  });

export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }) => api.put(`/api/users/${id}`, body),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['profile', vars.id] });
      qc.invalidateQueries({ queryKey: ['profile', 'me'] });
    },
  });
};
