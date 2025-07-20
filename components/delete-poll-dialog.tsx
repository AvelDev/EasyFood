"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deletePoll } from "@/lib/firestore";
import { Poll } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface DeletePollDialogProps {
  poll: Poll;
  onPollDeleted?: () => void;
  className?: string;
}

export default function DeletePollDialog({
  poll,
  onPollDeleted,
  className = "",
}: DeletePollDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePoll(poll.id);
      toast({
        title: "Głosowanie usunięte",
        description: `Głosowanie "${poll.title}" zostało pomyślnie usunięte.`,
        variant: "default",
      });
      onPollDeleted?.();
    } catch (error) {
      console.error("Error deleting poll:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć głosowania. Spróbuj ponownie.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          className={className}
          disabled={isDeleting}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Czy na pewno chcesz usunąć to głosowanie?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Ta akcja jest nieodwracalna. Głosowanie &quot;{poll.title}&quot;
            zostanie trwale usunięte wraz ze wszystkimi głosami i zamówieniami.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Anuluj</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? "Usuwanie..." : "Usuń głosowanie"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
