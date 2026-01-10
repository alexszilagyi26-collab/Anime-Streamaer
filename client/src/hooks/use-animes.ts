import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { CreateAnimeRequest, CreateCommentRequest } from "@shared/schema";

export function useAnimes(params?: { search?: string; genre?: string }) {
  return useQuery({
    queryKey: [api.animes.list.path, params],
    queryFn: async () => {
      const url = params
        ? `${api.animes.list.path}?${new URLSearchParams(params as Record<string, string>)}`
        : api.animes.list.path;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch animes");
      return api.animes.list.responses[200].parse(await res.json());
    },
  });
}

export function useAnime(id: number) {
  return useQuery({
    queryKey: [api.animes.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.animes.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch anime details");
      return api.animes.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateAnime() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateAnimeRequest) => {
      const res = await fetch(api.animes.create.path, {
        method: api.animes.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create anime");
      return api.animes.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.animes.list.path] });
      toast({ title: "Success", description: "Anime shared successfully!" });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });
}

export function useJikanSearch(query: string) {
  return useQuery({
    queryKey: [api.animes.searchJikan.path, query],
    queryFn: async () => {
      if (!query) return null;
      const url = `${api.animes.searchJikan.path}?q=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to search Jikan");
      return await res.json();
    },
    enabled: !!query,
  });
}

export function useComments(animeId: number) {
  return useQuery({
    queryKey: [api.comments.list.path, animeId],
    queryFn: async () => {
      const url = buildUrl(api.comments.list.path, { animeId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch comments");
      return api.comments.list.responses[200].parse(await res.json());
    },
    enabled: !!animeId,
  });
}

export function useCreateComment(animeId: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Pick<CreateCommentRequest, "content">) => {
      const url = buildUrl(api.comments.create.path, { animeId });
      const res = await fetch(url, {
        method: api.comments.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to post comment");
      return api.comments.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.comments.list.path, animeId] });
      toast({ title: "Comment added" });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });
}
