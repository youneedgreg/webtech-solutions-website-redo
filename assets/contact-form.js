(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const status = document.getElementById('contactStatus');
  const btn = form.querySelector('button[type="submit"]');
  const btnLabel = btn.innerHTML;

  function showStatus(ok) {
    status.hidden = false;
    status.className = 'form-status ' + (ok ? 'is-success' : 'is-error');
    status.textContent = ok
      ? "Asante! Your message is on its way — we'll reply within one business day."
      : "Sorry, something went wrong sending your message. Please try again, or message us on WhatsApp instead.";
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Sending…';
    status.hidden = true;

    const fd = new FormData(form);
    const fields = {
      subject: 'New message from the Webtech Solutions contact form',
      from_name: fd.get('name') || 'Website visitor',
    };
    fd.forEach((value, key) => {
      if (key !== 'botcheck') fields[key] = value;
    });

    const ok = await window.WebtechForms.submit(fields);
    showStatus(ok);
    if (ok) form.reset();

    btn.disabled = false;
    btn.innerHTML = btnLabel;
  });
})();
