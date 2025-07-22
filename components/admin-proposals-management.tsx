"use client";

import { useState } from "react";
import { Check, X, MessageSquare, Clock, User, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { VotingOptionProposal } from "@/types";

interface AdminProposalsManagementProps {
  proposals: VotingOptionProposal[];
  onApprove: (proposal: VotingOptionProposal, notes?: string) => Promise<void>;
  onReject: (proposal: VotingOptionProposal, notes?: string) => Promise<void>;
  onDelete: (proposalId: string) => Promise<void>;
}

export default function AdminProposalsManagement({
  proposals,
  onApprove,
  onReject,
  onDelete,
}: AdminProposalsManagementProps) {
  const [selectedProposal, setSelectedProposal] =
    useState<VotingOptionProposal | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | "delete" | null>(
    null,
  );
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  const pendingProposals = proposals.filter((p) => p.status === "pending");
  const reviewedProposals = proposals.filter((p) => p.status !== "pending");

  const handleAction = async () => {
    if (!selectedProposal || !action) return;

    setProcessing(true);
    try {
      switch (action) {
        case "approve":
          await onApprove(selectedProposal, adminNotes);
          break;
        case "reject":
          await onReject(selectedProposal, adminNotes);
          break;
        case "delete":
          await onDelete(selectedProposal.id);
          break;
      }
      closeDialog();
    } catch (error) {
      console.error("Error processing action:", error);
    } finally {
      setProcessing(false);
    }
  };

  const openDialog = (
    proposal: VotingOptionProposal,
    actionType: "approve" | "reject" | "delete",
  ) => {
    setSelectedProposal(proposal);
    setAction(actionType);
    setAdminNotes(proposal.adminNotes || "");
  };

  const closeDialog = () => {
    setSelectedProposal(null);
    setAction(null);
    setAdminNotes("");
  };

  if (proposals.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Pending Proposals */}
      {pendingProposals.length > 0 && (
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              Oczekujące propozycje ({pendingProposals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingProposals.map((proposal, index) => (
                <motion.div
                  key={proposal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 border rounded-lg bg-white/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center mb-2 gap-2">
                      <h4 className="font-medium">{proposal.restaurantName}</h4>
                      <Badge
                        variant="outline"
                        className="text-orange-600 border-orange-200"
                      >
                        Oczekuje
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm gap-2 text-slate-600">
                      <User className="w-4 h-4" />
                      <span>
                        Zaproponowane przez: {proposal.proposedByName}
                      </span>
                      <span>•</span>
                      <span>
                        {proposal.createdAt.toLocaleDateString("pl-PL")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => openDialog(proposal, "approve")}
                      className="text-white bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-1" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => openDialog(proposal, "reject")}
                    >
                      <X className="w-4 h-4 mr-1" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviewed Proposals */}
      {reviewedProposals.length > 0 && (
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Historia propozycji ({reviewedProposals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reviewedProposals.map((proposal, index) => (
                <motion.div
                  key={proposal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 border rounded-lg bg-white/30"
                >
                  <div className="flex-1">
                    <div className="flex items-center mb-1 gap-2">
                      <span className="font-medium">
                        {proposal.restaurantName}
                      </span>
                      <Badge
                        variant={
                          proposal.status === "approved"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {proposal.status === "approved"
                          ? "Zatwierdzona"
                          : "Odrzucona"}
                      </Badge>
                    </div>
                    <div className="text-sm text-slate-600">
                      <div>Zaproponowane przez: {proposal.proposedByName}</div>
                      {proposal.reviewedByName && (
                        <div>
                          {proposal.status === "approved"
                            ? "Zatwierdzone"
                            : "Odrzucone"}{" "}
                          przez: {proposal.reviewedByName} •{" "}
                          {proposal.reviewedAt?.toLocaleDateString("pl-PL")}
                        </div>
                      )}
                      {proposal.adminNotes && (
                        <div className="mt-1 text-xs italic">
                          Uwagi: {proposal.adminNotes}
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openDialog(proposal, "delete")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Dialog */}
      <Dialog
        open={!!selectedProposal && !!action}
        onOpenChange={() => closeDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "approve" && "Zatwierdź propozycję"}
              {action === "reject" && "Odrzuć propozycję"}
              {action === "delete" && "Usuń propozycję"}
            </DialogTitle>
            <DialogDescription>
              {action === "approve" &&
                `Czy chcesz zatwierdzić propozycję restauracji "${selectedProposal?.restaurantName}"? Zostanie ona dodana do opcji głosowania.`}
              {action === "reject" &&
                `Czy chcesz odrzucić propozycję restauracji "${selectedProposal?.restaurantName}"?`}
              {action === "delete" &&
                `Czy na pewno chcesz usunąć propozycję restauracji "${selectedProposal?.restaurantName}"? Ta akcja jest nieodwracalna.`}
            </DialogDescription>
          </DialogHeader>

          {(action === "approve" || action === "reject") && (
            <div className="space-y-2">
              <Label htmlFor="adminNotes">
                Uwagi administratora (opcjonalne)
              </Label>
              <Textarea
                id="adminNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Dodaj uwagi lub uzasadnienie decyzji..."
                rows={3}
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Anuluj
            </Button>
            <Button
              onClick={handleAction}
              disabled={processing}
              variant={
                action === "delete"
                  ? "destructive"
                  : action === "approve"
                    ? "default"
                    : "destructive"
              }
            >
              {processing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent"
                />
              ) : null}
              {action === "approve" && "Zatwierdź"}
              {action === "reject" && "Odrzuć"}
              {action === "delete" && "Usuń"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
