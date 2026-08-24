"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { Location } from "@/types/location";
import type { Zone } from "@/types/zone";

type ZoneDetailsModalProps = {
  open: boolean;
  zone: Zone | null;
  locationsInsideZone: Location[];
  onCancel: () => void;
};

export default function ZoneDetailsModal({
  open,
  zone,
  locationsInsideZone,
  onCancel,
}: ZoneDetailsModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onCancel();
        }
      }}
    >
      <DialogContent
        className="
          border-slate-800
          bg-slate-950
          text-slate-100
          shadow-2xl
          sm:max-w-lg
        "
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight text-white">
            {zone?.name ?? "Detalhes da zona"}
          </DialogTitle>

          <DialogDescription className="text-slate-400">
            Informações da zona e dos locais encontrados em seu interior.
          </DialogDescription>
        </DialogHeader>

        {zone && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Cor
                </span>

                <div className="mt-2 flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor: zone.color,
                    }}
                  />

                  <span className="font-mono text-xs text-slate-300">
                    {zone.color}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Pontos encontrados
                </span>

                <p className="mt-1 text-xl font-semibold text-blue-400">
                  {locationsInsideZone.length}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Locais dentro da zona
              </span>

              {locationsInsideZone.length === 0 ? (
                <p className="mt-3 text-sm text-slate-400">
                  Nenhum local encontrado dentro desta zona.
                </p>
              ) : (
                <div className="mt-3 space-y-2">
                  {locationsInsideZone.map((location) => (
                    <div
                      key={location.id}
                      className="rounded-md border border-slate-800 bg-slate-950 px-3 py-3"
                    >
                      <p className="text-sm font-medium text-slate-100">
                        {location.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {location.type}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}