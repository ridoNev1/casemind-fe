"use client";

import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { useClaimSummary } from "@/hooks/use-claim-summary";
import { ClaimFeedbackForm } from "@/components/claim-feedback-form";
import { useTariffInsight } from "@/hooks/use-tariff-insight";
import type { HighRiskClaim } from "@/lib/services/claims";

type ClaimDetailPanelProps = {
  claimId?: string;
  claimContext?: HighRiskClaim;
};

export function ClaimDetailPanel({
  claimId,
  claimContext,
}: ClaimDetailPanelProps) {
  const { data, isLoading, isError, refetch } = useClaimSummary(claimId);
  const {
    data: tariffData,
    isLoading: isTariffLoading,
    isError: isTariffError,
    refetch: refetchTariff,
  } = useTariffInsight(
    claimContext
      ? {
          facility_id: claimContext.facility_id ?? undefined,
          province: claimContext.province_name ?? undefined,
          severity: claimContext.severity_group ?? undefined,
          service_type: claimContext.service_type ?? undefined,
          dx_group: claimContext.dx_primary_group ?? undefined,
          limit: 3,
        }
      : undefined
  );

  if (!claimId) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Detail Klaim</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          Pilih klaim dari tabel untuk melihat ringkasan.
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Detail Klaim</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Skeleton className="h-6 w-2/3" />
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Detail Klaim</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => refetch()}>
            <IconRefresh className="size-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
          <IconAlertCircle className="text-destructive size-6" />
          <p className="font-medium">Gagal memuat ringkasan klaim</p>
          <p className="text-muted-foreground text-sm">
            Silakan coba lagi dalam beberapa saat.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <CardTitle>Detail Klaim {data.claim_id}</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => refetch()}>
            <IconRefresh className="size-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <Badge variant="secondary">
            Severity {data.claim.severity_group ?? "-"}
          </Badge>
          <Badge variant="outline">LOS {data.claim.los ?? "-"} hari</Badge>
          <Badge variant="outline">Risk {data.risk_score.toFixed(2)}</Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          {data.claim.service_type} · {data.claim.facility_class} ·{" "}
          {data.claim.province_name}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 max-h-[60vh] overflow-auto">
        <div className="grid gap-3">
          <div className="rounded-lg border p-3 text-sm">
            <p className="font-medium">Ringkasan Biaya</p>
            <p className="text-muted-foreground">
              Klaim {formatCurrency(data.claim.amount_claimed)} · Dibayar{" "}
              {formatCurrency(data.claim.amount_paid)} · Gap{" "}
              {formatCurrency(data.claim.amount_gap)}
            </p>
          </div>
          <div className="rounded-lg border p-3 text-sm">
            <p className="font-medium">Peer & Z-score</p>
            <p className="text-muted-foreground">
              Peer {data.peer.key} · P90 {formatCurrency(data.peer.p90)} · Z{" "}
              {formatNumber(data.peer.cost_zscore, 2)}
            </p>
          </div>
          <div className="rounded-lg border p-3 text-sm">
            <div className="flex items-center justify-between">
              <p className="font-medium">Tariff Insight</p>
              {claimContext && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => refetchTariff()}
                >
                  <IconRefresh className="size-4" />
                </Button>
              )}
            </div>
            {!claimContext && (
              <p className="text-muted-foreground text-sm">
                Tariff insight tidak tersedia (fasilitas tidak teridentifikasi).
              </p>
            )}
            {claimContext && isTariffLoading && (
              <div className="flex flex-col gap-2 pt-2">
                {Array.from({ length: 2 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-12 w-full" />
                ))}
              </div>
            )}
            {claimContext && !isTariffLoading && isTariffError && (
              <p className="text-destructive text-sm">
                Gagal memuat insight tarif.
              </p>
            )}
            {claimContext &&
              !isTariffLoading &&
              !isTariffError &&
              (tariffData?.length ? (
                <div className="space-y-2 pt-2">
                  {tariffData.slice(0, 3).map((row) => (
                    <div
                      key={`${row.facility_id}-${row.dx_primary_group}`}
                      className="rounded-md border p-4 text-xs"
                    >
                      <p className="font-medium">
                        {row.dx_primary_group ?? "DX Group tidak tersedia"}
                      </p>
                      <p className="text-muted-foreground">
                        Gap total {formatCurrency(row.total_gap)} dari{" "}
                        {row.claim_count} klaim
                      </p>
                      <div className="flex flex-wrap gap-2 text-muted-foreground">
                        <span>Avg gap {formatCurrency(row.avg_gap)}</span>
                        <span>
                          Payment ratio{" "}
                          {(row.avg_payment_ratio ?? 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm pt-2">
                  Tidak ada insight tarif untuk kombinasi filter ini.
                </p>
              ))}
          </div>
          <div className="rounded-lg border p-3 text-sm">
            <p className="font-medium">Flags Aktif</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {data.flags.length ? (
                data.flags.map((flag) => (
                  <Badge key={flag} variant="outline">
                    {flag.replace(/_/g, " ")}
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground">
                  Tidak ada flag rules
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {data.sections.map((section) => (
            <div key={section.title} className="rounded-lg border p-3 text-sm">
              <p className="font-medium">{section.title}</p>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {section.content}
              </p>
            </div>
          ))}
        </div>
        <ClaimFeedbackForm
          claimId={data.claim_id}
          latestFeedback={data.latest_feedback}
          onSubmitted={() => refetch()}
        />
      </CardContent>
    </Card>
  );
}
