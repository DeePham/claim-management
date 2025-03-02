import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { claimService } from "@/services/claim";

export const useUserClaims = (userId, status) => {
  return useQuery({
    queryKey: ["claims", userId, status],
    queryFn: async () => {
      const claims = await claimService.getUserClaims(userId);
      if (status) {
        return claims.filter(
          (claim) => claim.status.toLowerCase() === status.toLowerCase(),
        );
      }
      return claims;
    },
  });
};

export const useClaims = (allowedStatuses, status) => {
  return useQuery({
    queryKey: ["claims", { allowedStatuses, status }],
    queryFn: async () => {
      const claims = await claimService.getClaims(allowedStatuses);
      if (status) {
        return claims.filter(
          (claim) => claim.status.toLowerCase() === status.toLowerCase(),
        );
      }
      return claims;
    },
  });
};

export const useCreateClaim = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (claimData) => claimService.createClaim(claimData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["claims"] });
    },
  });
};

export const useSaveDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (claimData) => claimService.saveDraft(claimData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["claims"] });
    },
  });
};

export const useUpdateClaimStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => claimService.updateClaimStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["claims"] });
    },
  });
};

export const useUpdateClaim = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => claimService.updateClaim(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["claims"] });
    },
  });
};

export const useDeleteClaim = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => claimService.deleteClaim(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["claims"] });
    },
  });
};
