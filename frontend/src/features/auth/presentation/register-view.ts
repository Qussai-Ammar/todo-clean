import { h } from "../../../shared/dom.js";
import { createField } from "../../../shared/form-field.js";
import { icon } from "../../../shared/icons.js";

export interface RegisterFormCallbacks {
  onSubmit(name: string, email: string, password: string): Promise<void>;
  onNavigateLogin(): void;
}

export function buildRegisterForm(callbacks: RegisterFormCallbacks): HTMLElement {
  const nameField = createField({
    label: "Full name",
    name: "name",
    placeholder: "Ada Lovelace",
    required: true,
    autoFocus: true,
    autocomplete: "name",
  });

  const emailField = createField({
    label: "Email",
    type: "email",
    name: "email",
    placeholder: "you@example.com",
    required: true,
    autocomplete: "email",
  });

  const passwordField = createField({
    label: "Password",
    type: "password",
    name: "password",
    placeholder: "At least 8 characters",
    required: true,
    minLength: 8,
    autocomplete: "new-password",
  });

  const banner = h("p", { class: "field-error", style: "text-align:center; margin-bottom: 4px;" });

  const submitButton = h("button", { class: "btn btn-primary btn-block", type: "submit" }, [
    "Create account",
    icon("arrow-right", 16),
  ]);

  const form = h(
    "form",
    {
      class: "form",
      style: "display:flex; flex-direction:column; gap: 16px;",
      onsubmit: async (e: SubmitEvent) => {
        e.preventDefault();
        banner.textContent = "";

        if (passwordField.input.value.length < 8) {
          passwordField.setError("Password must be at least 8 characters");
          return;
        }
        passwordField.setError("");

        submitButton.setAttribute("disabled", "");
        submitButton.replaceChildren(h("span", { class: "spinner btn-spinner" }), "Creating account…");
        try {
          await callbacks.onSubmit(
            nameField.input.value.trim(),
            emailField.input.value.trim(),
            passwordField.input.value
          );
        } catch (err) {
          banner.textContent = err instanceof Error ? err.message : "Something went wrong";
        } finally {
          submitButton.removeAttribute("disabled");
          submitButton.replaceChildren("Create account", icon("arrow-right", 16));
        }
      },
    },
    [nameField.root, emailField.root, passwordField.root, banner, submitButton]
  );

  const switchLine = h("p", { class: "auth-switch" }, [
    "Already have an account? ",
    h("button", { class: "link-button", type: "button", onclick: callbacks.onNavigateLogin }, "Log in"),
  ]);

  return h("div", {}, [form, switchLine]);
}
