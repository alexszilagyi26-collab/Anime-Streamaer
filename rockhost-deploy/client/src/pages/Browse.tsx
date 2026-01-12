import { useState } from "react";
import { useAnimes } from "@/hooks/use-animes";
import { Navbar } from "@/components/Navbar";
import { AnimeCard } from "@/components/AnimeCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Browse() {
  const [search, setSearch] = useState("");
  const { data: animes, isLoading } = useAnimes({ search });

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">Browse Library</h1>
            <p className="text-muted-foreground">Find your next favorite anime from our collection.</p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search anime..." 
              className="pl-10 bg-secondary/30 border-white/5 focus:border-primary/50 transition-colors h-12 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
           {isLoading ? (
             Array(12).fill(0).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[2/3] w-full rounded-xl bg-secondary/50" />
                <Skeleton className="h-4 w-3/4 bg-secondary/50" />
              </div>
             ))
           ) : animes && animes.length > 0 ? (
             animes.map((anime) => (
               <AnimeCard key={anime.id} anime={anime} />
             ))
           ) : (
             <div className="col-span-full py-20 text-center">
               <h3 className="text-xl font-bold mb-2">No results found</h3>
               <p className="text-muted-foreground">Try searching for something else.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
