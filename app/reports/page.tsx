"use client";

import { useMemo, useState } from "react";
import { IconRefresh } from "@tabler/icons-react";

import { AppSidebar } from "@/components/app-sidebar";
import { AuthGuard } from "@/components/auth-guard";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDuplicateClaims, useSeverityMismatch } from "@/hooks/use-reports";
import { formatCurrency, formatNumber } from "@/lib/utils";

const limitOptions = [
  { label: "Top 20", value: "20" },
  { label: "Top 50", value: "50" },
  { label: "Top 100", value: "100" },
];

const skeletonRows = Array.from({ length: 6 });

export default function ReportsPage() {
  const [severityLimit, setSeverityLimit] = useState("20");
  const [duplicateLimit, setDuplicateLimit] = useState("20");

  const severityQuery = useSeverityMismatch(Number(severityLimit));
  const duplicateQuery = useDuplicateClaims(Number(duplicateLimit));

  const topSeverity = severityQuery.data?.[0];
  const severitySummary = useMemo(
    () => ({
      count: severityQuery.data?.length ?? 0,
      topDelta: topSeverity?.delta_pct ?? null,
      facilityClass: topSeverity?.facility_class ?? "-",
      province: topSeverity?.province ?? "-",
    }),
    [severityQuery.data, topSeverity],
  );

  const duplicateSummary = useMemo(() => {
    const count = duplicateQuery.data?.length ?? 0;
    const earliest = duplicateQuery.data?.[0];
    return {
      count,
      minGap: earliest?.episode_gap_days ?? null,
      dx: earliest?.dx_primary ?? "-",
    };
  }, [duplicateQuery.data]);

  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader
            title="Reports & Analytics"
            description="Pantau mismatch severity dan kandidat klaim duplikat secara realtime."
          />
          <div className="flex flex-1 flex-col gap-6 p-4 pb-10 md:p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <div>
                    <CardTitle>Severity mismatch</CardTitle>
                    <CardDescription>
                      Klaim severity ringan dengan biaya di atas peer P90.
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => severityQuery.refetch()}
                    disabled={severityQuery.isFetching}
                  >
                    <IconRefresh className="mr-1 size-4" />
                    Refresh
                  </Button>
                </CardHeader>
                <CardContent>
                  {severityQuery.isLoading ? (
                    <Skeleton className="h-16 w-full" />
                  ) : (
                    <div className="grid gap-2">
                      <div className="text-3xl font-semibold">
                        {formatNumber(severitySummary.count, 0)} klaim
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Top delta{" "}
                        {severitySummary.topDelta !== null
                          ? `${formatNumber(severitySummary.topDelta, 1)}%`
                          : "-"}{" "}
                        di {severitySummary.facilityClass} ({severitySummary.province})
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <div>
                    <CardTitle>Duplikasi potensional</CardTitle>
                    <CardDescription>
                      Episode pasien dengan jarak &le;3 hari dan diagnosis serupa.
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => duplicateQuery.refetch()}
                    disabled={duplicateQuery.isFetching}
                  >
                    <IconRefresh className="mr-1 size-4" />
                    Refresh
                  </Button>
                </CardHeader>
                <CardContent>
                  {duplicateQuery.isLoading ? (
                    <Skeleton className="h-16 w-full" />
                  ) : (
                    <div className="grid gap-2">
                      <div className="text-3xl font-semibold">
                        {formatNumber(duplicateSummary.count, 0)} pasangan
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Gap tercepat{" "}
                        {duplicateSummary.minGap !== null
                          ? `${duplicateSummary.minGap} hari`
                          : "-"}{" "}
                        ({duplicateSummary.dx})
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Daftar severity mismatch</CardTitle>
                  <CardDescription>
                    Menampilkan klaim severity ringan dengan biaya yang melampaui peer group.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <Select value={severityLimit} onValueChange={setSeverityLimit}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Pilih limit" />
                    </SelectTrigger>
                    <SelectContent align="end">
                      {limitOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => severityQuery.refetch()}
                    disabled={severityQuery.isFetching}
                  >
                    <IconRefresh className="mr-1 size-4" />
                    Muat ulang
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {severityQuery.isError ? (
                  <Alert variant="destructive">
                    <AlertTitle>Gagal memuat data severity mismatch</AlertTitle>
                    <AlertDescription>
                      {severityQuery.error instanceof Error
                        ? severityQuery.error.message
                        : "Silakan coba lagi dalam beberapa saat."}
                    </AlertDescription>
                  </Alert>
                ) : severityQuery.isLoading ? (
                  <div className="space-y-2">
                    {skeletonRows.map((_, idx) => (
                      <Skeleton key={`severity-skeleton-${idx}`} className="h-10 w-full" />
                    ))}
                  </div>
                ) : severityQuery.data && severityQuery.data.length > 0 ? (
                  <>
                    <Table>
                      <TableCaption>
                        Menampilkan {severityQuery.data.length} klaim teratas (limit {severityLimit}).
                      </TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>#</TableHead>
                          <TableHead>Klaim</TableHead>
                          <TableHead>Wilayah & Faskes</TableHead>
                          <TableHead>LOS</TableHead>
                          <TableHead>Biaya</TableHead>
                          <TableHead>Delta %</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {severityQuery.data.map((row, index) => (
                          <TableRow key={row.claim_id}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell>
                              <div className="font-semibold">{row.claim_id}</div>
                              <div className="text-muted-foreground text-xs">
                                {row.dx_primary || "-"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>{row.province || "-"}</div>
                              <div className="text-muted-foreground text-xs">
                                {row.facility_class || "-"}
                              </div>
                            </TableCell>
                            <TableCell>{row.los ?? "-"}</TableCell>
                            <TableCell>
                              <div>{formatCurrency(row.claimed)}</div>
                              <div className="text-muted-foreground text-xs">
                                Peer P90: {formatCurrency(row.peer_p90)}
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold text-red-400">
                              {row.delta_pct !== null && row.delta_pct !== undefined
                                ? `${formatNumber(row.delta_pct, 1)}%`
                                : "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                ) : (
                  <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                    Tidak ada data severity mismatch untuk limit ini.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Daftar kandidat duplikat</CardTitle>
                  <CardDescription>
                    Pasangan claim ID yang muncul dalam rentang &le;3 hari dengan diagnosa/procedure identik.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <Select value={duplicateLimit} onValueChange={setDuplicateLimit}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Pilih limit" />
                    </SelectTrigger>
                    <SelectContent align="end">
                      {limitOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => duplicateQuery.refetch()}
                    disabled={duplicateQuery.isFetching}
                  >
                    <IconRefresh className="mr-1 size-4" />
                    Muat ulang
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {duplicateQuery.isError ? (
                  <Alert variant="destructive">
                    <AlertTitle>Gagal memuat kandidat duplikat</AlertTitle>
                    <AlertDescription>
                      {duplicateQuery.error instanceof Error
                        ? duplicateQuery.error.message
                        : "Silakan coba lagi dalam beberapa saat."}
                    </AlertDescription>
                  </Alert>
                ) : duplicateQuery.isLoading ? (
                  <div className="space-y-2">
                    {skeletonRows.map((_, idx) => (
                      <Skeleton key={`duplicate-skeleton-${idx}`} className="h-10 w-full" />
                    ))}
                  </div>
                ) : duplicateQuery.data && duplicateQuery.data.length > 0 ? (
                  <>
                    <Table>
                      <TableCaption>
                        Menampilkan {duplicateQuery.data.length} pasangan teratas (limit {duplicateLimit}).
                      </TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>#</TableHead>
                          <TableHead>Claim Pair</TableHead>
                          <TableHead>Diagnosis</TableHead>
                          <TableHead>Tindakan</TableHead>
                          <TableHead>Gap (hari)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {duplicateQuery.data.map((row, index) => (
                          <TableRow key={`${row.claim_id}-${row.matched_claim_id}`}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell>
                              <div className="font-semibold">{row.claim_id}</div>
                              <div className="text-muted-foreground text-xs">
                                Match: {row.matched_claim_id}
                              </div>
                            </TableCell>
                            <TableCell>{row.dx_primary || "-"}</TableCell>
                            <TableCell>{row.procedure_code || "-"}</TableCell>
                            <TableCell className="font-semibold">
                              {row.episode_gap_days ?? "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                ) : (
                  <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                    Tidak ada kandidat duplikat untuk limit ini.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
