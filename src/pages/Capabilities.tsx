// src/pages/Capabilities.tsx
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CapabilityList, CapabilityDetail } from '@/components/capabilities';

export default function Capabilities() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  const handleCapabilityClick = (capabilityId: string) => {
    navigate(`/capabilities/${capabilityId}`);
  };

  const handleBack = () => {
    navigate('/capabilities');
  };

  const handleDeleted = () => {
    navigate('/capabilities');
  };

  // If we have an ID in the URL, show detail view
  if (id) {
    return (
      <CapabilityDetail
        capabilityId={id}
        onBack={handleBack}
        onDeleted={handleDeleted}
      />
    );
  }

  // Otherwise show the list
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Capabilities</h1>
        <p className="text-muted-foreground mt-1">
          Manage and track your operational capabilities
        </p>
      </div>

      <CapabilityList onCapabilityClick={handleCapabilityClick} />
    </div>
  );
}
