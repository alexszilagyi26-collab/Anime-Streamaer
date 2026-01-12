import { useAnimes } from "@/hooks/use-animes";
import { Navbar } from "@/components/Navbar";
import { AnimeCard } from "@/components/AnimeCard";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Play, Star, TrendingUp } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: animes, isLoading } = useAnimes();
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);

  // Featured content - grab first 3 or placeholders
  const featured = animes?.slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <Navbar />

      {/* Hero Section */}
      <section className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden">
        {isLoading ? (
          <Skeleton className="w-full h-full bg-secondary/30" />
        ) : featured.length > 0 ? (
          <div className="embla w-full h-full" ref={emblaRef}>
            <div className="embla__container flex w-full h-full">
              {featured.map((anime) => (
                <div key={anime.id} className="embla__slide relative min-w-full h-full">
                  <div className="absolute inset-0">
                    <img
                      src={anime.boritokep || ""}
                      alt={anime.animeNev}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
                  </div>

                  <div className="absolute bottom-0 left-0 p-8 md:p-16 w-full md:w-2/3 lg:w-1/2 z-10 space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold tracking-wider text-sm uppercase">
                      <TrendingUp className="w-4 h-4" /> Trending Now
                    </div>
                    <h1 className="text-4xl md:text-6xl font-display font-black leading-tight text-glow">
                      {anime.animeNev}
                    </h1>
                    <p className="text-muted-foreground line-clamp-3 md:text-lg">
                      {anime.leiras}
                    </p>
                    <div className="flex gap-4 pt-4">
                      <Link href={`/anime/${anime.id}`}>
                        <Button size="lg" className="rounded-full px-8 font-bold text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
                          <Play className="w-5 h-5 mr-2 fill-current" /> Watch Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Empty State Hero */
          <div className="w-full h-full flex items-center justify-center bg-secondary/20">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">No Animes Yet</h1>
              <p className="text-muted-foreground mb-6">Be the first to share one!</p>
              <Link href="/share">
                <Button>Share Anime</Button>
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Latest Releases */}
      <section className="container mx-auto px-4 mt-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-primary rounded-full" />
            <h2 className="text-2xl font-display font-bold">Latest Releases</h2>
          </div>
          <Link href="/browse" className="text-sm font-semibold text-primary hover:underline">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {isLoading
            ? Array(10).fill(0).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[2/3] w-full rounded-xl bg-secondary/50" />
                <Skeleton className="h-4 w-3/4 bg-secondary/50" />
                <Skeleton className="h-3 w-1/2 bg-secondary/50" />
              </div>
            ))
            : animes?.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))
          }
        </div>
      </section>
    </div>
  );
}
