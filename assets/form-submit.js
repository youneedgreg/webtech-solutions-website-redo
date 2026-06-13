// Shared Web3Forms submission helper for the contact form, quote form and AI lead chat.
window.WebtechForms = (function () {
  const ACCESS_KEY = '59c01431-467f-4de4-9974-3298e79fa4b8';

  async function submit(fields) {
    const formData = new FormData();
    formData.append('access_key', ACCESS_KEY);
    Object.keys(fields).forEach((key) => {
      if (fields[key] !== undefined && fields[key] !== null) formData.append(key, fields[key]);
    });

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData,
      });
      const json = await res.json();
      return !!json.success;
    } catch (err) {
      return false;
    }
  }

  return { submit };
})();
