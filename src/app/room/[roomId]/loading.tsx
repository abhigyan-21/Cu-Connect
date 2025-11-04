import { Skeleton } from "@/components/ui/skeleton";

export default function RoomLoading() {
  return (
    <div className="flex h-screen w-full flex-col bg-background relative">
      <header className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-2 text-xl font-bold text-destructive font-headline">
          CU-Connect
        </div>
        <Skeleton className="h-8 w-32" />
      </header>

      <main className="flex-1 p-4 pt-20 pb-28 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-min">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="aspect-video w-full" />
        ))}
      </main>

      <footer className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <div className="flex items-center justify-center gap-4 rounded-lg bg-card/80 p-4 backdrop-blur-md shadow-lg">
          <Skeleton className="rounded-full w-16 h-16" />
          <Skeleton className="rounded-full w-16 h-16" />
          <Skeleton className="rounded-full w-16 h-16" />
          <Skeleton className="rounded-full w-16 h-16" />
        </div>
      </footer>
    </div>
  );
}
