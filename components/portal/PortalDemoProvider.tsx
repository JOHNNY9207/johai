"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { portalDemoReferenceTime } from "@/app/lib/customer-portal-demo-fixture";
import { createCustomerPortalDemoRepository } from "@/app/lib/customer-portal-demo-repository";
import { demoPortalContextualIntelligenceProvider } from "@/app/lib/customer-portal-contextual-provider";
import type { PortalProfile } from "@/app/lib/customer-portal-types";
import {
  PortalContextBoundary,
  type PortalContextValue,
  type PortalDemoControls,
} from "@/components/portal/PortalProvider";

export function PortalDemoProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [repository] = useState(() => createCustomerPortalDemoRepository());
  const fixture = repository.getFixture();
  const [activeProfile, setActiveProfile] = useState(fixture.profile);
  const [dataVersion, setDataVersion] = useState(0);
  const [dataMode, setDataModeState] = useState(repository.getDataMode());

  const replaceProfile = useCallback(
    (profile: PortalProfile) => {
      if (
        profile.id === fixture.context.customerProfileId &&
        profile.businessId === fixture.context.businessId
      ) {
        setActiveProfile(profile);
      }
    },
    [fixture.context.businessId, fixture.context.customerProfileId]
  );

  const demoControls = useMemo<PortalDemoControls>(
    () => ({
      dataMode,
      failNextDownload: repository.failNextDownload,
      failNextMessage: repository.failNextMessage,
      failNextProfileSave: repository.failNextProfileSaveWithSessionError,
      reset() {
        setActiveProfile(repository.reset());
        setDataModeState("normal");
        setDataVersion((value) => value + 1);
      },
      setDataMode(mode) {
        repository.setDataMode(mode);
        setDataModeState(mode);
        setDataVersion((value) => value + 1);
      },
    }),
    [dataMode, repository]
  );

  const value = useMemo<PortalContextValue>(
    () => ({
      activeProfile,
      branding: fixture.branding,
      context: fixture.context,
      dataVersion,
      demoControls,
      environment: "demo",
      intelligenceProvider: demoPortalContextualIntelligenceProvider,
      initialData: dataMode === "normal" ? fixture : undefined,
      profileLabels: { [activeProfile.id]: fixture.branding.displayName },
      profiles: [activeProfile],
      referenceTime: portalDemoReferenceTime,
      repository,
      replaceProfile,
      routeBase: "/portal/demo",
      selectProfile() {},
      async signOut() {
        router.push("/");
      },
    }),
    [activeProfile, dataMode, dataVersion, demoControls, fixture, replaceProfile, repository, router]
  );

  return <PortalContextBoundary value={value}>{children}</PortalContextBoundary>;
}
