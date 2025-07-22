"use client";

import { useState } from "react";
import { Edit, Save, X, Plus, Trash2, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Poll, RestaurantOption } from "@/types";
import { updatePollDetails, normalizeRestaurantOptions } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";

interface AdminPollEditorProps {
  poll: Poll;
  isAdmin: boolean;
  onPollUpdated: () => void;
}

export default function AdminPollEditor({
  poll,
  isAdmin,
  onPollUpdated,
}: AdminPollEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: poll.title,
    description: poll.description || "",
    restaurantOptions: normalizeRestaurantOptions(poll.restaurantOptions),
    votingDate: poll.votingEndsAt.toISOString().split("T")[0],
    votingTime: poll.votingEndsAt.toTimeString().slice(0, 5),
    orderingDate: poll.orderingEndsAt?.toISOString().split("T")[0] || "",
    orderingTime: poll.orderingEndsAt?.toTimeString().slice(0, 5) || "",
  });
  const { toast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    try {
      const votingEndsAt = new Date(
        `${formData.votingDate}T${formData.votingTime}`,
      );
      const orderingEndsAt =
        formData.orderingDate && formData.orderingTime
          ? new Date(`${formData.orderingDate}T${formData.orderingTime}`)
          : undefined;

      await updatePollDetails(poll.id, {
        title: formData.title,
        description: formData.description,
        restaurantOptions: formData.restaurantOptions,
        votingEndsAt,
        orderingEndsAt,
      });

      setIsEditing(false);
      onPollUpdated();

      toast({
        title: "Głosowanie zaktualizowane",
        description: "Zmiany zostały pomyślnie zapisane.",
      });
    } catch (error) {
      console.error("Error updating poll:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować głosowania.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: poll.title,
      description: poll.description || "",
      restaurantOptions: normalizeRestaurantOptions(poll.restaurantOptions),
      votingDate: poll.votingEndsAt.toISOString().split("T")[0],
      votingTime: poll.votingEndsAt.toTimeString().slice(0, 5),
      orderingDate: poll.orderingEndsAt?.toISOString().split("T")[0] || "",
      orderingTime: poll.orderingEndsAt?.toTimeString().slice(0, 5) || "",
    });
    setIsEditing(false);
  };

  const addRestaurantOption = () => {
    setFormData({
      ...formData,
      restaurantOptions: [...formData.restaurantOptions, { name: "", url: "" }],
    });
  };

  const removeRestaurantOption = (index: number) => {
    setFormData({
      ...formData,
      restaurantOptions: formData.restaurantOptions.filter(
        (_, i) => i !== index,
      ),
    });
  };

  const updateRestaurantOption = (
    index: number,
    field: "name" | "url",
    value: string,
  ) => {
    const updated = [...formData.restaurantOptions];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({
      ...formData,
      restaurantOptions: updated,
    });
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Edytuj głosowanie
        </Button>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edytuj głosowanie</DialogTitle>
            <DialogDescription>
              Możesz edytować szczegóły tego głosowania nawet gdy jest aktywne.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Tytuł głosowania</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="np. Lunch na piątek"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Opis (opcjonalny)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Dodaj opis głosowania..."
                rows={3}
              />
            </div>

            {/* Restaurant Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Opcje restauracji</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addRestaurantOption}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Dodaj opcję
                </Button>
              </div>

              <div className="space-y-3">
                {formData.restaurantOptions.map((option, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-4 border rounded-lg bg-slate-50"
                  >
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Input
                            placeholder="Nazwa restauracji"
                            value={option.name}
                            onChange={(e) =>
                              updateRestaurantOption(
                                index,
                                "name",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeRestaurantOption(index)}
                          disabled={formData.restaurantOptions.length <= 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        <LinkIcon className="w-4 h-4 text-slate-500" />
                        <Input
                          placeholder="Link do restauracji (opcjonalny)"
                          value={option.url || ""}
                          onChange={(e) =>
                            updateRestaurantOption(index, "url", e.target.value)
                          }
                          type="url"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Voting End Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="votingDate">Data zakończenia głosowania</Label>
                <Input
                  id="votingDate"
                  type="date"
                  value={formData.votingDate}
                  onChange={(e) =>
                    setFormData({ ...formData, votingDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="votingTime">Godzina zakończenia</Label>
                <Input
                  id="votingTime"
                  type="time"
                  value={formData.votingTime}
                  onChange={(e) =>
                    setFormData({ ...formData, votingTime: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Ordering End Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="orderingDate">Data zakończenia zamówień</Label>
                <Input
                  id="orderingDate"
                  type="date"
                  value={formData.orderingDate}
                  onChange={(e) =>
                    setFormData({ ...formData, orderingDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orderingTime">
                  Godzina zakończenia zamówień
                </Label>
                <Input
                  id="orderingTime"
                  type="time"
                  value={formData.orderingTime}
                  onChange={(e) =>
                    setFormData({ ...formData, orderingTime: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Anuluj
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent"
                />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Zapisz zmiany
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
