import CoordinateCard from "@/components/CoordinateCard";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <CoordinateCard
        latitude={-3.7319}
        longitude={-38.5267}
      />
    </main>
  );
}