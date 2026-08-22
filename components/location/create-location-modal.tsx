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
import { Textarea } from "@/components/ui/textarea";

import type { Location } from "@/types/location";

type Position = {
  lat: number;
  lng: number;
};

type CreateLocationModalProps = {
  open: boolean;
  position: Position | null;
  onCancel: () => void;
  onLocationCreated: (location: Location) => void;
};

export default function CreateLocationModal({
  open,
  position,
  onCancel,
  onLocationCreated,
}: CreateLocationModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");

  function resetForm() {
    setName("");
    setDescription("");
    setType("");
  }

  function handleCancel() {
    resetForm();
    onCancel();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!position || !name.trim() || !type) {
      return;
    }

    const location: Location = {
      id: crypto.randomUUID(),
      name: name.trim(),
      description: description.trim(),
      type,
      lat: position.lat,
      lng: position.lng,
    };

    onLocationCreated(location);
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
          <DialogTitle className="text-xl font-semibold tracking-tight text-white">
            Cadastrar local
          </DialogTitle>

          <DialogDescription className="text-slate-400">
            Informe os dados do novo ponto.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label
              htmlFor="location-name"
              className="text-sm font-medium text-slate-300"
            >
              Nome
            </Label>

            <Input
              id="location-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nome do local"
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
            <Label
              htmlFor="location-description"
              className="text-sm font-medium text-slate-300"
            >
              Descrição
            </Label>

            <Textarea
              id="location-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Descrição do local"
              className="
                min-h-24
                resize-none
                border-slate-800
                bg-slate-900
                text-slate-100
                placeholder:text-slate-500
                focus-visible:ring-blue-500
              "
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-300">
              Tipo
            </Label>

            <Select
              value={type}
              onValueChange={(value) => {
                setType(value ?? "");
              }}
            >
              <SelectTrigger
                className="
                  border-slate-800
                  bg-slate-900
                  text-slate-100
                  focus:ring-blue-500
                "
              >
                <SelectValue placeholder="Selecione um tipo" />
              </SelectTrigger>

              <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
                <SelectItem value="tipo-a">Tipo A</SelectItem>
                <SelectItem value="tipo-b">Tipo B</SelectItem>
                <SelectItem value="tipo-c">Tipo C</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {position && (
            <div className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Coordenadas
              </span>

              <p className="mt-1 font-mono text-xs text-slate-300">
                {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
              </p>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
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
              className="
                bg-blue-600
                text-white
                hover:bg-blue-500
              "
            >
              Cadastrar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}