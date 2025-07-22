"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Trash2,
  Calendar,
  Clock,
  FileText,
  Link as LinkIcon,
} from "lucide-react";
import { createPoll } from "@/lib/firestore";
import { useAuthContext } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { PollTemplate } from "@/types";
import { getActivePollTemplates } from "@/lib/admin-settings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const pollSchema = z.object({
  title: z.string().min(1, "Tytuł jest wymagany"),
  description: z.string().optional(),
  restaurants: z
    .array(
      z.object({
        name: z.string().min(1, "Nazwa restauracji jest wymagana"),
        url: z.string().optional(),
      }),
    )
    .min(2, "Wymagane są co najmniej 2 restauracje"),
  votingDate: z.string().min(1, "Data głosowania jest wymagana"),
  votingTime: z.string().min(1, "Godzina zakończenia głosowania jest wymagana"),
  orderingTime: z.string().min(1, "Godzina zakończenia zamówień jest wymagana"),
});

type PollFormData = z.infer<typeof pollSchema>;

interface CreatePollDialogProps {
  onPollCreated?: () => void;
}

export default function CreatePollDialog({
  onPollCreated,
}: CreatePollDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<PollTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const { user } = useAuthContext();
  const router = useRouter();

  // Funkcja do uzyskania dzisiejszej daty w formacie YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Funkcja do uzyskania minimalnej godziny (obecna + 1 godzina jeśli to dzisiaj)
  const getMinTime = (selectedDate: string) => {
    const today = getTodayDate();
    if (selectedDate === today) {
      const now = new Date();
      now.setHours(now.getHours() + 1); // Minimum 1 godzina od teraz
      return now.toTimeString().slice(0, 5); // HH:MM format
    }
    return "00:00";
  };

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<PollFormData>({
    resolver: zodResolver(pollSchema),
    defaultValues: {
      title: "",
      description: "",
      restaurants: [
        { name: "", url: "" },
        { name: "", url: "" },
      ],
      votingDate: getTodayDate(),
      votingTime: "",
      orderingTime: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "restaurants",
  });

  const watchedVotingDate = watch("votingDate");
  const watchedVotingTime = watch("votingTime");

  // Automatyczne ustawienie minimalnej godziny zakończenia zamówień
  useEffect(() => {
    if (watchedVotingTime) {
      const [hours, minutes] = watchedVotingTime.split(":");
      const votingEndTime = new Date();
      votingEndTime.setHours(parseInt(hours), parseInt(minutes));

      // Dodaj 30 minut do czasu zakończenia głosowania
      votingEndTime.setMinutes(votingEndTime.getMinutes() + 30);

      const orderingTime = votingEndTime.toTimeString().slice(0, 5);
      setValue("orderingTime", orderingTime);
    }
  }, [watchedVotingTime, setValue]);

  // Wczytaj szablony przy otwieraniu dialogu
  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open]);

  const loadTemplates = async () => {
    try {
      const activeTemplates = await getActivePollTemplates();
      setTemplates(activeTemplates);
    } catch (error) {
      console.error("Error loading templates:", error);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);

    if (templateId === "") {
      // Reset to default values
      reset({
        title: "",
        description: "",
        restaurants: [
          { name: "", url: "" },
          { name: "", url: "" },
        ],
        votingDate: getTodayDate(),
        votingTime: "",
        orderingTime: "",
      });
      return;
    }

    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    // Calculate end times based on template duration
    const now = new Date();
    const votingEndTime = new Date(
      now.getTime() + template.votingDurationHours * 60 * 60 * 1000,
    );
    const orderingEndTime = new Date(
      votingEndTime.getTime() +
        (template.orderingDurationHours || 0) * 60 * 60 * 1000,
    );

    // Apply template values
    setValue("title", template.name);
    setValue(
      "restaurants",
      template.restaurantOptions.map((name) => ({ name, url: "" })),
    );
    setValue("votingDate", votingEndTime.toISOString().split("T")[0]);
    setValue("votingTime", votingEndTime.toTimeString().slice(0, 5));
    setValue("orderingTime", orderingEndTime.toTimeString().slice(0, 5));
  };

  const onSubmit = async (data: PollFormData) => {
    if (!user?.uid) return;

    setIsLoading(true);
    try {
      // Tworzenie obiektów Date z wybranych dat i godzin
      const votingEndsAt = new Date(`${data.votingDate}T${data.votingTime}`);
      const orderingEndsAt = new Date(
        `${data.votingDate}T${data.orderingTime}`,
      );

      const pollId = await createPoll({
        title: data.title,
        description: data.description || "",
        restaurantOptions: data.restaurants.map((r) => ({
          name: r.name,
          ...(r.url && r.url.trim() ? { url: r.url.trim() } : {}),
        })),
        createdBy: user.uid,
        votingEndsAt: votingEndsAt,
        orderingEndsAt: orderingEndsAt,
        closed: false,
        selectedRestaurant: null,
      });

      setOpen(false);
      setSelectedTemplate("");
      reset();

      // Wywołaj callback aby odświeżyć listę głosowań
      if (onPollCreated) {
        onPollCreated();
      }

      router.refresh();
    } catch (error) {
      console.error("Error creating poll:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Utwórz głosowanie
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Utwórz nowe głosowanie</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Template Selection */}
          {templates.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="template">Użyj szablonu (opcjonalne)</Label>
              <Select
                value={selectedTemplate}
                onValueChange={handleTemplateSelect}
              >
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <SelectValue placeholder="Wybierz szablon lub utwórz od zera" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Utwórz od zera
                    </div>
                  </SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-xs text-slate-500">
                            {template.restaurantOptions.length} restauracji,
                            {template.votingDurationHours}h głosowania
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Tytuł głosowania</Label>
            <Input
              id="title"
              placeholder="np. Lunch na piątek"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Opis głosowania (opcjonalny)</Label>
            <Textarea
              id="description"
              placeholder="Dodaj opis lub szczegóły dotyczące głosowania..."
              rows={3}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Opcje restauracji</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: "", url: "" })}
              >
                <Plus className="w-4 h-4 mr-1" />
                Dodaj restaurację
              </Button>
            </div>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 border rounded-lg space-y-2 bg-slate-50"
              >
                <div className="flex gap-2">
                  <Input
                    placeholder={`Restauracja ${index + 1}`}
                    {...register(`restaurants.${index}.name`)}
                  />
                  {fields.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-slate-500" />
                  <Input
                    placeholder="Link do menu/strony restauracji (opcjonalny)"
                    type="url"
                    {...register(`restaurants.${index}.url`)}
                  />
                </div>
                {errors.restaurants?.[index]?.name && (
                  <p className="text-sm text-red-600">
                    {errors.restaurants?.[index]?.name?.message}
                  </p>
                )}
              </div>
            ))}

            {errors.restaurants && (
              <p className="text-sm text-red-600">
                {errors.restaurants.message}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="votingDate" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data głosowania
              </Label>
              <Input
                id="votingDate"
                type="date"
                min={getTodayDate()}
                {...register("votingDate")}
              />
              {errors.votingDate && (
                <p className="text-sm text-red-600">
                  {errors.votingDate.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="votingTime" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Głosowanie kończy się o
                </Label>
                <Input
                  id="votingTime"
                  type="time"
                  min={
                    watchedVotingDate === getTodayDate()
                      ? getMinTime(watchedVotingDate)
                      : "00:00"
                  }
                  {...register("votingTime")}
                />
                {errors.votingTime && (
                  <p className="text-sm text-red-600">
                    {errors.votingTime.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="orderingTime"
                  className="flex items-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  Zamówienia kończą się o
                </Label>
                <div className="space-y-1">
                  <Input
                    id="orderingTime"
                    type="time"
                    min={watchedVotingTime || "00:00"}
                    {...register("orderingTime")}
                  />
                </div>
                {errors.orderingTime && (
                  <p className="text-sm text-red-600">
                    {errors.orderingTime.message}
                  </p>
                )}
              </div>
            </div>

            <div className="p-3 text-xs rounded-lg text-slate-500 bg-blue-50">
              <strong>Informacja:</strong> Zamówienia automatycznie kończą się
              30 minut po zakończeniu głosowania. Możesz dostosować ten czas
              według potrzeb.
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              {isLoading ? "Tworzenie..." : "Utwórz głosowanie"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
