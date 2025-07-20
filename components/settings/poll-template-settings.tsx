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
import { Plus, Edit, Trash2, Clock, MapPin, Save, X } from "lucide-react";
import { PollTemplate } from "@/types";
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
    restaurantOptions: "",
    votingDurationHours: 2,
    orderingDurationHours: 1,
    isActive: true,
  });
  const { toast } = useToast();
  const { user } = useAuthContext();

  const loadTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      const templatesData = await getPollTemplates();
      setTemplates(templatesData);
    } catch (error) {
      console.error("Error loading templates:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się załadować szablonów.",
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
        restaurantOptions: template.restaurantOptions.join("\n"),
        votingDurationHours: template.votingDurationHours,
        orderingDurationHours: template.orderingDurationHours || 1,
        isActive: template.isActive,
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        name: "",
        restaurantOptions: "",
        votingDurationHours: 2,
        orderingDurationHours: 1,
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTemplate(null);
  };

  const handleSaveTemplate = async () => {
    if (!user) return;

    try {
      const restaurantOptions = formData.restaurantOptions
        .split("\n")
        .map((option) => option.trim())
        .filter((option) => option.length > 0);

      if (!formData.name.trim() || restaurantOptions.length === 0) {
        toast({
          title: "Błąd",
          description: "Nazwa szablonu i lista restauracji są wymagane.",
          variant: "destructive",
        });
        return;
      }

      if (editingTemplate) {
        await updatePollTemplate(editingTemplate.id, {
          name: formData.name.trim(),
          restaurantOptions,
          votingDurationHours: formData.votingDurationHours,
          orderingDurationHours: formData.orderingDurationHours,
          isActive: formData.isActive,
        });
      } else {
        await createPollTemplate({
          name: formData.name.trim(),
          restaurantOptions,
          votingDurationHours: formData.votingDurationHours,
          orderingDurationHours: formData.orderingDurationHours,
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

  const handleDeleteTemplate = async (template: PollTemplate) => {
    if (!confirm(`Czy na pewno chcesz usunąć szablon "${template.name}"?`)) {
      return;
    }

    try {
      await deletePollTemplate(template.id);

      toast({
        title: "Sukces",
        description: "Szablon został usunięty",
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
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Szablony głosowań</h3>
          <p className="text-sm text-slate-600">
            Utwórz szablony z predefiniowanymi restauracjami, które można szybko
            użyć przy tworzeniu nowych głosowań.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="w-4 h-4" />
          Dodaj szablon
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
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
                <TableHead>Restauracje</TableHead>
                <TableHead>Czas głosowania</TableHead>
                <TableHead>Czas zamówień</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {template.restaurantOptions
                        .slice(0, 3)
                        .map((restaurant, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {restaurant}
                          </Badge>
                        ))}
                      {template.restaurantOptions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.restaurantOptions.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {template.votingDurationHours}h
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {template.orderingDurationHours || 0}h
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
                        onClick={() => handleDeleteTemplate(template)}
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

      {/* Dialog for creating/editing templates */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edytuj szablon" : "Nowy szablon"}
            </DialogTitle>
            <DialogDescription>
              {editingTemplate
                ? "Zaktualizuj istniejący szablon głosowania"
                : "Utwórz nowy szablon głosowania z predefiniowanymi restauracjami"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nazwa szablonu</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="np. Obiad w centrum"
              />
            </div>

            <div>
              <Label htmlFor="restaurants">Restauracje (jedna na linię)</Label>
              <Textarea
                id="restaurants"
                value={formData.restaurantOptions}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    restaurantOptions: e.target.value,
                  })
                }
                placeholder="McDonald's&#10;KFC&#10;Subway&#10;Pizza Hut"
                rows={6}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="votingHours">Czas głosowania (godz.)</Label>
                <Input
                  id="votingHours"
                  type="number"
                  min="1"
                  max="24"
                  value={formData.votingDurationHours}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      votingDurationHours: parseInt(e.target.value) || 2,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="orderingHours">Czas zamówień (godz.)</Label>
                <Input
                  id="orderingHours"
                  type="number"
                  min="0"
                  max="24"
                  value={formData.orderingDurationHours}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      orderingDurationHours: parseInt(e.target.value) || 1,
                    })
                  }
                />
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
