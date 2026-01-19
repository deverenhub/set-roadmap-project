// src/pages/Facilities.tsx
import { useState } from 'react';
import { Plus, Building2, BarChart3, Settings2, Rocket } from 'lucide-react';
import { useAllFacilities, usePermissions } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { FacilityCard, FacilityCardSkeleton } from '@/components/facilities/FacilityCard';
import { FacilityForm } from '@/components/facilities/FacilityForm';
import { FacilityOnboarding } from '@/components/facilities/FacilityOnboarding';

export default function Facilities() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [editingFacilityId, setEditingFacilityId] = useState<string | null>(null);
  const { data: facilities, isLoading } = useAllFacilities();
  const { canEdit } = usePermissions();

  const handleEdit = (facilityId: string) => {
    setEditingFacilityId(facilityId);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingFacilityId(null);
  };

  const handleOnboardingClose = () => {
    setIsOnboardingOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Facilities</h1>
          <p className="text-muted-foreground mt-1">
            Manage SET facilities and their configurations
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Quick Add
            </Button>
            <Button onClick={() => setIsOnboardingOpen(true)}>
              <Rocket className="mr-2 h-4 w-4" />
              New Facility Wizard
            </Button>
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Facilities</p>
                <p className="text-2xl font-bold">{facilities?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {facilities?.filter((f) => f.status === 'active').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <Settings2 className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Onboarding</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {facilities?.filter((f) => f.status === 'onboarding').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Maturity</p>
                <p className="text-2xl font-bold text-purple-600">
                  {facilities?.length
                    ? (
                        facilities.reduce((sum, f) => sum + (f.maturity_score || 0), 0) /
                        facilities.length
                      ).toFixed(1)
                    : '0.0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Facility Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <FacilityCardSkeleton key={i} />
          ))}
        </div>
      ) : facilities?.length === 0 ? (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No facilities found</h3>
            <p className="text-muted-foreground mt-1">
              Get started by adding your first facility
            </p>
            {canEdit && (
              <Button className="mt-4" onClick={() => setIsOnboardingOpen(true)}>
                <Rocket className="mr-2 h-4 w-4" />
                New Facility Wizard
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {facilities?.map((facility) => (
            <FacilityCard
              key={facility.id}
              facility={facility}
              onEdit={handleEdit}
              showEditButton={canEdit}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={handleFormClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingFacilityId ? 'Edit Facility' : 'Add New Facility'}
            </DialogTitle>
            <DialogDescription>
              {editingFacilityId
                ? 'Update the facility details below.'
                : 'Create a new facility to manage in the platform.'}
            </DialogDescription>
          </DialogHeader>
          <FacilityForm
            facilityId={editingFacilityId}
            onSuccess={handleFormClose}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      {/* Onboarding Wizard Dialog */}
      <Dialog open={isOnboardingOpen} onOpenChange={handleOnboardingClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Facility Setup Wizard</DialogTitle>
            <DialogDescription>
              Set up a new facility with strategic missions and capability templates.
            </DialogDescription>
          </DialogHeader>
          <FacilityOnboarding
            onComplete={handleOnboardingClose}
            onCancel={handleOnboardingClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
