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
import { Link, useNavigate } from "react-router";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupFormSchema, type SignupFormData } from "@/schemas/signup";
import { useSignupMutation } from "@/api/login";
import { toast } from "sonner";
import { AxiosError } from "axios";

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
    const navigate = useNavigate();

    const signupMutation = useSignupMutation();

    const form = useForm({
        resolver: zodResolver(signupFormSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: ""
        }
    });

    const handleSubmit: SubmitHandler<SignupFormData> = async (data) => {
        await signupMutation.mutateAsync(data, {
            onError: (error) => {
                if (error instanceof AxiosError) {
                    if (error.response?.data?.code === "EMAIL_ALREADY_EXISTS") {
                        form.setError("email", {
                            type: "manual",
                            message:
                                "Email already exists. Please use a different email."
                        });

                        return;
                    }
                }

                form.setError("root", {
                    type: "manual",
                    message:
                        "An unexpected error occurred. Please try again later."
                });
            },
            onSuccess: () => {
                toast.success("Signup successful! Please log in.");
                navigate("/auth/login");
            }
        });
    };

    return (
        <Card {...props}>
            <CardHeader className="gap-3">
                <CardTitle className="text-3xl font-semibold">Signup</CardTitle>

                <CardDescription>
                    Enter your information below to create your account
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={form.handleSubmit(handleSubmit)}>
                    <FieldGroup className="gap-3">
                        <Controller
                            name="name"
                            control={form.control}
                            render={({ field, fieldState }) => {
                                return (
                                    <Field
                                        data-invalid={fieldState.invalid}
                                        className="gap-2"
                                    >
                                        <FieldLabel htmlFor={field.name}>
                                            Name
                                        </FieldLabel>

                                        <Input
                                            aria-invalid={fieldState.invalid}
                                            {...field}
                                            className="max-w-xl px-3 py-4.5"
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
                                            aria-invalid={fieldState.invalid}
                                            {...field}
                                            className="max-w-xl px-3 py-4.5"
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
                                            aria-invalid={fieldState.invalid}
                                            {...field}
                                            className="max-w-xl px-3 py-4.5"
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
                            name="confirmPassword"
                            control={form.control}
                            render={({ field, fieldState }) => {
                                return (
                                    <Field
                                        data-invalid={fieldState.invalid}
                                        className="gap-2"
                                    >
                                        <FieldLabel htmlFor={field.name}>
                                            Confirm Password
                                        </FieldLabel>

                                        <Input
                                            type="password"
                                            aria-invalid={fieldState.invalid}
                                            {...field}
                                            className="max-w-xl px-3 py-4.5"
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
                            <FieldError errors={[form.formState.errors.root]} />
                        )}

                        <Button
                            className="py-4.5 px-3 mt-4 text-base font-semibold cursor-pointer"
                            type="submit"
                        >
                            Create Account
                        </Button>
                    </FieldGroup>
                </form>

                <div className="px-6 text-center mt-3">
                    Already have an account? <Link to="/auth/login">Login</Link>
                </div>
            </CardContent>
        </Card>
    );
}
