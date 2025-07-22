"use client";

import { Button } from "@/components/ui/button";
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
import { X } from "lucide-react";

interface AdminControlsProps {
  isAdmin: boolean;
  orderingEnded: boolean;
  onCloseOrdering: () => void;
}

export function AdminControls({
  isAdmin,
  orderingEnded,
  onCloseOrdering,
}: AdminControlsProps) {
  if (!isAdmin || orderingEnded) {
    return null;
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-red-700 border-red-200 hover:bg-red-50"
        >
          <X className="w-4 h-4 mr-1" />
          Zakończ zamówienia
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Zakończyć składanie zamówień?</AlertDialogTitle>
          <AlertDialogDescription>
            Ta akcja natychmiast zakończy możliwość składania nowych zamówień.
            Użytkownicy nie będą mogli już dodawać swoich zamówień do tego
            głosowania. Czy na pewno chcesz kontynuować?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Anuluj</AlertDialogCancel>
          <AlertDialogAction
            onClick={onCloseOrdering}
            className="bg-red-600 hover:bg-red-700"
          >
            Tak, zakończ zamówienia
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
