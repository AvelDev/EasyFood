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
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="animate-pulse bg-gray-200 h-6 sm:h-7 lg:h-8 w-32 sm:w-40 rounded"></div>
          <div className="animate-pulse bg-gray-200 h-9 sm:h-10 lg:h-11 w-32 sm:w-40 rounded"></div>
        </div>
        <div className="animate-pulse bg-gray-200 h-48 sm:h-64 lg:h-80 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-medium">
          Szablony głosowań
        </h3>
        <Button
          onClick={() => handleOpenDialog()}
          className="w-full sm:w-auto h-10 sm:h-11"
        >
          <Plus className="w-4 h-4 mr-2" />
          Dodaj szablon
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-12 lg:py-16 text-muted-foreground space-y-3 sm:space-y-4">
          <Plus className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto mb-4 opacity-50" />
          <p className="text-base sm:text-lg lg:text-xl">
            Brak szablonów głosowań
          </p>
          <p className="text-sm sm:text-base lg:text-lg">
            Utwórz pierwszy szablon, aby szybko tworzyć głosowania.
          </p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-sm sm:text-base font-medium">
                    Nazwa
                  </TableHead>
                  <TableHead className="text-sm sm:text-base font-medium">
                    Tytuł
                  </TableHead>
                  <TableHead className="text-sm sm:text-base font-medium hidden sm:table-cell">
                    Restauracje
                  </TableHead>
                  <TableHead className="text-sm sm:text-base font-medium">
                    Status
                  </TableHead>
                  <TableHead className="text-sm sm:text-base font-medium">
                    Akcje
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium text-sm sm:text-base">
                      {template.name}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm sm:text-base">
                          {template.title}
                        </div>
                        {template.description && (
                          <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                            {template.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {template.restaurants
                          .slice(0, 3)
                          .map((restaurant, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs sm:text-sm"
                            >
                              {restaurant.name}
                            </Badge>
                          ))}
                        {template.restaurants.length > 3 && (
                          <Badge
                            variant="outline"
                            className="text-xs sm:text-sm"
                          >
                            +{template.restaurants.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={template.isActive ? "default" : "secondary"}
                        className="text-xs sm:text-sm"
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
                          className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                        >
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] lg:max-w-[700px] xl:max-w-[800px] mx-4 sm:mx-0 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-3 sm:space-y-4">
            <DialogTitle className="text-lg sm:text-xl lg:text-2xl">
              {editingTemplate ? "Edytuj szablon" : "Nowy szablon"}
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base lg:text-lg">
              Szablon pozwala na szybkie tworzenie głosowań z predefiniowanymi
              restauracjami.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6 lg:space-y-8 py-4 sm:py-6">
            <div className="space-y-2 sm:space-y-3">
              <Label
                htmlFor="name"
                className="text-sm sm:text-base font-medium"
              >
                Nazwa szablonu
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="np. Lunch w biurze"
                className="text-sm sm:text-base h-10 sm:h-11"
              />
            </div>

            <div className="space-y-2 sm:space-y-3">
              <Label
                htmlFor="title"
                className="text-sm sm:text-base font-medium"
              >
                Tytuł głosowania
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="np. Gdzie zamawiamy lunch?"
                className="text-sm sm:text-base h-10 sm:h-11"
              />
            </div>

            <div className="space-y-2 sm:space-y-3">
              <Label
                htmlFor="description"
                className="text-sm sm:text-base font-medium"
              >
                Opis (opcjonalny)
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Dodatkowe informacje o głosowaniu..."
                rows={3}
                className="text-sm sm:text-base resize-none"
              />
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                <Label className="text-sm sm:text-base font-medium">
                  Restauracje (minimum 2)
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addRestaurant}
                  className="w-full sm:w-auto h-9 sm:h-10"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Dodaj
                </Button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {formData.restaurants.map((restaurant, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start"
                  >
                    <div className="flex-1 w-full sm:w-auto">
                      <Input
                        placeholder="Nazwa restauracji"
                        value={restaurant.name}
                        onChange={(e) =>
                          updateRestaurant(index, "name", e.target.value)
                        }
                        className="text-sm sm:text-base h-10 sm:h-11"
                      />
                    </div>
                    <div className="flex-1 w-full sm:w-auto">
                      <Input
                        placeholder="Link do menu (opcjonalny)"
                        value={restaurant.url || ""}
                        onChange={(e) =>
                          updateRestaurant(index, "url", e.target.value)
                        }
                        className="text-sm sm:text-base h-10 sm:h-11"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeRestaurant(index)}
                      disabled={formData.restaurants.length <= 2}
                      className="w-full sm:w-11 h-10 sm:h-11 p-0 sm:px-0"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="sm:hidden ml-2">Usuń</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg bg-slate-50">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <Label
                htmlFor="isActive"
                className="text-sm sm:text-base font-medium cursor-pointer"
              >
                Szablon aktywny
              </Label>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3 sm:gap-2 pt-4 sm:pt-6">
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              className="w-full sm:w-auto h-10 sm:h-11"
            >
              <X className="w-4 h-4 mr-2" />
              Anuluj
            </Button>
            <Button
              onClick={handleSaveTemplate}
              className="w-full sm:w-auto h-10 sm:h-11"
            >
              <Save className="w-4 h-4 mr-2" />
              {editingTemplate ? "Zaktualizuj" : "Utwórz"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
