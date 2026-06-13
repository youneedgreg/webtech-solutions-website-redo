// Shared Web3Forms submission helper for the contact form, quote form and AI lead chat.
// Get a free access key at https://web3forms.com (no account needed, key is emailed to you)
// and paste it below.
window.WebtechForms = (function () {
  const ACCESS_KEY = 'YOUR_WEB3FORMS_ACCESS_KEY';

  async function submit(fields) {
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.assign({ access_key: ACCESS_KEY }, fields)),
      });
      const json = await res.json();
      return !!json.success;
    } catch (err) {
      return false;
    }
  }

  return { submit };
})();
