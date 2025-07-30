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
  Info,
  MapPin,
  Users,
  CheckCircle2,
  AlertTriangle,
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const pollSchema = z.object({
  title: z.string().min(1, "Tytuł jest wymagany"),
  description: z.string().optional(),
  restaurants: z
    .array(
      z.object({
        name: z.string().min(1, "Nazwa restauracji jest wymagana"),
        url: z.string().optional(),
      })
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
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    "create-from-scratch"
  );
  const { user } = useAuthContext();
  const router = useRouter();

  // Debug templates state
  useEffect(() => {
    console.log(
      "Templates state changed:",
      templates,
      "Length:",
      templates.length
    );
  }, [templates]);

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
      // now.setHours(now.getHours() + 1); // Minimum 1 godzina od teraz
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
    console.log("Dialog opened:", open);
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

    if (templateId === "create-from-scratch" || templateId === "no-templates") {
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

    // Apply template values
    setValue("title", template.title);
    setValue("description", template.description || "");
    setValue("restaurants", template.restaurants);
  };

  const onSubmit = async (data: PollFormData) => {
    if (!user?.uid) return;

    setIsLoading(true);
    try {
      // Tworzenie obiektów Date z wybranych dat i godzin
      const votingEndsAt = new Date(`${data.votingDate}T${data.votingTime}`);
      const orderingEndsAt = new Date(
        `${data.votingDate}T${data.orderingTime}`
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
        <Button className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
          <Plus className="w-4 h-4 mr-2" />
          Utwórz głosowanie
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px] lg:max-w-[800px] p-0">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b px-6 py-4 z-10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              Utwórz nowe głosowanie
            </DialogTitle>
            <p className="text-sm text-slate-600 mt-2">
              Wypełnij formularz poniżej, aby utworzyć nowe głosowanie na
              restaurację
            </p>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
          <TooltipProvider>
            {/* Sekcja szablonów */}
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Szablon głosowania
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Wybierz szablon aby szybko wypełnić formularz</p>
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
                <CardDescription>
                  Użyj gotowego szablonu lub utwórz głosowanie od zera
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={selectedTemplate}
                  onValueChange={handleTemplateSelect}
                >
                  <SelectTrigger className="w-full">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 flex-shrink-0 text-blue-600" />
                      <SelectValue placeholder="Wybierz szablon lub utwórz od zera" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="create-from-scratch">
                      <div className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Utwórz od zera
                      </div>
                    </SelectItem>
                    {templates.length === 0 ? (
                      <SelectItem value="no-templates" disabled>
                        <div className="flex items-center gap-2 text-slate-400">
                          <FileText className="w-4 h-4" />
                          Brak dostępnych szablonów
                        </div>
                      </SelectItem>
                    ) : (
                      templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="font-medium truncate">
                                {template.name}
                              </div>
                              <div className="text-xs text-slate-500 truncate">
                                {template.restaurants.length} restauracji
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {templates.length === 0 && (
                  <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-700">
                        Brak szablonów w systemie. Administrator może utworzyć
                        szablony w ustawieniach ogólnych.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sekcja podstawowych informacji */}
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-600" />
                  Podstawowe informacje
                </CardTitle>
                <CardDescription>
                  Nadaj tytuł i opis swojemu głosowaniu
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Tytuł głosowania <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="np. Lunch na piątek 31 stycznia"
                    className={`transition-all duration-200 ${
                      errors.title
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : "focus:border-green-500 focus:ring-green-200"
                    }`}
                    {...register("title")}
                  />
                  {errors.title && (
                    <div className="flex items-center gap-1 text-sm text-red-600">
                      <AlertTriangle className="w-3 h-3" />
                      {errors.title.message}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Opis głosowania
                    <span className="text-slate-400 font-normal ml-1">
                      (opcjonalny)
                    </span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Dodaj opis lub szczegóły dotyczące głosowania, np. budżet, preferencje dietetyczne..."
                    rows={3}
                    className="resize-none focus:border-green-500 focus:ring-green-200 transition-all duration-200"
                    {...register("description")}
                  />
                  {errors.description && (
                    <div className="flex items-center gap-1 text-sm text-red-600">
                      <AlertTriangle className="w-3 h-3" />
                      {errors.description.message}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sekcja restauracji */}
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-orange-600" />
                      Opcje restauracji
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-slate-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Dodaj minimum 2 restauracje do wyboru</p>
                        </TooltipContent>
                      </Tooltip>
                    </CardTitle>
                    <CardDescription>
                      Minimum 2 opcje są wymagane do utworzenia głosowania
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto border-orange-200 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
                    onClick={() => append({ name: "", url: "" })}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Dodaj restaurację
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="space-y-3 p-4 border border-slate-200 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100/50 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mt-1">
                        <span className="text-sm font-medium text-orange-700">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Input
                            placeholder={`Nazwa restauracji ${index + 1}`}
                            className={`flex-1 transition-all duration-200 ${
                              errors.restaurants?.[index]?.name
                                ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                                : "focus:border-orange-500 focus:ring-orange-200"
                            }`}
                            {...register(`restaurants.${index}.name`)}
                          />
                          {fields.length > 2 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto border-red-200 hover:bg-red-50 hover:border-red-300 text-red-600 hover:text-red-700 transition-all duration-200"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="w-4 h-4 sm:mr-0 mr-2" />
                              <span className="sm:hidden">
                                Usuń restaurację
                              </span>
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <LinkIcon className="w-4 h-4 text-slate-500 flex-shrink-0" />
                          <Input
                            placeholder="Link do menu/strony restauracji (opcjonalny)"
                            type="url"
                            className="focus:border-orange-500 focus:ring-orange-200 transition-all duration-200"
                            {...register(`restaurants.${index}.url`)}
                          />
                        </div>
                        {errors.restaurants?.[index]?.name && (
                          <div className="flex items-center gap-1 text-sm text-red-600">
                            <AlertTriangle className="w-3 h-3" />
                            {errors.restaurants?.[index]?.name?.message}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {errors.restaurants && (
                  <div className="flex items-center gap-1 text-sm text-red-600 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {errors.restaurants.message}
                  </div>
                )}

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-700">
                      <p className="font-medium">Wskazówka:</p>
                      <p>
                        Dodaj linki do menu restauracji, aby ułatwić innym
                        podejmowanie decyzji
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sekcja czasowa */}
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  Harmonogram głosowania
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ustaw kiedy kończy się głosowanie i zamówienia</p>
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
                <CardDescription>
                  Określ datę i godziny zakończenia głosowania oraz zamówień
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="votingDate"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4 text-purple-600" />
                    Data głosowania <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="votingDate"
                    type="date"
                    min={getTodayDate()}
                    className={`transition-all duration-200 ${
                      errors.votingDate
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : "focus:border-purple-500 focus:ring-purple-200"
                    }`}
                    {...register("votingDate")}
                  />
                  {errors.votingDate && (
                    <div className="flex items-center gap-1 text-sm text-red-600">
                      <AlertTriangle className="w-3 h-3" />
                      {errors.votingDate.message}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="votingTime"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <Clock className="w-4 h-4 text-purple-600" />
                      Głosowanie kończy się o{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="votingTime"
                      type="time"
                      min={
                        watchedVotingDate === getTodayDate()
                          ? getMinTime(watchedVotingDate)
                          : "00:00"
                      }
                      className={`transition-all duration-200 ${
                        errors.votingTime
                          ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                          : "focus:border-purple-500 focus:ring-purple-200"
                      }`}
                      {...register("votingTime")}
                    />
                    {errors.votingTime && (
                      <div className="flex items-center gap-1 text-sm text-red-600">
                        <AlertTriangle className="w-3 h-3" />
                        {errors.votingTime.message}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="orderingTime"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <Clock className="w-4 h-4 text-purple-600" />
                      Zamówienia kończą się o{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="orderingTime"
                      type="time"
                      min={watchedVotingTime || "00:00"}
                      className={`transition-all duration-200 ${
                        errors.orderingTime
                          ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                          : "focus:border-purple-500 focus:ring-purple-200"
                      }`}
                      {...register("orderingTime")}
                    />
                    {errors.orderingTime && (
                      <div className="flex items-center gap-1 text-sm text-red-600">
                        <AlertTriangle className="w-3 h-3" />
                        {errors.orderingTime.message}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-purple-700">
                      <p className="font-medium">Automatyczne ustawienie:</p>
                      <p>
                        Zamówienia automatycznie kończą się 30 minut po
                        zakończeniu głosowania. Możesz dostosować ten czas
                        według potrzeb.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TooltipProvider>

          {/* Przyciski akcji */}
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t pt-6 -mx-6 px-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1 order-2 sm:order-1 h-11"
              >
                Anuluj
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 order-1 sm:order-2 h-11 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Tworzenie...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Utwórz głosowanie
                  </div>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
