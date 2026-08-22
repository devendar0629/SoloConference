import { Video, Keyboard, Users, Loader2Icon } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useStore } from "@/store";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import {
    generateMeetingLinkFormSchema,
    type GenerateMeetingLinkFormData
} from "@/schemas/generate-meeting-link";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel
} from "@/components/ui/field";
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { createConference } from "@/api/conference";
import {
    joinConferenceFormSchema,
    type JoinConferenceFormData
} from "@/schemas/join-conference";
import { toast } from "sonner";
import { logoutUser } from "@/api/auth";

type GenerateMeetingLinkAPIResponse = {
    meetingCode: string;
};

const GenerateMeetingLinkButton: React.FC = () => {
    const navigate = useNavigate();

    const generateMeetingLinkForm = useForm<GenerateMeetingLinkFormData>({
        defaultValues: {
            title: ""
        },
        resolver: zodResolver(generateMeetingLinkFormSchema)
    });

    const {
        mutateAsync: generateMeetingLinkMutation,
        isPending: isGeneratingMeetingLink
    } = useMutation<
        GenerateMeetingLinkAPIResponse,
        unknown,
        GenerateMeetingLinkFormData
    >({
        mutationKey: ["conference", "generate-meeting-link"],
        mutationFn: createConference
    });

    const handleGenerateMeetingLink: SubmitHandler<
        GenerateMeetingLinkFormData
    > = async (data) => {
        try {
            const response = await generateMeetingLinkMutation(data);

            if (response?.meetingCode) {
                navigate(`/conference/${response.meetingCode}`);
            }
        } catch (error) {
            console.error("Error generating meeting link:", error);
        }
    };

    return (
        <Dialog>
            <DialogTrigger
                render={
                    <Button
                        type="button"
                        className="w-full py-6 text-base font-medium"
                    >
                        Generate Meeting Link
                    </Button>
                }
            />

            <DialogContent className="sm:max-w-sm">
                <form
                    onSubmit={generateMeetingLinkForm.handleSubmit(
                        handleGenerateMeetingLink
                    )}
                    className="space-y-5"
                >
                    <DialogHeader>
                        <DialogTitle>Generate Meeting Link</DialogTitle>

                        <DialogDescription>
                            Give your meeting a title and generate a link.
                        </DialogDescription>
                    </DialogHeader>

                    <FieldGroup>
                        <Controller
                            name="title"
                            control={generateMeetingLinkForm.control}
                            render={({ field, fieldState }) => {
                                return (
                                    <Field
                                        data-invalid={fieldState.invalid}
                                        className="gap-2"
                                    >
                                        <FieldLabel htmlFor={field.name}>
                                            Title
                                        </FieldLabel>

                                        <Input
                                            aria-invalid={fieldState.invalid}
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
                    </FieldGroup>

                    <DialogFooter>
                        <DialogClose
                            render={
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            }
                        />

                        <Button
                            disabled={isGeneratingMeetingLink}
                            type="submit"
                        >
                            Generate
                            {isGeneratingMeetingLink && (
                                <Loader2Icon className="animate-spin" />
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

const JoinConferenceForm: React.FC = () => {
    const navigate = useNavigate();

    const conferenceCodeOrLinkForm = useForm<JoinConferenceFormData>({
        defaultValues: {
            conferenceCodeOrLink: ""
        },
        resolver: zodResolver(joinConferenceFormSchema)
    });

    const handleJoinConference: SubmitHandler<JoinConferenceFormData> = (
        data
    ) => {
        navigate(`/conference/${data.conferenceCodeOrLink}`);
    };

    return (
        <form
            onSubmit={conferenceCodeOrLinkForm.handleSubmit(
                handleJoinConference
            )}
            className="flex gap-2"
        >
            <FieldGroup>
                <Controller
                    name="conferenceCodeOrLink"
                    control={conferenceCodeOrLinkForm.control}
                    render={({ field, fieldState }) => {
                        return (
                            <Field
                                data-invalid={fieldState.invalid}
                                className="gap-2"
                            >
                                <Input
                                    aria-invalid={fieldState.invalid}
                                    {...field}
                                    placeholder="Enter code or link"
                                    className="w-full py-5.5 px-4.5 placeholder:text-base"
                                />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        );
                    }}
                />
            </FieldGroup>

            <Button type="submit" className="py-6 px-6 text-base font-medium">
                Join
            </Button>
        </form>
    );
};

const UserProfilePopover: React.FC = () => {
    const { user, logout: storeLogout } = useStore((state) => state.auth);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logoutUser();
            storeLogout();

            navigate("/login");
        } catch {
            toast.error("Failed to log out. Please try again.");
            return;
        }
    };

    return (
        <Popover>
            <PopoverTrigger
                render={
                    <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=312e81&color=c7d2fe`}
                        alt={user?.name || "User avatar"}
                        className="h-full w-full object-cover cursor-pointer"
                    />
                }
            />

            <PopoverContent className="w-64">
                <PopoverHeader>
                    <PopoverTitle className="text-lg font-semibold">
                        {user?.name || "User Account"}
                    </PopoverTitle>

                    <PopoverDescription className="text-sm text-gray-500 truncate">
                        {user?.email || "No email available"}
                    </PopoverDescription>
                </PopoverHeader>

                <div className="border-t border-gray-200 pt-4">
                    <Button
                        className="cursor-pointer"
                        variant={"destructive"}
                        type="button"
                        size="lg"
                        onClick={handleLogout}
                    >
                        Log out
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default function SoloConferenceDashboard() {
    const { user } = useStore((state) => state.auth);

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-indigo-500/30">
            {/* Top Navigation */}
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-6 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                        <Users size={20} />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-zinc-50">
                        SoloConf
                    </span>
                </div>

                <div className="size-8 overflow-hidden rounded-full border border-slate-400">
                    <UserProfilePopover />
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-6 py-12">
                {/* Welcome Section */}
                <div className="mb-10">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
                        Welcome back, {user?.name}
                    </h1>

                    <p className="mt-2 text-zinc-400">
                        Ready for your next 1-on-1 session?
                    </p>
                </div>

                {/* Primary Actions Grid */}
                <div className="flex flex-col gap-10">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Instant Conference Card */}
                        <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 p-8 shadow-sm transition-all hover:border-zinc-700">
                            <div className="relative z-10 mb-8">
                                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                                    <Video size={28} />
                                </div>

                                <h2 className="mb-3 text-2xl font-semibold text-zinc-50">
                                    Instant Conference
                                </h2>

                                <p className="text-zinc-400 leading-relaxed">
                                    Start a secure 1-on-1 meeting immediately.
                                    Generate a room link to share with your
                                    guest.
                                </p>
                            </div>

                            <GenerateMeetingLinkButton />
                        </div>

                        {/* Join Conference Card */}
                        <div className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-8 shadow-sm transition-all hover:border-zinc-700">
                            <div className="mb-8">
                                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-800 text-zinc-300">
                                    <Keyboard size={28} />
                                </div>

                                <h2 className="mb-3 text-2xl font-semibold text-zinc-50">
                                    Join Conference
                                </h2>

                                <p className="text-zinc-400 leading-relaxed">
                                    Already have a room code? Enter it below or
                                    paste the full link to join an existing
                                    session.
                                </p>
                            </div>

                            <JoinConferenceForm />
                        </div>
                    </div>

                    <Link
                        className="flex gap-3 justify-baseline text-base text-zinc-300 mx-auto underline-offset-4 hover:text-indigo-600 transition-colors"
                        to="/conferences"
                    >
                        <p className="underline">Go to your conferences</p>
                        <p className="text-2xl">&rarr;</p>
                    </Link>
                </div>
            </main>
        </div>
    );
}
