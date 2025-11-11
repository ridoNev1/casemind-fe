"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useClaimFeedback } from "@/hooks/use-claim-feedback";

const feedbackSchema = z.object({
  decision: z.enum(["approved", "partial", "rejected"], {
    error: "Silakan pilih keputusan",
  }),
  correction_ratio: z
    .union([z.string().length(0), z.string().regex(/^(0(\.\d+)?|1(\.0+)?)$/)])
    .optional(),
  notes: z.string().optional(),
});

type FeedbackValues = z.infer<typeof feedbackSchema>;

type ClaimFeedbackFormProps = {
  claimId: string;
  latestFeedback?: Record<string, unknown> | null;
  onSubmitted?: () => void;
};

export function ClaimFeedbackForm({
  claimId,
  latestFeedback,
  onSubmitted,
}: ClaimFeedbackFormProps) {
  const form = useForm<FeedbackValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      decision: undefined,
      correction_ratio: "",
      notes: "",
    },
  });

  const [submittedFeedback, setSubmittedFeedback] = useState(latestFeedback);

  const mutation = useClaimFeedback(claimId);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = {
      decision: values.decision,
      correction_ratio:
        values.correction_ratio && values.correction_ratio.length
          ? Number(values.correction_ratio)
          : undefined,
      notes: values.notes,
    };

    await toast.promise(mutation.mutateAsync(payload), {
      loading: "Menyimpan feedback...",
      success: "Feedback tersimpan",
      error: (err) => err?.response?.data?.error ?? "Gagal menyimpan feedback",
    });
    setSubmittedFeedback(payload as Record<string, unknown>);
    onSubmitted?.();
    form.reset();
  });

  return (
    <div className="rounded-lg border p-3 text-sm">
      <div className="flex items-center justify-between">
        <p className="font-medium">Audit Feedback</p>
        {mutation.isPending && (
          <span className="text-muted-foreground text-xs">Menyimpan...</span>
        )}
      </div>
      {submittedFeedback ? (
        <div className="mt-2 text-sm text-muted-foreground">
          <p>
            Keputusan: <strong>{submittedFeedback.decision as string}</strong>
          </p>
          {submittedFeedback.correction_ratio !== undefined && (
            <p>
              Correction ratio: {submittedFeedback.correction_ratio as number}
            </p>
          )}
          {submittedFeedback.notes !== undefined && (
            <p>Catatan: {submittedFeedback.notes as unknown as string}</p>
          )}
        </div>
      ) : (
        <Form {...form}>
          <form className="mt-2 space-y-3" onSubmit={onSubmit}>
            <FormField
              control={form.control}
              name="decision"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keputusan</FormLabel>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="grid grid-cols-3 gap-2"
                  >
                    <FormItem className="flex items-center space-x-2">
                      <RadioGroupItem value="approved" id="dec-approved" />
                      <FormLabel htmlFor="dec-approved">Approve</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2">
                      <RadioGroupItem value="partial" id="dec-partial" />
                      <FormLabel htmlFor="dec-partial">Partial</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2">
                      <RadioGroupItem value="rejected" id="dec-rejected" />
                      <FormLabel htmlFor="dec-rejected">Reject</FormLabel>
                    </FormItem>
                  </RadioGroup>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="correction_ratio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correction Ratio (0-1)</FormLabel>
                  <Input placeholder="0.35" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan</FormLabel>
                  <Textarea
                    rows={3}
                    placeholder="Catatan tambahan"
                    {...field}
                  />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={mutation.isPending}>
              Simpan Feedback
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}
