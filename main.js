document.addEventListener('DOMContentLoaded', function () {
    const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 7,
        center: { lat: -3.71722, lng: -38.5434 }, // Centro inicial no Ceará
    });

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    const cearaBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(-7.646, -41.198), // Limite sudoeste do Ceará
        new google.maps.LatLng(-2.803, -37.451)  // Limite nordeste do Ceará
    );

    const maxCities = 16;
    let cityInputCount = 0;

    const cityInputsContainer = document.getElementById('cityInputs');
    const addCityButton = document.getElementById('addCityButton');
    const clearAllButton = document.getElementById('clearAllButton');
    const flagAgir = document.getElementById('flagAgir');

    // Limpar e inicializar campos
    resetCities();

    addCityButton.addEventListener('click', addCityInput);
    clearAllButton.addEventListener('click', resetCities);

    document.getElementById('routeForm').addEventListener('submit', function (e) {
        e.preventDefault();

        let cities = Array.from(document.querySelectorAll('.city-input input'))
            .map(input => input.value.trim())
            .filter(city => city);

        if (flagAgir.checked) {
            const fixedLocation = "Atacadão CD, Rod. 4º Anel Viário, 2700 - 2700-A - Pedras, Fortaleza - CE, 60874-401";
            cities = [fixedLocation, ...cities, fixedLocation]; // Adiciona origem e destino fixos
        }

        if (cities.length < 2 || cities.length > maxCities) {
            alert(`Por favor, insira entre 2 e ${maxCities} cidades.`);
            return;
        }

        calculateAndDisplayRoute(directionsService, directionsRenderer, cities);
    });

    function addCityInput() {
        if (cityInputCount >= maxCities) return;

        const cityInputDiv = document.createElement('div');
        cityInputDiv.classList.add('city-input');

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Cidade ${cityInputCount + 1}`;

        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'X';
        deleteButton.classList.add('delete-button');
        deleteButton.type = 'button';
        deleteButton.addEventListener('click', function () {
            cityInputsContainer.removeChild(cityInputDiv);
            cityInputCount--;
        });

        cityInputDiv.appendChild(input);
        cityInputDiv.appendChild(deleteButton);
        cityInputsContainer.appendChild(cityInputDiv);

        const autocomplete = new google.maps.places.Autocomplete(input, {
            bounds: cearaBounds,
            componentRestrictions: { country: 'br' },
            fields: ['geometry', 'name'],
            types: ['(cities)']
        });

        cityInputCount++;
    }

    function resetCities() {
        cityInputsContainer.innerHTML = '';
        cityInputCount = 0;
        addCityInput();
        document.getElementById('result').innerHTML = '';
    }

    function calculateAndDisplayRoute(directionsService, directionsRenderer, cities) {
        const waypoints = cities.slice(1, -1).map(city => ({ location: city, stopover: true }));
        const origin = cities[0];
        const destination = cities[cities.length - 1];

        directionsService.route({
            origin: origin,
            destination: destination,
            waypoints: waypoints,
            optimizeWaypoints: true,
            travelMode: google.maps.TravelMode.DRIVING,
        }, function (response, status) {
            if (status === google.maps.DirectionsStatus.OK) {
                directionsRenderer.setDirections(response);
                const route = response.routes[0];
                const summaryPanel = document.getElementById('result');
                summaryPanel.innerHTML = '';

                let totalDistance = 0;
                for (let i = 0; i < route.legs.length; i++) {
                    totalDistance += route.legs[i].distance.value;
                }

                const totalDistanceKm = (totalDistance / 1000).toFixed(0);
                summaryPanel.innerHTML = `<h2>${totalDistanceKm} km</h2>`;
            } else {
                alert('Não foi possível calcular a rota: ' + status);
            }
        });
    }
});
