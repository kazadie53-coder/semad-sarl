// Indicatifs internationaux pour le formulaire de candidature SEMAD SARL.
(function () {
  const select = document.getElementById('career-country-code');
  const local = document.getElementById('career-local-phone');
  const full = document.getElementById('career-full-phone');
  const form = document.getElementById('career-form');
  if (!select || !local || !full || !form) return;

  function syncPhone() {
    const dial = select.value === 'custom' ? '' : select.value;
    const raw = local.value.trim();
    full.value = (dial ? dial + ' ' : '') + raw;
    if (select.value === 'custom') {
      local.placeholder = 'Numéro complet, ex. +243 999 123 456';
    } else {
      local.placeholder = 'Numéro sans indicatif';
    }
  }
  select.addEventListener('change', syncPhone);
  local.addEventListener('input', syncPhone);
  // Capture: remplir le champ transmis avant le traitement de l'envoi.
  form.addEventListener('submit', function (event) {
    syncPhone();
    if (select.value === 'custom' && !/^\\+[1-9]\\d{0,3}[\\s-]?\\d{5,}/.test(local.value.trim())) {
      event.preventDefault();
      event.stopImmediatePropagation();
      local.setCustomValidity('Saisissez un numéro international complet commençant par + et son indicatif.');
      local.reportValidity();
      return;
    }
    local.setCustomValidity('');
  }, true);
  local.addEventListener('input', function () { local.setCustomValidity(''); });

  // Chargement des pays et territoires et de leurs indicatifs depuis une source publique.
  fetch('https://restcountries.com/v3.1/all?fields=name,idd,cca2,translations', {cache:'force-cache'})
    .then(function (response) { if (!response.ok) throw new Error('Country list unavailable'); return response.json(); })
    .then(function (countries) {
      const rows = [];
      countries.forEach(function (country) {
        const root = country.idd && country.idd.root;
        if (!root) return;
        const suffixes = country.idd.suffixes && country.idd.suffixes.length ? country.idd.suffixes : [''];
        const name = (country.translations && country.translations.fra && country.translations.fra.common) || (country.name && country.name.common) || country.cca2;
        suffixes.forEach(function (suffix) { rows.push({name:name,code:root + suffix}); });
      });
      rows.sort(function(a,b){return a.name.localeCompare(b.name,'fr');});
      const previous = select.value;
      select.replaceChildren();
      rows.forEach(function (row) {
        const option = document.createElement('option');
        option.value = row.code;
        option.textContent = row.name + ' (' + row.code + ')';
        select.appendChild(option);
      });
      const other = document.createElement('option');
      other.value = 'custom';
      other.textContent = 'Autre indicatif (saisie manuelle)';
      select.appendChild(other);
      select.value = previous;
      if (select.selectedIndex < 0) select.value = '+243';
      syncPhone();
    })
    .catch(function () { syncPhone(); });
  syncPhone();
})();
