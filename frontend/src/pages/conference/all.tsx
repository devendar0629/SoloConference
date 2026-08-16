import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
    ArrowLeft,
    CalendarDays,
    Sparkles,
    Copy,
    Check,
    ExternalLink,
    Video,
    Clock,
    Plus,
    RefreshCw,
    Loader2Icon
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import {
    createConference,
    getAllConferences,
    type Conference
} from "@/api/conference";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
    generateMeetingLinkFormSchema,
    type GenerateMeetingLinkFormData
} from "@/schemas/generate-meeting-link";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDate } from "@/utils";
import { toast } from "sonner";

type GenerateMeetingLinkAPIResponse = {
    meetingCode: string;
};

// Copy to Clipboard Button Component with state feedback
function CopyCodeButton({ code }: { code: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1250);
    };

    return (
        <Button
            onClick={handleCopy}
            variant="outline"
            size="sm"
            className="w-fit gap-2 py-4"
        >
            {copied ? (
                <>
                    <Check className="size-3.5 text-green-400" />
                    <span className="text-green-400">Copied!</span>
                </>
            ) : (
                <>
                    <Copy className="size-3.5" />
                    <span>Copy Code</span>
                </>
            )}
        </Button>
    );
}

const NewRoomButton = () => {
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

                toast.success("Meeting link generated successfully!", {
                    description: `Your meeting link is ready. You can now join the conference room.`,
                    duration: 4000
                });
            }
        } catch (error) {
            console.error("Error generating meeting link:", error);
            toast.error("Failed to generate meeting link.");
        }
    };

    return (
        <Dialog>
            <DialogTrigger
                render={
                    <Button className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 pl-3 pr-3.25 h-9 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/25 active:scale-95">
                        <Plus className="size-4" />
                        <span className="hidden sm:inline">New Room</span>
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

export default function AllConferences() {
    const {
        data: conferences = [],
        isPending,
        isError,
        refetch
    } = useQuery<Conference[]>({
        queryKey: ["conferences", "all"],
        queryFn: getAllConferences
    });

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-50 selection:bg-indigo-500/30 selection:text-indigo-200">
            {/* Header Zone */}
            <header className="sticky top-0 z-10 border-b border-zinc-800/80 bg-zinc-950/80 px-6 py-5 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
                    <div>
                        <Link
                            to="/dashboard"
                            className="mb-2 inline-flex items-center gap-2 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-100"
                        >
                            <ArrowLeft className="size-3.5" />
                            Back to dashboard
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 ring-1 ring-indigo-500/30">
                                <Sparkles className="size-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold tracking-tight text-zinc-50 sm:text-2xl">
                                    Your Conferences
                                </h1>
                                <p className="text-xs text-zinc-400 sm:text-sm">
                                    Manage, review, and quickly jump back into
                                    your meeting spaces.
                                </p>
                            </div>
                        </div>
                    </div>

                    <NewRoomButton />
                </div>
            </header>

            {/* Main Content Area */}
            <main className="mx-auto max-w-7xl px-6 py-10">
                {/* Skeleton Loading State */}
                {isPending && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div
                                key={index}
                                className="flex flex-col justify-between rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-6 backdrop-blur-sm"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="h-5 w-20 animate-pulse rounded-full bg-zinc-800" />
                                        <div className="h-6 w-24 animate-pulse rounded-md bg-zinc-800" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-6 w-3/4 animate-pulse rounded bg-zinc-800" />
                                        <div className="h-4 w-full animate-pulse rounded bg-zinc-800/60" />
                                    </div>
                                </div>
                                <div className="mt-8 space-y-3 pt-4 border-t border-zinc-800/40">
                                    <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-800/50" />
                                    <div className="h-9 w-full animate-pulse rounded-lg bg-zinc-800" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Error State */}
                {!isPending && isError && (
                    <Card className="mx-auto max-w-md border-red-900/50 bg-red-950/20 text-center shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-lg text-red-200">
                                Failed to load conferences
                            </CardTitle>
                            <CardDescription className="text-red-300/70">
                                We ran into a problem syncing your meeting
                                rooms. Please check your connection and try
                                again.
                            </CardDescription>
                        </CardHeader>
                        <CardFooter className="justify-center">
                            <button
                                type="button"
                                onClick={() => refetch()}
                                className="inline-flex items-center gap-2 rounded-lg border border-red-800/60 bg-red-900/40 px-4 py-2 text-sm font-medium text-red-100 transition-colors hover:bg-red-900/60 active:scale-95"
                            >
                                <RefreshCw className="size-4" />
                                Try again
                            </button>
                        </CardFooter>
                    </Card>
                )}

                {/* Empty State */}
                {!isPending && !isError && conferences.length === 0 && (
                    <Card className="mx-auto max-w-md border-zinc-800/80 bg-zinc-900/40 text-center p-8 backdrop-blur-sm">
                        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-zinc-800/80 text-zinc-400">
                            <Video className="size-6" />
                        </div>
                        <CardHeader className="p-0">
                            <CardTitle className="text-xl text-zinc-100">
                                No conferences found
                            </CardTitle>
                            <CardDescription className="mt-1 text-zinc-400">
                                You haven't hosted or joined any conference
                                spaces yet.
                            </CardDescription>
                        </CardHeader>
                        <CardFooter className="mt-6 justify-center p-0">
                            <Link
                                to="/dashboard"
                                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-indigo-500 active:scale-95"
                            >
                                <Plus className="size-4" />
                                Create your first room
                            </Link>
                        </CardFooter>
                    </Card>
                )}

                {/* Grid List */}
                {!isPending && !isError && conferences.length > 0 && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {conferences.map((conference) => {
                            const roomCode = conference.id;
                            const roomUrl = `/conference/${roomCode}`;

                            return (
                                <Card
                                    key={conference.id}
                                    className="group relative flex flex-col justify-between overflow-hidden border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/80 hover:shadow-xl gap-0 hover:shadow-black/40"
                                >
                                    {/* Card Header & Badges */}
                                    <CardHeader className="space-y-3 pb-3">
                                        <CardTitle className="line-clamp-1 text-lg font-semibold text-zinc-100 transition-colors group-hover:text-indigo-300">
                                            {conference.title ??
                                                "Untitled Conference"}
                                        </CardTitle>
                                    </CardHeader>

                                    {/* Card Details Body */}
                                    <CardContent className="space-y-2 py-2 text-xs text-zinc-400">
                                        <div className="flex items-center gap-2">
                                            <CalendarDays className="size-3.5 text-zinc-500" />

                                            <span>
                                                Created:{" "}
                                                {formatDate(
                                                    conference.createdAt
                                                )}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Clock className="size-3.5 text-zinc-500" />
                                            <span>
                                                Updated:{" "}
                                                {formatDate(
                                                    conference.updatedAt
                                                )}
                                            </span>
                                        </div>
                                    </CardContent>

                                    {/* Card Footer Actions */}
                                    <CardFooter className="gap-2 flex border-t border-zinc-800/60">
                                        <CopyCodeButton code={roomCode} />

                                        <Button variant={"link"}>
                                            <Link
                                                className="flex gap-2 justify-center"
                                                to={roomUrl}
                                            >
                                                <div className="flex gap-2 justify-center">
                                                    Enter Room
                                                    <ExternalLink className="size-4 mt-px" />
                                                </div>
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
