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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {location?.name ?? "Detalhes do local"}
          </DialogTitle>

          <DialogDescription>
            Informações do ponto selecionado.
          </DialogDescription>
        </DialogHeader>

        {location && (
          <div className="space-y-3">
            <div>
              <strong>Descrição:</strong>
              <p>{location.description || "Sem descrição"}</p>
            </div>

            <div>
              <strong>Tipo:</strong>
              <p>{location.type}</p>
            </div>

            <div>
              <strong>Latitude:</strong>
              <p>{location.lat}</p>
            </div>

            <div>
              <strong>Longitude:</strong>
              <p>{location.lng}</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}