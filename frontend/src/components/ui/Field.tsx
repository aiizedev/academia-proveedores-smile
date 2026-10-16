import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/* GUIA_VISUAL §8.2 — campo de texto. Etiqueta arriba, input de 3.5rem (56 px),
   foco con borde oliva + anillo; el error se anuncia con aria-describedby. */
export interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: ReactNode;
  error?: string | null;
  trailing?: ReactNode;
}

export function Field({ label, hint, error, trailing, className, id, ...rest }: FieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const noteId = `${inputId}-nota`;
  const note = error ?? hint;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={inputId} className="text-app-small font-bold">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={note ? noteId : undefined}
          className={cn(
            "h-14 w-full rounded-control border-[1.5px] border-line bg-white px-4 text-app-answer text-ink",
            "transition-[border-color,box-shadow] duration-[var(--dur-s)] outline-none",
            "focus:border-olive-600 focus:shadow-[var(--ring-field-focus)]",
            error && "border-rose-700",
            trailing ? "pr-28" : null,
          )}
          {...rest}
        />
        {trailing ? <div className="absolute inset-y-0 right-1 flex items-center">{trailing}</div> : null}
      </div>
      {note ? (
        <p id={noteId} className={cn("text-app-caption", error ? "font-bold text-rose-700" : "text-ink-soft")}>
          {note}
        </p>
      ) : null}
    </div>
  );
}
