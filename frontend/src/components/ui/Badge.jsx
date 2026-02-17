import { cn } from "../../lib/utils";

const variants = {
    default: "bg-primary/20 text-primary border-primary/30", // Blue
    success: "bg-accent/20 text-accent border-accent/30", // Green/Emerald
    warning: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30", // Yellow
    danger: "bg-red-500/20 text-red-500 border-red-500/30", // Red
    neutral: "bg-secondary/20 text-secondary border-secondary/30", // Slate
};

export function Badge({ children, variant = "default", className, ...props }) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
}
