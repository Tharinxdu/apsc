document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const loading = form.querySelector(".loading");
  const errorBox = form.querySelector(".error-message");
  const sentBox = form.querySelector(".sent-message");

  function setState({ isLoading, error, sent }) {
    if (loading) loading.style.display = isLoading ? "block" : "none";
    if (errorBox) {
      errorBox.style.display = error ? "block" : "none";
      errorBox.textContent = error || "";
    }
    if (sentBox) sentBox.style.display = sent ? "block" : "none";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = form.querySelector('input[name="name"]')?.value?.trim();
    const email = form.querySelector('input[name="email"]')?.value?.trim();
    const subject = form.querySelector('input[name="subject"]')?.value?.trim();
    const message = form.querySelector('textarea[name="message"]')?.value?.trim();

    setState({ isLoading: true, error: null, sent: false });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data?.message || "Failed to send message.");
      }

      setState({ isLoading: false, error: null, sent: true });
      form.reset();
    } catch (err) {
      setState({
        isLoading: false,
        error: err?.message || "Failed to send message. Please try again.",
        sent: false,
      });
    }
  });
});