// src/providers/FacilityProvider.tsx
import { useEffect, ReactNode } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useFacilityStore } from '@/stores/facilityStore';
import { useUserFacilities, useFacilityByCode } from '@/hooks/useFacilities';
import { FullPageLoader } from '@/components/shared/LoadingSpinner';

interface FacilityProviderProps {
  children: ReactNode;
}

export function FacilityProvider({ children }: FacilityProviderProps) {
  const { facilityCode } = useParams<{ facilityCode?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    currentFacility,
    currentFacilityId,
    setFacilities,
    setCurrentFacility,
    setLoading,
    setInitialized,
    isInitialized,
    isLoading: storeLoading,
  } = useFacilityStore();

  // Fetch user's facilities
  const {
    data: memberships,
    isLoading: isFetchingFacilities,
    isSuccess,
  } = useUserFacilities();

  // Fetch facility by code if provided in URL
  const { data: urlFacility, isLoading: isFetchingUrlFacility } = useFacilityByCode(
    facilityCode || null
  );

  // Initialize facilities in store
  useEffect(() => {
    setLoading(isFetchingFacilities);
  }, [isFetchingFacilities, setLoading]);

  useEffect(() => {
    if (isSuccess && memberships && !isInitialized) {
      setFacilities(memberships);
      setInitialized(true);
    }
  }, [isSuccess, memberships, isInitialized, setFacilities, setInitialized]);

  // Handle URL-based facility selection
  useEffect(() => {
    if (!isInitialized || !memberships) return;

    // If facilityCode is in URL, try to select that facility
    if (facilityCode && urlFacility) {
      // Check if user has access to this facility
      const hasAccess = memberships.some(
        (m) => m.facility.code === facilityCode.toUpperCase()
      );

      if (hasAccess) {
        if (currentFacility?.code !== facilityCode.toUpperCase()) {
          setCurrentFacility(urlFacility);
        }
      } else {
        // User doesn't have access, redirect to default
        const primaryFacility = memberships.find((m) => m.isPrimary)?.facility ||
          memberships[0]?.facility;
        if (primaryFacility) {
          const newPath = location.pathname.replace(
            `/f/${facilityCode}`,
            `/f/${primaryFacility.code.toLowerCase()}`
          );
          navigate(newPath, { replace: true });
        }
      }
    }
  }, [
    facilityCode,
    urlFacility,
    isInitialized,
    memberships,
    currentFacility,
    setCurrentFacility,
    navigate,
    location.pathname,
  ]);

  // Show loader while initializing
  if (isFetchingFacilities || (facilityCode && isFetchingUrlFacility)) {
    return <FullPageLoader text="Loading facilities..." />;
  }

  return <>{children}</>;
}

// Hook to get facility-scoped path
export function useFacilityPath() {
  const { currentFacility } = useFacilityStore();

  const getFacilityPath = (path: string) => {
    if (!currentFacility) return path;
    // For now, we'll keep paths simple without facility prefix
    // This can be enabled later if needed
    return path;
  };

  return { getFacilityPath, currentFacilityCode: currentFacility?.code };
}

// Hook to check if current user can edit in current facility
export function useFacilityPermissions() {
  const { canEditInFacility, getCurrentFacilityRole } = useFacilityStore();

  return {
    canEdit: canEditInFacility(),
    role: getCurrentFacilityRole(),
  };
}
