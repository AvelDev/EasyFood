"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { PollTemplate, RestaurantOption } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAuthContext } from "@/contexts/auth-context";
import {
  createPollTemplate,
  updatePollTemplate,
  deletePollTemplate,
  getPollTemplates,
} from "@/lib/admin-settings";

export function PollTemplateSettings() {
  const [templates, setTemplates] = useState<PollTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PollTemplate | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    description: "",
    restaurants: [
      { name: "", url: "" },
      { name: "", url: "" },
    ] as RestaurantOption[],
    isActive: true,
  });

  const { user } = useAuthContext();
  const { toast } = useToast();

  const loadTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      const templatesData = await getPollTemplates();
      setTemplates(templatesData);
    } catch (error) {
      console.error("Error loading templates:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się wczytać szablonów.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleOpenDialog = (template?: PollTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        title: template.title,
        description: template.description || "",
        restaurants:
          template.restaurants.length > 0
            ? template.restaurants
            : [
                { name: "", url: "" },
                { name: "", url: "" },
              ],
        isActive: template.isActive,
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        name: "",
        title: "",
        description: "",
        restaurants: [
          { name: "", url: "" },
          { name: "", url: "" },
        ],
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTemplate(null);
  };

  const addRestaurant = () => {
    setFormData({
      ...formData,
      restaurants: [...formData.restaurants, { name: "", url: "" }],
    });
  };

  const removeRestaurant = (index: number) => {
    if (formData.restaurants.length > 2) {
      const newRestaurants = formData.restaurants.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        restaurants: newRestaurants,
      });
    }
  };

  const updateRestaurant = (
    index: number,
    field: "name" | "url",
    value: string
  ) => {
    const newRestaurants = [...formData.restaurants];
    newRestaurants[index] = { ...newRestaurants[index], [field]: value };
    setFormData({
      ...formData,
      restaurants: newRestaurants,
    });
  };

  const handleSaveTemplate = async () => {
    if (!user) return;

    try {
      const validRestaurants = formData.restaurants.filter(
        (restaurant) => restaurant.name.trim().length > 0
      );

      if (
        !formData.name.trim() ||
        !formData.title.trim() ||
        validRestaurants.length < 2
      ) {
        toast({
          title: "Błąd",
          description:
            "Nazwa szablonu, tytuł i co najmniej 2 restauracje są wymagane.",
          variant: "destructive",
        });
        return;
      }

      if (editingTemplate) {
        await updatePollTemplate(editingTemplate.id, {
          name: formData.name.trim(),
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          restaurants: validRestaurants,
          isActive: formData.isActive,
        });
      } else {
        await createPollTemplate({
          name: formData.name.trim(),
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          restaurants: validRestaurants,
          isActive: formData.isActive,
          createdBy: user.uid,
        });
      }

      toast({
        title: "Sukces",
        description: editingTemplate
          ? "Szablon został zaktualizowany"
          : "Szablon został utworzony",
      });

      handleCloseDialog();
      loadTemplates();
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się zapisać szablonu.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await deletePollTemplate(templateId);
      toast({
        title: "Sukces",
        description: "Szablon został usunięty.",
      });
      loadTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć szablonu.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="animate-pulse bg-gray-200 h-6 w-32 rounded"></div>
          <div className="animate-pulse bg-gray-200 h-9 w-32 rounded"></div>
        </div>
        <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Szablony głosowań</h3>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Dodaj szablon
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground space-y-2">
          <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Brak szablonów głosowań</p>
          <p className="text-sm">
            Utwórz pierwszy szablon, aby szybko tworzyć głosowania.
          </p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nazwa</TableHead>
                <TableHead>Tytuł</TableHead>
                <TableHead>Restauracje</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{template.title}</div>
                      {template.description && (
                        <div className="text-sm text-muted-foreground">
                          {template.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {template.restaurants
                        .slice(0, 3)
                        .map((restaurant, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {restaurant.name}
                          </Badge>
                        ))}
                      {template.restaurants.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.restaurants.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={template.isActive ? "default" : "secondary"}
                    >
                      {template.isActive ? "Aktywny" : "Nieaktywny"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(template)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edytuj szablon" : "Nowy szablon"}
            </DialogTitle>
            <DialogDescription>
              Szablon pozwala na szybkie tworzenie głosowań z predefiniowanymi
              restauracjami.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Nazwa szablonu</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="np. Lunch w biurze"
              />
            </div>

            <div>
              <Label htmlFor="title">Tytuł głosowania</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="np. Gdzie zamawiamy lunch?"
              />
            </div>

            <div>
              <Label htmlFor="description">Opis (opcjonalny)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Dodatkowe informacje o głosowaniu..."
                rows={3}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Restauracje (minimum 2)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addRestaurant}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Dodaj
                </Button>
              </div>

              <div className="space-y-3">
                {formData.restaurants.map((restaurant, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <Input
                        placeholder="Nazwa restauracji"
                        value={restaurant.name}
                        onChange={(e) =>
                          updateRestaurant(index, "name", e.target.value)
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        placeholder="Link do menu (opcjonalny)"
                        value={restaurant.url || ""}
                        onChange={(e) =>
                          updateRestaurant(index, "url", e.target.value)
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeRestaurant(index)}
                      disabled={formData.restaurants.length <= 2}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <Label htmlFor="isActive">Szablon aktywny</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              <X className="w-4 h-4 mr-2" />
              Anuluj
            </Button>
            <Button onClick={handleSaveTemplate}>
              <Save className="w-4 h-4 mr-2" />
              {editingTemplate ? "Zaktualizuj" : "Utwórz"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
