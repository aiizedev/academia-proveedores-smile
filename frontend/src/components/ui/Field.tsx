import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";
import { Icon } from "@/components/icons";
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

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string | null;
  placeholder: string;
  options: ReadonlyArray<{ value: string; label: string; disabled?: boolean }>;
}

/** GUIA_VISUAL §8.2 — lista con <select> nativo y la anatomía del Input. */
export function SelectField({ label, error, placeholder, options, className, id, ...rest }: SelectFieldProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const noteId = `${selectId}-nota`;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={selectId} className="text-app-small font-bold">
        {label}
      </label>
      <div className="relative">
        <select
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? noteId : undefined}
          className={cn(
            "h-14 w-full appearance-none rounded-control border-[1.5px] border-line bg-white pr-12 pl-4 text-app-answer text-ink",
            "transition-[border-color,box-shadow] duration-[var(--dur-s)] outline-none disabled:bg-cream-200 disabled:text-ink-faint",
            "focus:border-olive-600 focus:shadow-[var(--ring-field-focus)]",
            error && "border-rose-700",
          )}
          {...rest}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
        <span aria-hidden className="pointer-events-none absolute inset-y-0 right-4 flex rotate-90 items-center text-ink-soft">
          <Icon name="arrow" size="1.1rem" />
        </span>
      </div>
      {error ? (
        <p id={noteId} className="text-app-caption font-bold text-rose-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
