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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { CreateZoneFormDto } from "@/types/zone";

type CreateZoneModalProps = {
  open: boolean;
  onCancel: () => void;
  onZoneCreated: (data: CreateZoneFormDto) => Promise<void>;
};

const zoneColors = [
  {
    value: "#3b82f6",
    label: "Azul",
  },
  {
    value: "#ef4444",
    label: "Vermelho",
  },
  {
    value: "#22c55e",
    label: "Verde",
  },
];

export default function CreateZoneModal({
  open,
  onCancel,
  onZoneCreated,
}: CreateZoneModalProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("");

  function resetForm() {
    setName("");
    setColor("");
  }

  function handleCancel() {
    resetForm();
    onCancel();
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!name.trim() || !color) return;

    await onZoneCreated({
      name: name.trim(),
      color,
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
            Nova zona
          </DialogTitle>

          <DialogDescription className="text-slate-400">
            Informe um nome e uma cor para a zona.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="space-y-2">
            <Label
              htmlFor="zone-name"
              className="text-slate-300"
            >
              Nome
            </Label>

            <Input
              id="zone-name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Nome da zona"
              className="
                border-slate-800
                bg-slate-900
                text-slate-100
                placeholder:text-slate-500
                focus-visible:ring-blue-500
              "
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">
              Cor
            </Label>

            <Select
              value={color}
              onValueChange={(value) => {
                setColor(value ?? "");
              }}
            >
              <SelectTrigger
                className="
                  border-slate-800
                  bg-slate-900
                  text-slate-100
                "
              >
                <SelectValue placeholder="Selecione uma cor" />
              </SelectTrigger>

              <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
                {zoneColors.map((zoneColor) => (
                  <SelectItem
                    key={zoneColor.value}
                    value={zoneColor.value}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor:
                            zoneColor.value,
                        }}
                      />

                      {zoneColor.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
              Salvar zona
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}