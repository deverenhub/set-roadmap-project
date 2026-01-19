// src/stores/facilityStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Facility, FacilityRole } from '@/types';

export interface FacilityMembership {
  facility: Facility;
  role: FacilityRole;
  isPrimary: boolean;
}

interface FacilityState {
  // Current facility selection
  currentFacility: Facility | null;
  currentFacilityId: string | null;

  // User's facility memberships
  facilities: FacilityMembership[];

  // Loading state
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  setCurrentFacility: (facility: Facility | null) => void;
  setCurrentFacilityById: (facilityId: string | null) => void;
  setFacilities: (facilities: FacilityMembership[]) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;

  // Helpers
  getCurrentFacilityRole: () => FacilityRole | null;
  hasFacilityAccess: (facilityId: string) => boolean;
  canEditInFacility: (facilityId?: string) => boolean;

  // Reset
  reset: () => void;
}

const initialState = {
  currentFacility: null,
  currentFacilityId: null,
  facilities: [],
  isLoading: false,
  isInitialized: false,
};

export const useFacilityStore = create<FacilityState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrentFacility: (facility) =>
        set({
          currentFacility: facility,
          currentFacilityId: facility?.id ?? null,
        }),

      setCurrentFacilityById: (facilityId) => {
        const { facilities } = get();
        const membership = facilities.find((m) => m.facility.id === facilityId);
        set({
          currentFacility: membership?.facility ?? null,
          currentFacilityId: facilityId,
        });
      },

      setFacilities: (facilities) => {
        const { currentFacilityId } = get();

        // If no current facility, select the primary one or the first one
        let newCurrentFacility: Facility | null = null;
        let newCurrentFacilityId: string | null = null;

        if (facilities.length > 0) {
          // Check if current selection is still valid
          const currentMembership = facilities.find(
            (m) => m.facility.id === currentFacilityId
          );

          if (currentMembership) {
            newCurrentFacility = currentMembership.facility;
            newCurrentFacilityId = currentMembership.facility.id;
          } else {
            // Find primary or use first
            const primary = facilities.find((m) => m.isPrimary);
            const selected = primary || facilities[0];
            newCurrentFacility = selected.facility;
            newCurrentFacilityId = selected.facility.id;
          }
        }

        set({
          facilities,
          currentFacility: newCurrentFacility,
          currentFacilityId: newCurrentFacilityId,
        });
      },

      setLoading: (isLoading) => set({ isLoading }),

      setInitialized: (isInitialized) => set({ isInitialized }),

      getCurrentFacilityRole: () => {
        const { currentFacilityId, facilities } = get();
        if (!currentFacilityId) return null;
        const membership = facilities.find(
          (m) => m.facility.id === currentFacilityId
        );
        return membership?.role ?? null;
      },

      hasFacilityAccess: (facilityId) => {
        const { facilities } = get();
        return facilities.some((m) => m.facility.id === facilityId);
      },

      canEditInFacility: (facilityId) => {
        const { currentFacilityId, facilities } = get();
        const targetId = facilityId ?? currentFacilityId;
        if (!targetId) return false;

        const membership = facilities.find((m) => m.facility.id === targetId);
        if (!membership) return false;

        return membership.role === 'editor' || membership.role === 'facility_admin';
      },

      reset: () => set(initialState),
    }),
    {
      name: 'set-roadmap-facility',
      // Only persist the currentFacilityId, not the full facility data
      // Full data will be fetched on initialization
      partialize: (state) => ({
        currentFacilityId: state.currentFacilityId,
      }),
    }
  )
);

// Selector hooks for optimized re-renders
export const useCurrentFacility = () =>
  useFacilityStore((state) => state.currentFacility);

export const useCurrentFacilityId = () =>
  useFacilityStore((state) => state.currentFacilityId);

export const useFacilities = () =>
  useFacilityStore((state) => state.facilities);

export const useFacilityLoading = () =>
  useFacilityStore((state) => state.isLoading);

export const useCanEditInCurrentFacility = () => {
  const canEditInFacility = useFacilityStore((state) => state.canEditInFacility);
  return canEditInFacility();
};
