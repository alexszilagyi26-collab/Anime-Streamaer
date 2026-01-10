import { Link } from "wouter";
import { Play } from "lucide-react";
import type { AnimeResponse } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

interface AnimeCardProps {
  anime: AnimeResponse;
}

export function AnimeCard({ anime }: AnimeCardProps) {
  return (
    <Link href={`/anime/${anime.id}`}>
      <div className="group relative w-full cursor-pointer">
        {/* Card Image Container */}
        <div className="aspect-[2/3] w-full overflow-hidden rounded-xl bg-muted relative shadow-lg group-hover:shadow-primary/20 group-hover:shadow-2xl transition-all duration-300">
          {anime.coverImage ? (
            <img
              src={anime.coverImage}
              alt={anime.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-75 shadow-lg">
              <Play className="w-5 h-5 text-white ml-1" fill="currentColor" />
            </div>
          </div>

          {/* Top badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <Badge className="bg-primary text-white border-0 font-bold text-[10px] uppercase tracking-wider shadow-md">
              {anime.quality || 'HD'}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="mt-3 space-y-1">
          <h3 className="font-display font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
            {anime.title}
          </h3>
          <div className="flex flex-wrap gap-1">
            {anime.genres?.slice(0, 2).map((genre) => (
              <span key={genre} className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                {genre}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
