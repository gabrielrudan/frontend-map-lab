"use client";

import { useEffect, useMemo, useState } from "react";

import { locationService } from "@/services/locationService";
import { relationService } from "@/services/relationService";

import type { Location } from "@/types/location";
import type { Relation } from "@/types/relation";

export default function RelationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [relations, setRelations] = useState<Relation[]>([]);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      locationService.getAll(),
      relationService.getAll(),
    ])
      .then(([loadedLocations, loadedRelations]) => {
        if (cancelled) return;

        setLocations(loadedLocations);
        setRelations(loadedRelations);
      })
      .catch((error) => {
        console.error("Erro ao carregar relações:", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const locationsById = useMemo(
    () =>
      Object.fromEntries(
        locations.map((location) => [
          location.id,
          location,
        ]),
      ),
    [locations],
  );

  return (
    <section className="min-h-[calc(100vh-3.5rem)] bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Relações
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Visualização dos vínculos cadastrados entre os locais.
          </p>
        </div>

        <div className="mt-8">
          <p className="text-sm text-slate-500">
            {relations.length}{" "}
            {relations.length === 1
              ? "relação cadastrada"
              : "relações cadastradas"}
          </p>

          {relations.length === 0 ? (
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/50 p-8">
              <p className="text-sm text-slate-400">
                Nenhuma relação cadastrada.
              </p>
            </div>
          ) : (
            <div className="mt-4 grid gap-3">
              {relations.map((relation) => {
                const source =
                  locationsById[relation.sourceId];
                const target =
                  locationsById[relation.targetId];

                return (
                  <article
                    key={relation.id}
                    className="rounded-xl border border-slate-800 bg-slate-900/60 p-5"
                  >
                    <p className="text-sm font-semibold text-blue-400">
                      {relation.name}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                      <span className="font-medium text-slate-100">
                        {source?.name ??
                          "Local não encontrado"}
                      </span>

                      <span className="text-emerald-400">
                        →
                      </span>

                      <span className="font-medium text-slate-100">
                        {target?.name ??
                          "Local não encontrado"}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}