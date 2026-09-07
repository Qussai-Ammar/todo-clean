import { h } from "./dom.js";

export interface FieldOptions {
  label: string;
  type?: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  autoFocus?: boolean;
  autocomplete?: string;
  value?: string;
}

export interface Field {
  root: HTMLElement;
  input: HTMLInputElement;
  setError(message: string): void;
}

export function createField(options: FieldOptions): Field {
  const input = h("input", {
    class: "input",
    type: options.type ?? "text",
    name: options.name,
    placeholder: options.placeholder ?? "",
    required: options.required ?? false,
    minlength: options.minLength,
    autocomplete: options.autocomplete,
    value: options.value ?? "",
  }) as HTMLInputElement;

  const errorEl = h("p", { class: "field-error", role: "alert" });

  const root = h("label", { class: "field" }, [h("span", { class: "field-label" }, options.label), input, errorEl]);

  if (options.autoFocus) {
    queueMicrotask(() => input.focus());
  }

  return {
    root,
    input,
    setError(message: string) {
      errorEl.textContent = message;
      input.classList.toggle("has-error", Boolean(message));
    },
  };
}
