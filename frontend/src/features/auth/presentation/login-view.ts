import { h } from "../../../shared/dom.js";
import { createField } from "../../../shared/form-field.js";
import { icon } from "../../../shared/icons.js";

export interface LoginFormCallbacks {
  onSubmit(email: string, password: string): Promise<void>;
  onNavigateRegister(): void;
}

export function buildLoginForm(callbacks: LoginFormCallbacks): HTMLElement {
  const emailField = createField({
    label: "Email",
    type: "email",
    name: "email",
    placeholder: "you@example.com",
    required: true,
    autoFocus: true,
    autocomplete: "email",
  });

  const passwordField = createField({
    label: "Password",
    type: "password",
    name: "password",
    placeholder: "••••••••",
    required: true,
    autocomplete: "current-password",
  });

  const banner = h("p", { class: "field-error", style: "text-align:center; margin-bottom: 4px;" });

  const submitButton = h(
    "button",
    { class: "btn btn-primary btn-block", type: "submit" },
    ["Log in", icon("arrow-right", 16)]
  );

  const form = h(
    "form",
    {
      class: "form",
      style: "display:flex; flex-direction:column; gap: 16px;",
      onsubmit: async (e: SubmitEvent) => {
        e.preventDefault();
        emailField.setError("");
        passwordField.setError("");
        banner.textContent = "";
        submitButton.setAttribute("disabled", "");
        submitButton.replaceChildren(h("span", { class: "spinner btn-spinner" }), "Logging in…");
        try {
          await callbacks.onSubmit(emailField.input.value.trim(), passwordField.input.value);
        } catch (err) {
          banner.textContent = err instanceof Error ? err.message : "Something went wrong";
        } finally {
          submitButton.removeAttribute("disabled");
          submitButton.replaceChildren("Log in", icon("arrow-right", 16));
        }
      },
    },
    [emailField.root, passwordField.root, banner, submitButton]
  );

  const switchLine = h("p", { class: "auth-switch" }, [
    "New here? ",
    h("button", { class: "link-button", type: "button", onclick: callbacks.onNavigateRegister }, "Create an account"),
  ]);

  return h("div", {}, [form, switchLine]);
}
