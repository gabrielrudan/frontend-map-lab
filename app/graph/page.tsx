import GraphView from "@/components/graph/graph-view";

export default function GraphPage() {
  return (
    <section className="h-[calc(100vh-3.5rem)] bg-slate-950 text-slate-100">
      <div className="flex h-full flex-col">
        <div className="border-b border-slate-800 px-6 py-4">
          <h1 className="text-xl font-semibold tracking-tight">
            Grafo
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Visualização das conexões entre os locais cadastrados.
          </p>
        </div>

        <div className="min-h-0 flex-1">
          <GraphView />
        </div>
      </div>
    </section>
  );
}