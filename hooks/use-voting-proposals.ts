import { useState, useEffect } from "react";
import { VotingOptionProposal } from "@/types";
import {
  subscribeToVotingProposals,
  createVotingProposal,
  updateVotingProposal,
  deleteVotingProposal,
  approveVotingProposal,
} from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";

interface UseVotingProposalsProps {
  pollId: string;
  userId?: string;
  userName?: string;
  userRole?: "admin" | "user";
}

export function useVotingProposals({
  pollId,
  userId,
  userName,
  userRole,
}: UseVotingProposalsProps) {
  const [proposals, setProposals] = useState<VotingOptionProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!pollId) return;

    const unsubscribe = subscribeToVotingProposals(pollId, (proposalsData) => {
      setProposals(proposalsData);
      setLoading(false);
    });

    return unsubscribe;
  }, [pollId]);

  const submitProposal = async (restaurantName: string) => {
    if (!userId || !userName || !restaurantName.trim()) return;

    setSubmitting(true);
    try {
      await createVotingProposal(pollId, {
        pollId,
        restaurantName: restaurantName.trim(),
        proposedBy: userId,
        proposedByName: userName,
        status: "pending",
      });

      toast({
        title: "Propozycja wysłana",
        description:
          "Twoja propozycja restauracji została wysłana do administratora.",
      });
    } catch (error) {
      console.error("Error submitting proposal:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się wysłać propozycji. Spróbuj ponownie.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const approveProposal = async (
    proposal: VotingOptionProposal,
    adminNotes?: string,
  ) => {
    if (!userId || !userName || userRole !== "admin") return;

    try {
      await approveVotingProposal(
        pollId,
        proposal.id,
        proposal.restaurantName,
        userId,
        userName,
      );

      if (adminNotes) {
        await updateVotingProposal(pollId, proposal.id, {
          adminNotes,
        });
      }

      toast({
        title: "Propozycja zatwierdzona",
        description: `Restauracja "${proposal.restaurantName}" została dodana do opcji głosowania.`,
      });
    } catch (error) {
      console.error("Error approving proposal:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się zatwierdzić propozycji.",
        variant: "destructive",
      });
    }
  };

  const rejectProposal = async (
    proposal: VotingOptionProposal,
    adminNotes?: string,
  ) => {
    if (!userId || !userName || userRole !== "admin") return;

    try {
      await updateVotingProposal(pollId, proposal.id, {
        status: "rejected",
        reviewedAt: new Date(),
        reviewedBy: userId,
        reviewedByName: userName,
        adminNotes,
      });

      toast({
        title: "Propozycja odrzucona",
        description: `Propozycja restauracji "${proposal.restaurantName}" została odrzucona.`,
      });
    } catch (error) {
      console.error("Error rejecting proposal:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się odrzucić propozycji.",
        variant: "destructive",
      });
    }
  };

  const deleteProposal = async (proposalId: string) => {
    try {
      await deleteVotingProposal(pollId, proposalId);
      toast({
        title: "Propozycja usunięta",
        description: "Propozycja została usunięta.",
      });
    } catch (error) {
      console.error("Error deleting proposal:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć propozycji.",
        variant: "destructive",
      });
    }
  };

  const userProposals = proposals.filter((p) => p.proposedBy === userId);
  const pendingProposals = proposals.filter((p) => p.status === "pending");
  const approvedProposals = proposals.filter((p) => p.status === "approved");
  const rejectedProposals = proposals.filter((p) => p.status === "rejected");

  return {
    proposals,
    userProposals,
    pendingProposals,
    approvedProposals,
    rejectedProposals,
    loading,
    submitting,
    submitProposal,
    approveProposal,
    rejectProposal,
    deleteProposal,
  };
}
