import { h } from "../../../shared/dom.js";
import { icon } from "../../../shared/icons.js";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

export interface OtpFormCallbacks {
  email: string;
  onSubmit(code: string): Promise<void>;
  onResend(): Promise<void>;
  onBack(): void;
}

export function buildOtpForm(callbacks: OtpFormCallbacks): HTMLElement {
  const banner = h("p", { class: "field-error", style: "text-align:center; margin-bottom: 4px;" });

  const inputs: HTMLInputElement[] = Array.from({ length: CODE_LENGTH }, (_, index) =>
    h("input", {
      class: "input",
      inputmode: "numeric",
      pattern: "[0-9]*",
      maxlength: "1",
      "aria-label": `Digit ${index + 1}`,
    }) as HTMLInputElement
  );

  function currentCode(): string {
    return inputs.map((input) => input.value).join("");
  }

  function focusEmpty(): void {
    (inputs.find((input) => !input.value) ?? inputs[CODE_LENGTH - 1]).focus();
  }

  const submitButton = h("button", { class: "btn btn-primary btn-block", type: "submit" }, [
    "Verify",
    icon("arrow-right", 16),
  ]);

  async function trySubmit(): Promise<void> {
    const code = currentCode();
    if (code.length !== CODE_LENGTH) return;

    banner.textContent = "";
    inputs.forEach((input) => (input.disabled = true));
    submitButton.setAttribute("disabled", "");
    submitButton.replaceChildren(h("span", { class: "spinner btn-spinner" }), "Verifying…");

    try {
      await callbacks.onSubmit(code);
    } catch (err) {
      banner.textContent = err instanceof Error ? err.message : "Something went wrong";
      inputs.forEach((input) => {
        input.disabled = false;
        input.value = "";
      });
      inputs[0].focus();
    } finally {
      submitButton.removeAttribute("disabled");
      submitButton.replaceChildren("Verify", icon("arrow-right", 16));
    }
  }

  inputs.forEach((input, index) => {
    input.addEventListener("input", () => {
      input.value = input.value.replace(/\D/g, "").slice(0, 1);
      if (input.value && index < CODE_LENGTH - 1) {
        inputs[index + 1].focus();
      }
      if (currentCode().length === CODE_LENGTH) {
        void trySubmit();
      }
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !input.value && index > 0) {
        inputs[index - 1].focus();
      }
    });

    input.addEventListener("paste", (e) => {
      e.preventDefault();
      const pasted = (e.clipboardData?.getData("text") ?? "").replace(/\D/g, "").slice(0, CODE_LENGTH);
      pasted.split("").forEach((digit, i) => {
        if (inputs[i]) inputs[i].value = digit;
      });
      focusEmpty();
      if (currentCode().length === CODE_LENGTH) {
        void trySubmit();
      }
    });
  });

  const resendLabel = h("span", {}, `Resend code in 0:${RESEND_COOLDOWN_SECONDS}`);
  const resendButton = h(
    "button",
    { class: "link-button", type: "button", disabled: true },
    resendLabel
  ) as HTMLButtonElement;

  let secondsLeft = RESEND_COOLDOWN_SECONDS;
  const tick = () => {
    secondsLeft -= 1;
    if (secondsLeft <= 0) {
      resendButton.disabled = false;
      resendLabel.textContent = "Resend code";
      clearInterval(timer);
    } else {
      resendLabel.textContent = `Resend code in 0:${secondsLeft.toString().padStart(2, "0")}`;
    }
  };
  const timer = setInterval(tick, 1000);

  resendButton.addEventListener("click", async () => {
    resendButton.disabled = true;
    try {
      await callbacks.onResend();
      inputs.forEach((input) => (input.value = ""));
      inputs[0].focus();
      secondsLeft = RESEND_COOLDOWN_SECONDS;
      resendLabel.textContent = `Resend code in 0:${secondsLeft}`;
      setInterval(tick, 1000);
    } catch (err) {
      banner.textContent = err instanceof Error ? err.message : "Could not resend the code";
      resendButton.disabled = false;
      resendLabel.textContent = "Resend code";
    }
  });

  const form = h(
    "form",
    {
      style: "display:flex; flex-direction:column; gap: 20px;",
      onsubmit: (e: SubmitEvent) => {
        e.preventDefault();
        void trySubmit();
      },
    },
    [
      h("div", { class: "otp-inputs" }, inputs),
      banner,
      submitButton,
      h("p", { class: "auth-switch" }, [resendButton]),
      h(
        "p",
        { class: "auth-switch" },
        h("button", { class: "link-button", type: "button", onclick: callbacks.onBack }, "Use a different email")
      ),
    ]
  );

  queueMicrotask(() => inputs[0].focus());

  return form;
}
