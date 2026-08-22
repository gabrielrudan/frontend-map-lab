"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { Location } from "@/types/location";

type LocationDetailsModalProps = {
  open: boolean;
  location: Location | null;
  onCancel: () => void;
};

export default function LocationDetailsModal({
  open,
  location,
  onCancel,
}: LocationDetailsModalProps) {
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
          sm:max-w-md
        "
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight text-white">
            {location?.name ?? "Detalhes do local"}
          </DialogTitle>

          <DialogDescription className="text-slate-400">
            Informações do ponto selecionado.
          </DialogDescription>
        </DialogHeader>

        {location && (
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Descrição
              </span>

              <p className="mt-1 text-sm leading-relaxed text-slate-200">
                {location.description || "Sem descrição"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Tipo
                </span>

                <p className="mt-1 text-sm font-medium text-blue-400">
                  {location.type}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Coordenadas
                </span>

                <p className="mt-1 font-mono text-xs leading-5 text-slate-300">
                  {location.lat.toFixed(5)}
                  <br />
                  {location.lng.toFixed(5)}
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}