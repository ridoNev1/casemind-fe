"use client";

import { useMemo, useState, type CSSProperties } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { AuthGuard } from "@/components/auth-guard";
// import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { ClaimDetailPanel } from "@/components/claim-detail-panel";
import { ClaimChatPanel } from "@/components/claim-chat-panel";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
// import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useHighRiskClaims } from "@/hooks/use-high-risk-claims";
import type { HighRiskFilters } from "@/lib/services/claims";

const ALL_VALUE = "ALL";

const severityOptions = [
  { label: "Semua Severity", value: ALL_VALUE },
  { label: "Ringan", value: "ringan" },
  { label: "Sedang", value: "sedang" },
  { label: "Berat", value: "berat" },
];

const serviceTypeOptions = [
  { label: "Semua Layanan", value: ALL_VALUE },
  { label: "Rawat Inap (RITL)", value: "RITL" },
  { label: "Rawat Jalan (RJTL)", value: "RJTL" },
  { label: "RITP", value: "RITP" },
  { label: "RJP", value: "RJP" },
];

const facilityClassOptions = [
  { label: "Semua Fasilitas", value: ALL_VALUE },
  { label: "RS Kelas A", value: "RS Kelas A" },
  { label: "RS Kelas B", value: "RS Kelas B" },
  { label: "RS Kelas C", value: "RS Kelas C" },
  { label: "RS Kelas D", value: "RS Kelas D" },
  { label: "RS Kelas D PRATAMA", value: "RS Kelas D PRATAMA" },
  { label: "RS Kelas Tidak Ditetapkan", value: "RS Kelas Belum Ditetapkan" },
];

const pageSizeOptions = [
  { label: "20", value: "20" },
  { label: "50", value: "50" },
  { label: "100", value: "100" },
];

const INITIAL_FILTERS: HighRiskFilters = {
  page: 1,
  page_size: 20,
  severity: "sedang",
  service_type: "RITL",
  refresh_cache: false,
};

export default function Dashboard() {
  const [filters, setFilters] = useState<HighRiskFilters>(INITIAL_FILTERS);
  const [selectedClaimId, setSelectedClaimId] = useState<string | undefined>();
  const [detailOpen, setDetailOpen] = useState(false);

  const queryFilters = useMemo(() => filters, [filters]);

  const { data, isLoading, isError, isFetching, refetch } =
    useHighRiskClaims(queryFilters);

  const claims = useMemo(() => data?.data ?? [], [data]);
  const activeClaimId = useMemo(() => {
    if (
      selectedClaimId &&
      claims.some((claim) => claim.claim_id === selectedClaimId)
    ) {
      return selectedClaimId;
    }
    return undefined;
  }, [claims, selectedClaimId]);
  const sheetOpen = detailOpen && Boolean(activeClaimId);

  const isDefaultFilters = useMemo(() => {
    const normalize = (value: HighRiskFilters) => ({
      page: value.page ?? 1,
      page_size: value.page_size ?? 20,
      severity: value.severity ?? "",
      service_type: value.service_type ?? "",
      facility_class: value.facility_class ?? "",
      province: value.province ?? "",
      dx: value.dx ?? "",
      min_risk_score: value.min_risk_score ?? "",
      max_risk_score: value.max_risk_score ?? "",
      min_ml_score: value.min_ml_score ?? "",
      start_date: value.start_date ?? "",
      end_date: value.end_date ?? "",
      discharge_start: value.discharge_start ?? "",
      discharge_end: value.discharge_end ?? "",
      refresh_cache: value.refresh_cache ?? false,
    });
    return (
      JSON.stringify(normalize(filters)) ===
      JSON.stringify(normalize(INITIAL_FILTERS))
    );
  }, [filters]);

  const handleFilterChange = (key: keyof HighRiskFilters, value?: string) => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      [key]: value || undefined,
    }));
  };

  const handleNumberFilterChange = (
    key: keyof HighRiskFilters,
    value: string
  ) => {
    const parsed = value === "" ? undefined : Number(value);
    setFilters((prev) => ({
      ...prev,
      page: 1,
      [key]: Number.isFinite(parsed ?? NaN) ? (parsed as number) : undefined,
    }));
  };

  const handleCheckboxFilterChange = (
    key: keyof HighRiskFilters,
    checked: boolean
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: checked,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  const handlePageSizeChange = (value: string) => {
    const size = Number(value) || 20;
    setFilters((prev) => ({
      ...prev,
      page_size: size,
      page: 1,
    }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  return (
    <AuthGuard>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                {/* <SectionCards />
                <div className="px-4 lg:px-6">
                  <ChartAreaInteractive />
                </div> */}
                <div className="flex flex-wrap items-center gap-4 px-4 lg:px-6">
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs uppercase text-muted-foreground">
                      Severity
                    </Label>
                    <Select
                      value={filters.severity ?? ALL_VALUE}
                      onValueChange={(value) =>
                        handleFilterChange(
                          "severity",
                          value === ALL_VALUE ? undefined : value
                        )
                      }
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Pilih severity" />
                      </SelectTrigger>
                      <SelectContent>
                        {severityOptions.map((option) => (
                          <SelectItem key={option.label} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs uppercase text-muted-foreground">
                      Layanan
                    </Label>
                    <Select
                      value={filters.service_type ?? ALL_VALUE}
                      onValueChange={(value) =>
                        handleFilterChange(
                          "service_type",
                          value === ALL_VALUE ? undefined : value
                        )
                      }
                    >
                      <SelectTrigger className="w-[220px]">
                        <SelectValue placeholder="Pilih layanan" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceTypeOptions.map((option) => (
                          <SelectItem key={option.label} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs uppercase text-muted-foreground">
                      Kelas Fasilitas
                    </Label>
                    <Select
                      value={filters.facility_class ?? ALL_VALUE}
                      onValueChange={(value) =>
                        handleFilterChange(
                          "facility_class",
                          value === ALL_VALUE ? undefined : value
                        )
                      }
                    >
                      <SelectTrigger className="w-[220px]">
                        <SelectValue placeholder="Pilih kelas RS" />
                      </SelectTrigger>
                      <SelectContent>
                        {facilityClassOptions.map((option) => (
                          <SelectItem key={option.label} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs uppercase text-muted-foreground">
                      Page Size
                    </Label>
                    <Select
                      value={String(filters.page_size ?? 20)}
                      onValueChange={handlePageSizeChange}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Baris" />
                      </SelectTrigger>
                      <SelectContent>
                        {pageSizeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 px-4 lg:px-6">
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs uppercase text-muted-foreground">
                      Provinsi
                    </Label>
                    <Input
                      placeholder="Contoh: JAWA TENGAH"
                      className="w-[220px]"
                      value={filters.province ?? ""}
                      onChange={(event) =>
                        handleFilterChange(
                          "province",
                          event.target.value.toUpperCase()
                        )
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs uppercase text-muted-foreground">
                      Kode DX (ICD-10)
                    </Label>
                    <Input
                      placeholder="Contoh: A09"
                      className="w-40"
                      value={filters.dx ?? ""}
                      onChange={(event) =>
                        handleFilterChange(
                          "dx",
                          event.target.value.toUpperCase()
                        )
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs uppercase text-muted-foreground">
                      Admit Start
                    </Label>
                    <Input
                      type="date"
                      value={filters.start_date ?? ""}
                      onChange={(event) =>
                        handleFilterChange(
                          "start_date",
                          event.target.value || undefined
                        )
                      }
                      className="w-[180px]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs uppercase text-muted-foreground">
                      Admit End
                    </Label>
                    <Input
                      type="date"
                      value={filters.end_date ?? ""}
                      onChange={(event) =>
                        handleFilterChange(
                          "end_date",
                          event.target.value || undefined
                        )
                      }
                      className="w-[180px]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs uppercase text-muted-foreground">
                      Discharge Start
                    </Label>
                    <Input
                      type="date"
                      value={filters.discharge_start ?? ""}
                      onChange={(event) =>
                        handleFilterChange(
                          "discharge_start",
                          event.target.value || undefined
                        )
                      }
                      className="w-[180px]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs uppercase text-muted-foreground">
                      Discharge End
                    </Label>
                    <Input
                      type="date"
                      value={filters.discharge_end ?? ""}
                      onChange={(event) =>
                        handleFilterChange(
                          "discharge_end",
                          event.target.value || undefined
                        )
                      }
                      className="w-[180px]"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 px-4 lg:px-6">
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs uppercase text-muted-foreground">
                      Min Risk Score
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      className="w-[150px]"
                      value={
                        typeof filters.min_risk_score === "number"
                          ? String(filters.min_risk_score)
                          : ""
                      }
                      onChange={(event) =>
                        handleNumberFilterChange(
                          "min_risk_score",
                          event.target.value
                        )
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs uppercase text-muted-foreground">
                      Max Risk Score
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      className="w-[150px]"
                      value={
                        typeof filters.max_risk_score === "number"
                          ? String(filters.max_risk_score)
                          : ""
                      }
                      onChange={(event) =>
                        handleNumberFilterChange(
                          "max_risk_score",
                          event.target.value
                        )
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs uppercase text-muted-foreground">
                      Min ML Score
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="-1"
                      max="1"
                      className="w-[150px]"
                      value={
                        typeof filters.min_ml_score === "number"
                          ? String(filters.min_ml_score)
                          : ""
                      }
                      onChange={(event) =>
                        handleNumberFilterChange(
                          "min_ml_score",
                          event.target.value
                        )
                      }
                    />
                  </div>
                  <div className="flex flex-1 justify-end gap-2">
                    <div className="flex items-center gap-2 pr-4">
                      <Checkbox
                        id="refresh-cache"
                        checked={!!filters.refresh_cache}
                        onCheckedChange={(checked) =>
                          handleCheckboxFilterChange(
                            "refresh_cache",
                            Boolean(checked)
                          )
                        }
                      />
                      <Label
                        htmlFor="refresh-cache"
                        className="text-xs uppercase text-muted-foreground"
                      >
                        Refresh Cache
                      </Label>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResetFilters}
                      disabled={isDefaultFilters}
                    >
                      Reset Filter
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetch()}
                      disabled={isFetching}
                    >
                      Sinkronisasi
                    </Button>
                  </div>
                </div>
                <DataTable
                  claims={claims}
                  meta={data?.meta}
                  isLoading={isLoading}
                  isError={isError}
                  isFetching={isFetching}
                  onRetry={() => refetch()}
                  onPageChange={handlePageChange}
                  selectedClaimId={selectedClaimId}
                  onSelectClaim={(claimId) => {
                    setSelectedClaimId(claimId);
                    setDetailOpen(true);
                  }}
                />
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
      <Sheet open={sheetOpen} onOpenChange={setDetailOpen}>
        <SheetContent side="right" className="overflow-y-auto p-4">
          <SheetHeader>
            <SheetTitle>Detail Klaim & Chat</SheetTitle>
          </SheetHeader>
          <div className="grid gap-4 py-4 xl:grid-cols-[1.4fr_1fr]">
            <ClaimDetailPanel claimId={activeClaimId} />
            <ClaimChatPanel claimId={activeClaimId} />
          </div>
        </SheetContent>
      </Sheet>
    </AuthGuard>
  );
}
