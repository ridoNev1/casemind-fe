"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import Image from "next/image";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { HospitalImageForBG } from "@/assets";
import {
  Form,
  FormControl,
  FormField,
  FormMessage,
} from "@/components/ui/form";
import { login, type LoginPayload } from "@/lib/services/auth";
import { useAuthStore } from "@/store/auth-store";

const loginSchema = z.object({
  email: z
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { setSession } = useAuthStore();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: (data) => {
      setSession({
        token: data.access_token,
        expiresAt: data.expires_at,
        user: data.user,
      });
      toast.success("Welcome back! Redirecting you to the dashboard.");
      router.replace("/");
    },
    onError: (error) => {
      const message = isAxiosError(error)
        ? error.response?.data?.error ?? "Invalid email or password."
        : "Unable to login, please try again.";
      toast.error(message);
    },
  });

  const onSubmit = (values: LoginValues) => {
    loginMutation.mutate(values);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form
              className="p-6 md:p-8"
              onSubmit={form.handleSubmit(onSubmit)}
              noValidate
            >
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">Welcome to Casemind AI</h1>
                  <p className="text-muted-foreground text-balance">
                    Login to your Casemind AI account
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>Email</FieldLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="auditor@casemind.ai"
                          autoComplete="email"
                        />
                      </FormControl>
                      <FormMessage />
                    </Field>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <Field>
                      <div className="flex items-center">
                        <FieldLabel>Password</FieldLabel>
                        <a
                          href="#"
                          className="ml-auto text-sm underline-offset-2 hover:underline"
                        >
                          Forgot your password?
                        </a>
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          autoComplete="current-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </Field>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Signing in..." : "Login"}
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <a href="#">Sign up</a>
                </FieldDescription>
              </FieldGroup>
            </form>
          </Form>
          <div className="bg-muted relative hidden md:block">
            <Image
              src={HospitalImageForBG}
              alt="Hospital background"
              fill
              className="object-cover dark:brightness-[0.2] dark:grayscale"
              priority
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
