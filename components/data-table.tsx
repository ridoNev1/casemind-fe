"use client";

import {
  IconAlertTriangle,
  IconChevronLeft,
  IconChevronRight,
  IconRefresh,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate, formatNumber, cn } from "@/lib/utils";
import type { HighRiskClaim, HighRiskMeta } from "@/lib/services/claims";

type DataTableProps = {
  claims: HighRiskClaim[];
  meta?: HighRiskMeta;
  isLoading: boolean;
  isError: boolean;
  isFetching?: boolean;
  onRetry?: () => void;
  onPageChange: (page: number) => void;
  selectedClaimId?: string;
  onSelectClaim?: (claimId: string) => void;
};

const FLAG_COLORS: Record<string, "secondary" | "default" | "outline"> = {
  short_stay_high_cost: "secondary",
  high_cost_full_paid: "default",
  duplicate_pattern: "outline",
};

export function DataTable({
  claims,
  meta,
  isLoading,
  isError,
  isFetching,
  onRetry,
  onPageChange,
  selectedClaimId,
  onSelectClaim,
}: DataTableProps) {
  const page = meta?.page ?? 1;
  const pageSize = meta?.page_size ?? 20;
  const total = meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const baseIndex = (page - 1) * pageSize;

  const showSkeleton = isLoading && !claims.length;
  const showEmpty = !isLoading && !isError && claims.length === 0;

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm text-muted-foreground">
            {meta
              ? `Menampilkan ${claims.length} klaim dari total ${formatNumber(meta.total, 0)} (Model ${meta.model_version})`
              : "Menampilkan klaim risiko tinggi"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRetry?.()}
            disabled={isFetching}
          >
            <IconRefresh className={cn("mr-2 size-4", isFetching && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border">
        {isError ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <IconAlertTriangle className="text-destructive size-6" />
            <p className="font-medium">Gagal memuat data klaim</p>
            <p className="text-muted-foreground text-sm">
              Periksa koneksi Anda dan coba lagi.
            </p>
            <Button size="sm" onClick={() => onRetry?.()}>
              Coba lagi
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">#</TableHead>
                <TableHead>Klaim</TableHead>
                <TableHead>Fasilitas & Wilayah</TableHead>
                <TableHead>Severity / Layanan</TableHead>
                <TableHead className="text-right">Biaya (Claimed / Paid)</TableHead>
                <TableHead className="text-right">Risk Score</TableHead>
                <TableHead>Flags</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {showSkeleton &&
                Array.from({ length: pageSize }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    {Array.from({ length: 8 }).map((__, cellIdx) => (
                      <TableCell key={cellIdx}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              {showEmpty && (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <p className="font-medium">Tidak ada klaim sesuai filter</p>
                      <p className="text-muted-foreground text-sm">
                        Coba ubah filter severity, layanan, atau tanggal.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {!showSkeleton &&
                !showEmpty &&
                claims.map((claim, index) => {
                  const isSelected = claim.claim_id === selectedClaimId;
                  return (
                    <TableRow
                      key={claim.claim_id}
                      className={cn(
                        "cursor-pointer",
                        isSelected && "bg-muted/80 hover:bg-muted",
                      )}
                      onClick={() => onSelectClaim?.(claim.claim_id)}
                    >
                      <TableCell className="w-12 text-center text-sm text-muted-foreground">
                        {baseIndex + index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{claim.claim_id}</span>
                          <span className="text-muted-foreground text-sm">
                            {claim.dx_primary_label ?? "Diagnosis tidak tersedia"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            LOS: {claim.los ?? "-"} hari · Masuk {" "}
                            {formatDate(claim.admit_dt)} · Pulang {" "}
                            {formatDate(claim.discharge_dt)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{claim.facility_name ?? "-"}</span>
                          <span className="text-xs text-muted-foreground">
                            {claim.facility_class ?? "Kelas ?"} · {" "}
                            {claim.province_name ?? "Wilayah ?"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline">{claim.severity_group ?? "-"}</Badge>
                          <Badge variant="secondary">
                            {claim.service_type ?? "Layanan ?"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end text-sm">
                          <span>{formatCurrency(claim.amount_claimed)}</span>
                          <span className="text-muted-foreground">
                            Dibayar {formatCurrency(claim.amount_paid)}
                          </span>
                          {claim.peer?.mean && (
                            <span className="text-xs text-muted-foreground">
                              Peer mean: {formatCurrency(claim.peer.mean)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-semibold text-rose-500 dark:text-rose-400">
                            {claim.risk_score?.toFixed(2)}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            Rules {claim.rule_score?.toFixed(2)} · ML {" "}
                            {claim.ml_score_normalized?.toFixed(2)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {claim.flags?.length ? (
                          claim.flags.map((flag) => (
                            <Badge
                              key={`${claim.claim_id}-${flag}`}
                              variant={FLAG_COLORS[flag] ?? "outline"}
                              className="text-xs"
                            >
                              {flag.replace(/_/g, " ")}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="outline" className="text-xs text-muted-foreground">
                            No flag
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {claim.latest_feedback ? (
                        <Badge variant="secondary">Reviewed</Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          Halaman {page} dari {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1 || isFetching}
          >
            <IconChevronLeft className="mr-1 size-4" />
            Sebelumnya
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages || isFetching}
          >
            Berikutnya
            <IconChevronRight className="ml-1 size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
