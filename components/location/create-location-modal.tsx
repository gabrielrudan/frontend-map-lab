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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastrar local</DialogTitle>

          <DialogDescription>
            Informe os dados do novo ponto.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location-name">Nome</Label>

            <Input
              id="location-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nome do local"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location-description">
              Descrição
            </Label>

            <Textarea
              id="location-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Descrição do local"
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>

            <Select
              value={type}
              onValueChange={(value) => {
                setType(value ?? "");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um tipo" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="tipo-a">Tipo A</SelectItem>
                <SelectItem value="tipo-b">Tipo B</SelectItem>
                <SelectItem value="tipo-c">Tipo C</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {position && (
            <p className="text-sm text-muted-foreground">
              Coordenadas: {position.lat.toFixed(5)},{" "}
              {position.lng.toFixed(5)}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              Cancelar
            </Button>

            <Button type="submit">
              Cadastrar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}