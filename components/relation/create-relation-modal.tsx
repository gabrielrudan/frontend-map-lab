"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { CreateRelationFormDto } from "@/types/relation";

type CreateRelationModalProps = {
  open: boolean;
  sourceName?: string;
  targetName?: string;
  onCancel: () => void;
  onRelationCreated: (
    data: CreateRelationFormDto,
  ) => Promise<void>;
};

export default function CreateRelationModal({
  open,
  sourceName,
  targetName,
  onCancel,
  onRelationCreated,
}: CreateRelationModalProps) {
  const [name, setName] = useState("");

  function resetForm() {
    setName("");
  }

  function handleCancel() {
    resetForm();
    onCancel();
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!name.trim()) return;

    await onRelationCreated({
      name: name.trim(),
    });

    resetForm();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleCancel();
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
          <DialogTitle className="text-xl font-semibold text-white">
            Nova relação
          </DialogTitle>

          <DialogDescription className="text-slate-400">
            Defina a relação entre os locais selecionados.
          </DialogDescription>
        </DialogHeader>

        {sourceName && targetName && (
          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Locais selecionados
            </p>

            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="font-medium text-slate-100">
                {sourceName}
              </span>

              <span className="text-blue-400">
                →
              </span>

              <span className="font-medium text-slate-100">
                {targetName}
              </span>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="space-y-2">
            <Label
              htmlFor="relation-name"
              className="text-slate-300"
            >
              Nome da relação
            </Label>

            <Input
              id="relation-name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Ex.: Entrega para"
              className="
                border-slate-800
                bg-slate-900
                text-slate-100
                placeholder:text-slate-500
                focus-visible:ring-blue-500
              "
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="
                border-slate-700
                bg-transparent
                text-slate-300
                hover:bg-slate-800
                hover:text-white
              "
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              className="bg-blue-600 text-white hover:bg-blue-500"
            >
              Salvar relação
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}