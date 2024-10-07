document.addEventListener('DOMContentLoaded', function () {
    const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 7,
        center: { lat: -3.71722, lng: -38.5434 }, // Centro inicial no Ceará
    });

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    const cearaBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(-7.646, -41.198),  // Limite sudoeste do Ceará
        new google.maps.LatLng(-2.803, -37.451)   // Limite nordeste do Ceará
    );

    let cityInputCount = 0;
    const maxCities = 16;

    const cityInputsContainer = document.getElementById('cityInputs');
    const addCityButton = document.getElementById('addCityButton');
    const clearAllButton = document.getElementById('clearAllButton');

    // Adicionar o primeiro campo de cidade com o endereço do Atacadão CD por padrão
    addCityInput(); // O primeiro campo será preenchido com o endereço do Atacadão CD

    // Adiciona novos campos para cidade ao clicar no botão "Adicionar Cidade"
    addCityButton.addEventListener('click', addCityInput);

    // Limpar todos os campos ao clicar no botão "Limpar Tudo"
    clearAllButton.addEventListener('click', function () {
        cityInputsContainer.innerHTML = ''; // Limpa todos os campos
        cityInputCount = 0; // Reseta o contador
        addCityInput(); // Adiciona o campo inicial com o Atacadão
        document.getElementById('result').innerHTML = ''; // Limpa o resultado
    });

    document.getElementById('routeForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const cities = Array.from(document.querySelectorAll('.city-input input')).map(input => input.value.trim()).filter(city => city);

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
        
        // Se for o primeiro campo, preenche com o endereço do Atacadão CD
        if (cityInputCount === 0) {
            input.value = "Atacadão CD, Rod. 4º Anel Viário, 2700 - 2700-A - Pedras, Fortaleza - CE, 60874-401"; // Campo preenchido com o endereço
        } else {
            input.value = ""; // Garante que os campos adicionais estejam vazios
        }
        
        input.placeholder = `Cidade ${cityInputCount + 1}`; // Placeholder para cidades

        // Botão de excluir (apenas "X")
        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'X';
        deleteButton.classList.add('delete-button');
        deleteButton.type = 'button';
        deleteButton.addEventListener('click', function () {
            cityInputsContainer.removeChild(cityInputDiv); // Remove o campo de cidade
            cityInputCount--; // Decrementa o contador
        });

        cityInputDiv.appendChild(input);
        cityInputDiv.appendChild(deleteButton); // Adiciona o botão de excluir ao campo
        cityInputsContainer.appendChild(cityInputDiv);

        // Adicionar autocomplete ao campo de texto
        const autocomplete = new google.maps.places.Autocomplete(input, {
            bounds: cearaBounds,
            componentRestrictions: { country: 'br' },
            fields: ['geometry', 'name'],
            types: ['(cities)']
        });

        cityInputCount++;
    }

    function calculateAndDisplayRoute(directionsService, directionsRenderer, cities) {
        const waypoints = cities.slice(1, -1).map(city => ({ location: city, stopover: true }));
        const origin = cities[0];
        const destination = cities[cities.length - 1];

        // Solicitar ao Google Maps API para otimizar os pontos intermediários (waypoints)
        directionsService.route(
            {
                origin: origin,
                destination: destination,
                waypoints: waypoints,
                optimizeWaypoints: true, // Otimiza os waypoints intermediários
                travelMode: google.maps.TravelMode.DRIVING,
            },
            function (response, status) {
                if (status === google.maps.DirectionsStatus.OK) {
                    directionsRenderer.setDirections(response);
                    const route = response.routes[0];
                    const summaryPanel = document.getElementById('result');
                    summaryPanel.innerHTML = '';

                    let totalDistance = 0; // Variável para acumular a distância total

                    // Calcular a distância total da rota (somando as distâncias dos trechos)
                    for (let i = 0; i < route.legs.length; i++) {
                        totalDistance += route.legs[i].distance.value; // Distância em metros
                    }

                    // Converter a distância total de metros para quilômetros e exibir
                    const totalDistanceKm = (totalDistance / 1000).toFixed(0);
                    summaryPanel.innerHTML = `<h2>${totalDistanceKm} - km</h2>`;
                } else {
                    alert('Não foi possível calcular a rota: ' + status);
                }
            }
        );
    }
});
