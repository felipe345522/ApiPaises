const countryInfoDiv = document.getElementById('country-info');
const countryInput = document.getElementById('country-input');
const favoritosDiv = document.getElementById('favoritos');

function showTab(id) {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(id).classList.add('active');
    if (id === 'tab-favoritos') loadFavoritos();
}

async function fetchCountryData(country) {
    const response = await fetch(`https://restcountries.com/v3.1/name/${country}`);
    const data = await response.json();

    if (data.status === 404) {
        countryInfoDiv.innerHTML = '<p>No se encontró el país. Intenta de nuevo.</p>';
        return;
    }

    displayCountryInfo(data);
}

function displayCountryInfo(data) {
    countryInfoDiv.innerHTML = '';

    data.forEach(country => {
        const countryElement = document.createElement('div');
        countryElement.classList.add('country');

        const countryFlag = country.flags.png;
        const countryName = country.name.common;
        const countryCapital = country.capital ? country.capital[0] : 'No disponible';
        const countryRegion = country.region;
        const countryPopulation = country.population.toLocaleString();

        countryElement.innerHTML = `
            <img src="${countryFlag}" alt="Bandera de ${countryName}">
            <h3>${countryName}</h3>
            <p><strong>Capital:</strong> ${countryCapital}</p>
            <p><strong>Región:</strong> ${countryRegion}</p>
            <p><strong>Población:</strong> ${countryPopulation}</p>
            <button onclick="agregarFavorito('${countryName}')">❤️ Agregar a Favoritos</button>
        `;

        countryInfoDiv.appendChild(countryElement);
    });
}

function searchCountry() {
    const country = countryInput.value.trim();
    if (country.length > 2) {
        fetchCountryData(country);
    } else {
        countryInfoDiv.innerHTML = '';
    }
}

function agregarFavorito(nombre) {
    let favoritos = JSON.parse(localStorage.getItem('favoritos') || '[]');
    if (!favoritos.includes(nombre)) {
        favoritos.push(nombre);
        localStorage.setItem('favoritos', JSON.stringify(favoritos));
        alert(`${nombre} agregado a favoritos`);
    }
}

async function loadFavoritos() {
    favoritosDiv.innerHTML = '';
    const favoritos = JSON.parse(localStorage.getItem('favoritos') || '[]');
    for (const nombre of favoritos) {
        const response = await fetch(`https://restcountries.com/v3.1/name/${nombre}`);
        const data = await response.json();
        displayFavorito(data[0]);
    }
}

function displayFavorito(country) {
    const div = document.createElement('div');
    div.classList.add('country');

    div.innerHTML = `
        <img src="${country.flags.png}" alt="Bandera de ${country.name.common}">
        <h3>${country.name.common}</h3>
        <p><strong>Capital:</strong> ${country.capital ? country.capital[0] : 'No disponible'}</p>
        <button onclick="eliminarFavorito('${country.name.common}')">❌ Eliminar de Favoritos</button>
    `;

    favoritosDiv.appendChild(div);
}

function eliminarFavorito(nombre) {
    let favoritos = JSON.parse(localStorage.getItem('favoritos') || '[]');
    favoritos = favoritos.filter(fav => fav !== nombre);
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    loadFavoritos();
}

// Pestaña 3: Cargar todos los países
async function cargarTodosLosPaises() {
    const contenedor = document.getElementById('todos-los-paises');
    contenedor.innerHTML = '<p>Cargando...</p>';
    const response = await fetch('https://restcountries.com/v3.1/all');
    const data = await response.json();
    contenedor.innerHTML = '';
    data.sort((a, b) => a.name.common.localeCompare(b.name.common));
    data.forEach(pais => {
        const div = document.createElement('div');
        div.classList.add('country');
        div.innerHTML = `
            <img src="${pais.flags.png}" alt="${pais.name.common}">
            <h3>${pais.name.common}</h3>
            <p><strong>Capital:</strong> ${pais.capital ? pais.capital[0] : 'No disponible'}</p>
            <p><strong>Región:</strong> ${pais.region}</p>
        `;
        contenedor.appendChild(div);
    });
}

// Pestaña 4: Generar cuestionario de favoritos
async function generarCuestionario() {
    const container = document.getElementById('quiz-container');
    container.innerHTML = '';
    const favoritos = JSON.parse(localStorage.getItem('favoritos') || '[]');
    if (favoritos.length < 1) {
        container.innerHTML = '<p>Agrega países a favoritos para generar preguntas.</p>';
        return;
    }

    const preguntas = [];
    for (let i = 0; i < 3; i++) {
        const paisNombre = favoritos[Math.floor(Math.random() * favoritos.length)];
        const response = await fetch(`https://restcountries.com/v3.1/name/${paisNombre}`);
        const data = await response.json();
        const pais = data[0];
        const capital = pais.capital ? pais.capital[0] : 'No disponible';
        const region = pais.region;
        const opcionesCapital = [capital, 'Bogotá', 'Lima', 'Santiago'].sort(() => Math.random() - 0.5);
        const opcionesRegion = [region, 'Asia', 'África', 'Europa'].sort(() => Math.random() - 0.5);

        preguntas.push(`
            <div class="question">
                <p><strong>¿Cuál es la capital de ${pais.name.common}?</strong></p>
                ${opcionesCapital.map(op => `<label><input type="radio" name="q1-${i}" value="${op}"> ${op}</label>`).join('<br>')}
                <p><strong>¿En qué región está ${pais.name.common}?</strong></p>
                ${opcionesRegion.map(op => `<label><input type="radio" name="q2-${i}" value="${op}"> ${op}</label>`).join('<br>')}
                <hr>
            </div>
        `);
    }

    container.innerHTML = preguntas.join('');
}

// Detectar entrada a pestañas específicas
function showTab(id) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.getElementById(id).classList.add('active');

    document.querySelectorAll('.bottom-menu button').forEach(btn => btn.classList.remove('active-btn'));
    const index = {
        'tab-buscar': 0,
        'tab-favoritos': 1,
        'tab-1': 2,
        'tab-2': 3,
        'tab-3': 4,
        'tab-info': 5
    };
    document.querySelectorAll('.bottom-menu button')[index[id]].classList.add('active-btn');

    if (id === 'tab-favoritos') loadFavoritos();
    if (id === 'tab-1') cargarTodosLosPaises();
    if (id === 'tab-2') generarCuestionario();
}
