import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Home, MoveLeft } from "lucide-react";

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden bg-background px-6 py-24 sm:py-32 lg:px-8">
            {/* Background glowing gradient effect */}
            <div className="absolute inset-0 -z-10 mx-0 max-w-none overflow-hidden pointer-events-none">
                <div className="absolute left-1/2 top-1/2 -z-10 h-160 w-7xl -translate-x-1/2 -translate-y-1/2 opacity-20">
                    <div className="absolute inset-0 bg-linear-to-r from-primary/40 via-purple-500/20 to-primary/40 blur-[100px]" />
                </div>
            </div>

            <div className="mx-auto max-w-2xl text-center relative z-10">
                <h1 className="text-9xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-foreground to-foreground/50 drop-shadow-sm">
                    404
                </h1>

                <h2 className="mt-8 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    Page not found
                </h2>

                <p className="mt-4 text-base leading-7 text-muted-foreground max-w-md mx-auto">
                    Sorry, we couldn't find the page you're looking for. The
                    link you followed might be broken, or the page may have been
                    removed.
                </p>

                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button
                        onClick={() => navigate("/")}
                        size="lg"
                        className="w-full sm:w-auto"
                    >
                        <Home className="mr-2 h-4 w-4" />
                        Back to Home
                    </Button>

                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => navigate(-1)}
                        className="w-full sm:w-auto bg-background/50 backdrop-blur-sm"
                    >
                        <MoveLeft className="mr-2 h-4 w-4" />
                        Go Back
                    </Button>
                </div>
            </div>
        </div>
    );
}
