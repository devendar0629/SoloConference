import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Link } from "react-router";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginFormSchema, type LoginFormData } from "@/schemas/login";
import { useLoginMutation } from "@/api/login";
import { AxiosError } from "axios";

export default function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const loginMutation = useLoginMutation();

    const form = useForm({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    });

    const handleSubmit: SubmitHandler<LoginFormData> = (data) => {
        loginMutation.mutate(data, {
            onError: (error) => {
                if (
                    error instanceof AxiosError &&
                    error.response?.data?.code === "INVALID_CREDENTIALS"
                ) {
                    form.setError("root", {
                        message:
                            "Invalid credentials. Please check your email and password."
                    });

                    return;
                }

                form.setError("root", {
                    message:
                        "An unexpected error occurred. Please try again later."
                });
            }
        });
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="gap-3">
                    <CardTitle className="text-3xl font-semibold">
                        Login
                    </CardTitle>

                    <CardDescription>
                        Enter your email below to login to your account
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                        <FieldGroup>
                            <Controller
                                name="email"
                                control={form.control}
                                render={({ field, fieldState }) => {
                                    return (
                                        <Field
                                            data-invalid={fieldState.invalid}
                                            className="gap-2"
                                        >
                                            <FieldLabel htmlFor={field.name}>
                                                Email
                                            </FieldLabel>

                                            <Input
                                                type="email"
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                                {...field}
                                                className="max-w-xl py-4.5 px-3"
                                            />

                                            {fieldState.invalid && (
                                                <FieldError
                                                    errors={[fieldState.error]}
                                                />
                                            )}
                                        </Field>
                                    );
                                }}
                            />

                            <Controller
                                name="password"
                                control={form.control}
                                render={({ field, fieldState }) => {
                                    return (
                                        <Field
                                            data-invalid={fieldState.invalid}
                                            className="gap-2"
                                        >
                                            <FieldLabel htmlFor={field.name}>
                                                Password
                                            </FieldLabel>

                                            <Input
                                                type="password"
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                                {...field}
                                                className="max-w-xl py-4.5 px-3"
                                            />

                                            {fieldState.invalid && (
                                                <FieldError
                                                    errors={[fieldState.error]}
                                                />
                                            )}
                                        </Field>
                                    );
                                }}
                            />

                            {form.formState.errors.root?.message && (
                                <FieldError
                                    errors={[form.formState.errors.root]}
                                />
                            )}

                            <Button
                                className="py-4.5 px-3 mt-1 text-base font-semibold cursor-pointer"
                                type="submit"
                            >
                                Login
                            </Button>
                        </FieldGroup>
                    </form>

                    <div className="text-center mt-3">
                        Don&apos;t have an account?{" "}
                        <Link to="/auth/signup">Sign up</Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
