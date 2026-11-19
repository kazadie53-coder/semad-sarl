// Indicatifs internationaux et villes pour le formulaire SEMAD SARL.
(function () {
  const select = document.getElementById('career-country-code');
  const local = document.getElementById('career-local-phone');
  const full = document.getElementById('career-full-phone');
  const form = document.getElementById('career-form');
  const city = document.getElementById('career-city');
  const cityList = document.getElementById('career-city-options');
  const cityHint = document.getElementById('career-city-hint');
  if (!select || !local || !full || !form) return;
  let countries = [];
  let currentCountry = 'Democratic Republic of the Congo';
  let cityRequest = 0;
  const cityCache = new Map();
  const initialCities = ['Kolwezi','Kinshasa','Lubumbashi','Mbujimayi','Likasi','Fungurume','Kananga','Goma','Bukavu','Kisangani'];
  function syncPhone() {
    const dial = select.value === 'custom' ? '' : select.value;
    full.value = (dial ? dial + ' ' : '') + local.value.trim();
    local.placeholder = select.value === 'custom' ? '+243 999 123 456' : 'Numéro de téléphone';
  }
  function showCities(items) {
    if (!cityList) return;
    cityList.replaceChildren();
    [...new Set(items)].sort((a,b)=>a.localeCompare(b,'fr')).forEach(function (name) {
      const option = document.createElement('option');
      option.value = name;
      cityList.appendChild(option);
    });
  }
  async function loadCities(countryName) {
    if (!cityList || !countryName) return;
    const request = ++cityRequest;
    if (cityCache.has(countryName)) {
      showCities(cityCache.get(countryName));
      cityHint.textContent = 'Recherchez une ville dans la liste ou saisissez une autre ville.';
      return;
    }
    cityHint.textContent = 'Chargement des villes du pays sélectionné…';
    try {
      const response = await fetch('https://countriesnow.space/api/v0.1/countries/cities', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({country:countryName})
      });
      if (!response.ok) throw new Error('Service indisponible');
      const result = await response.json();
      if (result.error || !Array.isArray(result.data)) throw new Error('Villes indisponibles');
      if (request !== cityRequest) return;
      cityCache.set(countryName, result.data);
      showCities(result.data);
      cityHint.textContent = 'Tapez le nom pour rechercher une ville ou saisissez librement une ville absente.';
    } catch(e) {
      if (request !== cityRequest) return;
      if (countryName === 'Democratic Republic of the Congo') showCities(initialCities);
      else showCities([]);
      cityHint.textContent = 'Liste indisponible : vous pouvez saisir librement votre ville.';
    }
  }
  select.addEventListener('change', function() {
    syncPhone();
    const chosen = countries.find(c=>c.code===select.value && c.name===select.selectedOptions[0]?.dataset.country);
    currentCountry = chosen ? chosen.name : '';
    if (city) city.value = '';
    if (chosen) loadCities(chosen.name);
    else {++cityRequest;showCities([]);cityHint.textContent='Saisissez le nom de votre ville.';}
  });
  local.addEventListener('input',function(){local.setCustomValidity('');syncPhone();});
  form.addEventListener('submit',function(event){
    syncPhone();
    if (select.value==='custom' && !/^\\+[1-9]\\d{0,3}[\\s-]?\\d{5,}/.test(local.value.trim())) {
      event.preventDefault();event.stopImmediatePropagation();
      local.setCustomValidity('Saisissez le numéro complet avec son indicatif (+...).');
      local.reportValidity();
    }
  },true);
  fetch('https://restcountries.com/v3.1/all?fields=name,idd,cca2,flags,translations',{cache:'force-cache'})
    .then(r=>{if(!r.ok)throw new Error('countries');return r.json();})
    .then(data=>{
      const rows=[];
      data.forEach(c=>{
        const root=c.idd?.root;
        if(!root)return;
        const suffixes=c.idd.suffixes?.length?c.idd.suffixes:[''];
        const fr=c.translations?.fra?.common||c.name?.common||c.cca2;
        const english=c.name?.common||fr;
        suffixes.forEach(suffix=>rows.push({label:fr,name:english,code:root+suffix,iso:c.cca2}));
      });
      rows.sort((a,b)=>a.label.localeCompare(b.label,'fr'));
      countries=rows;
      select.replaceChildren();
      rows.forEach(c=>{
        const option=document.createElement('option');
        option.value=c.code;option.dataset.country=c.name;
        option.textContent=c.label+' ('+c.code+')';
        select.appendChild(option);
      });
      const other=document.createElement('option');
      other.value='custom';other.textContent='Autre indicatif +';
      select.appendChild(other);
      const drc=rows.find(c=>c.iso==='CD');
      if(drc){const idx=rows.indexOf(drc);select.selectedIndex=idx;currentCountry=drc.name;loadCities(drc.name);}
      else {select.value='+243';loadCities(currentCountry);}
      syncPhone();
    })
    .catch(()=>{showCities(initialCities);cityHint.textContent='Choisissez une ville proposée ou saisissez librement votre ville.';syncPhone();});
  showCities(initialCities);
  syncPhone();
})();
