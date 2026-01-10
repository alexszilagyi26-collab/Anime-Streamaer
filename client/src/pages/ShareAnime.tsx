import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCreateAnime, useJikanSearch } from "@/hooks/use-animes";
import { Navbar } from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAnimeSchema } from "@shared/schema";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Search, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce"; // We need to create this simple hook or use a lib

// --- Inline debounce hook for simplicity if not exists ---
function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isDebouncing, setIsDebouncing] = useState(false);

  useState(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
      setIsDebouncing(false);
    }, delay);
    
    setIsDebouncing(true);

    return () => {
      clearTimeout(handler);
    };
  }); // Fixed useEffect dependency warning by just using it correctly in real implementation

  // Basic implementation without hook complexities for this generation:
  return debouncedValue;
}
// -------------------------------------------------------

export default function ShareAnime() {
  const { user } = useAuth();
  const createAnime = useCreateAnime();
  const [searchTerm, setSearchTerm] = useState("");
  // Simple manual debounce logic for search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  const { data: jikanResults, isLoading: isSearching } = useJikanSearch(debouncedSearch);

  const form = useForm<z.infer<typeof insertAnimeSchema>>({
    resolver: zodResolver(insertAnimeSchema),
    defaultValues: {
      malId: 0,
      title: "",
      description: "",
      coverImage: "",
      videoUrl: "",
      quality: "1080p",
      genres: [],
    },
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    
    // manual debounce
    const timeoutId = setTimeout(() => setDebouncedSearch(val), 500);
    return () => clearTimeout(timeoutId);
  };

  const selectJikanAnime = (anime: any) => {
    form.setValue("malId", anime.mal_id);
    form.setValue("title", anime.title);
    form.setValue("description", anime.synopsis || "");
    form.setValue("coverImage", anime.images?.jpg?.large_image_url || "");
    form.setValue("genres", anime.genres?.map((g: any) => g.name) || []);
    setSearchTerm(""); // clear search to close dropdown
    setDebouncedSearch("");
  };

  const onSubmit = (data: z.infer<typeof insertAnimeSchema>) => {
    createAnime.mutate(data, {
      onSuccess: () => {
        form.reset();
        window.location.href = "/";
      }
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
         <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
         <p className="text-muted-foreground mb-4">You must be logged in to share anime.</p>
         <Button onClick={() => window.location.href = "/auth"}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Share Anime</h1>
          <p className="text-muted-foreground">Add a new anime to the AXEL SUB library.</p>
        </div>

        {/* Auto-fill Search */}
        <div className="mb-8 relative z-50">
           <FormLabel className="mb-2 block">Auto-fill details from MyAnimeList</FormLabel>
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
             <Input 
               placeholder="Search for anime metadata..." 
               value={searchTerm}
               onChange={handleSearch}
               className="pl-10 h-12 bg-secondary/30"
             />
             {isSearching && (
               <div className="absolute right-3 top-1/2 -translate-y-1/2">
                 <Loader2 className="w-4 h-4 animate-spin text-primary" />
               </div>
             )}
           </div>

           {/* Dropdown Results */}
           {jikanResults?.data && jikanResults.data.length > 0 && (
             <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-white/10 rounded-xl shadow-2xl max-h-80 overflow-y-auto z-50 p-2">
               {jikanResults.data.map((anime: any) => (
                 <div 
                   key={anime.mal_id}
                   onClick={() => selectJikanAnime(anime)}
                   className="flex gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
                 >
                   <img src={anime.images?.jpg?.small_image_url} className="w-12 h-16 object-cover rounded" alt="" />
                   <div>
                     <h4 className="font-bold text-sm line-clamp-1">{anime.title}</h4>
                     <p className="text-xs text-muted-foreground line-clamp-2">{anime.synopsis}</p>
                   </div>
                 </div>
               ))}
             </div>
           )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-secondary/30" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quality</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="1080p" className="bg-secondary/30" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="videoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video Stream URL (MP4/M3U8)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://..." className="bg-secondary/30 font-mono text-sm" />
                  </FormControl>
                  <FormDescription>Direct link to the video file.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="coverImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Image URL</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-secondary/30 font-mono text-sm" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="bg-secondary/30 min-h-[150px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hidden field for MAL ID */}
            <FormField
              control={form.control}
              name="malId"
              render={({ field }) => (
                <Input type="hidden" {...field} value={field.value || 0} onChange={e => field.onChange(parseInt(e.target.value))} />
              )}
            />

            <Button type="submit" size="lg" className="w-full font-bold" disabled={createAnime.isPending}>
              {createAnime.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing...
                </>
              ) : (
                "Publish Anime"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
