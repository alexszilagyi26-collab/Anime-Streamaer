import { useRoute } from "wouter";
import { useAnime, useComments, useCreateComment } from "@/hooks/use-animes";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/Navbar";
import { CustomVideoPlayer } from "@/components/CustomVideoPlayer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Share2, Heart, Flag } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

export default function AnimeDetails() {
  const [, params] = useRoute("/anime/:id");
  const id = params?.id || "";
  const { data: anime, isLoading } = useAnime(id);
  const { data: comments, isLoading: loadingComments } = useComments(id);
  const { user } = useAuth();
  const createComment = useCreateComment(id);

  const [commentText, setCommentText] = useState("");

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    createComment.mutate({ content: commentText }, {
      onSuccess: () => setCommentText("")
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="w-full aspect-video rounded-xl bg-secondary/30 mb-8" />
          <Skeleton className="h-10 w-1/2 mb-4 bg-secondary/30" />
          <Skeleton className="h-20 w-full bg-secondary/30" />
        </div>
      </div>
    );
  }

  if (!anime) return <div className="text-center py-20">Anime not found</div>;

  const genres = anime.mufajok ? anime.mufajok.split(/[\s,]+/) : [];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />

      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content: Video & Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Video Player */}
            <div className="w-full">
              <CustomVideoPlayer
                src={anime.videoLink || ""}
                poster={anime.boritokep || undefined}
                title={anime.animeNev}
              />
            </div>

            {/* Info */}
            <div>
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                    {anime.animeNev}
                  </h1>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {genres.map(g => (
                      <Badge key={g} variant="secondary" className="bg-white/5 hover:bg-white/10">{g}</Badge>
                    ))}
                    <Badge variant="outline" className="border-primary/50 text-primary">HD</Badge>
                    <Badge variant="outline" className="border-secondary/50 text-secondary">EP {anime.epizodSzam}</Badge>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="rounded-full border-white/10 hover:bg-white/5 hover:text-red-500">
                    <Heart className="w-5 h-5" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full border-white/10 hover:bg-white/5">
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-wrap">
                {anime.leiras}
              </p>

              <div className="mt-6 flex items-center justify-between p-4 rounded-xl bg-secondary/20 border border-white/5">
                <div className="flex items-center gap-4">
                  <Badge className="bg-primary">{anime.status}</Badge>
                  <p className="text-xs text-muted-foreground">Added on {anime.createdAt && format(new Date(anime.createdAt), "MMM d, yyyy")}</p>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="pt-8 border-t border-white/5">
              <h3 className="text-2xl font-bold mb-6">Comments ({comments?.length || 0})</h3>

              {user ? (
                <form onSubmit={handleComment} className="mb-8 flex gap-4">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.avatarUrl || undefined} />
                    <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      placeholder="Share your thoughts..."
                      className="bg-secondary/30 border-white/5 min-h-[100px] rounded-xl focus:border-primary/50"
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                    />
                    <div className="flex justify-end">
                      <Button type="submit" disabled={createComment.isPending || !commentText.trim()}>
                        {createComment.isPending ? "Posting..." : "Post Comment"}
                      </Button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="mb-8 p-6 rounded-xl bg-secondary/20 text-center border border-white/5">
                  <p className="mb-4">Please log in to join the discussion.</p>
                  <Button variant="outline" onClick={() => window.location.href = '/auth'}>Sign In</Button>
                </div>
              )}

              <div className="space-y-6">
                {comments?.map(comment => (
                  <div key={comment.id} className="flex gap-4 group">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={comment.user?.avatarUrl || undefined} />
                      <AvatarFallback>{comment.user?.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{comment.user?.username}</span>
                        <span className="text-xs text-muted-foreground">
                          {comment.createdAt && format(new Date(comment.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed">{comment.content}</p>

                      <button className="text-xs text-muted-foreground mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-white">
                        <Flag className="w-3 h-3" /> Report
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar / Recommendations (Placeholder) */}
          <div className="space-y-6">
            <h3 className="font-bold text-lg">Recommended</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {/* Mock recommendations */}
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="w-20 h-28 bg-secondary rounded-md shrink-0 overflow-hidden">
                    {/* Placeholder image */}
                  </div>
                  <div>
                    <h4 className="font-bold line-clamp-2 mb-1">Coming Soon {i}</h4>
                    <p className="text-xs text-muted-foreground">Action, Adventure</p>
                    <div className="mt-2 text-xs font-bold text-primary">EP 2{i}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
