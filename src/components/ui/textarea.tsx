import { Label } from "@/components/ui/label";

type TextareaProps = {
  id: string;
  label?: string;
  error?: string;
  required?: boolean;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ id, label, error, required, className = "", ...props }: TextareaProps) {
  return (
    <div>
      {label && (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      )}
      <textarea
        id={id}
        className={[
          "w-full bg-zinc-800 border rounded-md px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 min-h-[80px] resize-y",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
          error ? "border-red-500" : "border-zinc-700",
          className,
        ].join(" ")}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        required={required}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
