import { cn } from "../../lib/utils";

export function Card({ children, className, ...props }) {
    return (
        <div
            className={cn(
                "glass rounded-xl p-6 shadow-sm",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className, ...props }) {
    return (
        <div className={cn("flex flex-col space-y-1.5 pb-4", className)} {...props}>
            {children}
        </div>
    )
}

export function CardTitle({ children, className, ...props }) {
    return (
        <h3 className={cn("font-semibold leading-none tracking-tight text-lg", className)} {...props}>
            {children}
        </h3>
    )
}

export function CardContent({ children, className, ...props }) {
    return (
        <div className={cn("", className)} {...props}>
            {children}
        </div>
    );
}
