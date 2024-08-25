    document.getElementById('search-button').addEventListener('click', function() {
    const pokemonNameOrId = document.getElementById('pokemon-input').value.toLowerCase().replace(" ", "-");
    fetchPokemonData(pokemonNameOrId);
});

window.addEventListener('popstate', function(event) {
    if (event.state && event.state.pokemon) {
        fetchPokemonData(event.state.pokemon, false);
    } else {
        document.getElementById('pokemon-info').innerHTML = '';
    }
});

function fetchPokemonData(pokemon, pushState = true) {
    const pokemonMsg = `Pokemon name: ${pokemon}`;
    const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${pokemon}`;

    // Fetch data from pokemonUrl
    fetch(pokemonUrl)
        .then(response => response.json())
        .then(pokemonData => {
            const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${pokemonData.id}`;
            
            // Fetch data from speciesUrl
            fetch(speciesUrl)
                .then(response => response.json())
                .then(speciesData => {
                    displayPokemonData(pokemonData, speciesData);
                    if (pushState) {
                        history.pushState({ pokemon: pokemonData.name }, pokemonData.name, `?pokemon=${pokemonData.name}`);
                    }
                })
                .catch(error => {
                    console.error('Error fetching the species data:', error);
                    displayError();
                });
        })
        .catch(error => {
            console.error('Error fetching the Pokemon data:', error);
            displayError();
        });
}

function setFavicon(pokemonIcon)
{
    if (pokemonIcon !== null) {
        const favicon = document.getElementById("favicon");
        if (favicon !== null)
        {
            console.log("Favicon found, updating source...")
            favicon.href = pokemonIcon
        }
        else
        {
            console.log("Creating favicon")
            newIcon = document.createElement('link');
            newIcon.rel = 'icon';
            newIcon.id = "favicon"
            newIcon.href = pokemonIcon
            document.head.appendChild(newIcon);
        }
    }
    else
    {
        console.log("Sprite wasn't found.")
    }
}

function displayPokemonData(pokemonData, speciesData) {
    const officialArtworkUrl = pokemonData.sprites.other['official-artwork'].front_default;
    const pkmnWeightKg = parseInt(pokemonData.weight) / 10;
    const pkmnHeightMeters = parseInt(pokemonData.height) / 10;
    const pkmnCryUrl = pokemonData.cries.latest
    const pokemonInfoDiv = document.getElementById('pokemon-info');
    const kanjiName = speciesData.names[0].name;
    const pokedexNum = pokemonData.id;

    // Filter the moves that are learned by leveling up in Scarlet and Violet
    const levelUpMoves = pokemonData.moves
    .filter(move => move.version_group_details.some(detail => 
        detail.move_learn_method.name === 'level-up' && detail.version_group.name === 'scarlet-violet'
    ))
    .map(move => {
        const detail = move.version_group_details.find(detail => 
            detail.move_learn_method.name === 'level-up' && detail.version_group.name === 'scarlet-violet'
        );
        return {
            name: move.move.name,
            url: move.move.url,
            level: detail.level_learned_at
        };
    });

    // Function to create move table row
    function createMoveRow(move) {
        return fetch(move.url)
            .then(response => response.json())
            .then(moveData => {
                const moveRow = document.createElement('tr');
                moveRow.innerHTML = `
                    <td>${capitalizeFirstLetter(move.name)}</td>
                    <td>${move.level}</td>
                    <td>${moveData.power ? moveData.power : 'N/A'}</td>
                    <td>${moveData.accuracy ? moveData.accuracy : 'N/A'}</td>
                    <td>${moveData.pp}</td>
                    <td>${capitalizeFirstLetter(moveData.damage_class.name)}</td>
                    <td>${capitalizeFirstLetter(moveData.type.name)}</td>
                `;

                // Add flavor text tooltip
                const flavorTextEntry = moveData.flavor_text_entries.find(entry => 
                    entry.language.name === 'en' && entry.version_group.name === 'sword-shield'
                );
                const flavorText = flavorTextEntry ? flavorTextEntry.flavor_text : 'No flavor text available';

                moveRow.addEventListener('mouseenter', function(event) {
                    showTooltip(event, flavorText);
                });
                moveRow.addEventListener('mousemove', function(event) {
                    moveTooltip(event);
                });
                moveRow.addEventListener('mouseleave', hideTooltip);

                return moveRow;
            });
    }

    let movesTable = document.createElement('table');
    movesTable.innerHTML = `
        <tr>
            <th>Move</th>
            <th>Level Learned</th>
            <th>Power</th>
            <th>Accuracy</th>
            <th>PP</th>
            <th>Damage Class</th>
            <th>Type</th>
        </tr>`;

    // Append each move row to the table
    Promise.all(levelUpMoves.map(createMoveRow))
        .then(moveRows => {
            moveRows.forEach(row => movesTable.appendChild(row));
        });

    let flavorText = "";
    const flavor_text_entries = speciesData.flavor_text_entries;
    let eligible_entries = []; // Available flavor text entries of the desired language
    for (const entry of flavor_text_entries)
    {
        if(entry.language.name == "en" && entry.version.name.length < 9)
        {
            eligible_entries.push(entry);
        };
    };

    flavorText = eligible_entries[Math.floor(Math.random() * eligible_entries.length)];
    let abilitiesText = []
    let pkmnGeneration = speciesData.generation.name
    let genusName = speciesData.genera.find(genusLang => genusLang.language["name"] === "en")["genus"]
    let smallSprite = pokemonData.sprites.versions["generation-viii"].icons.front_default
    console.log(smallSprite)

    pokemonInfoDiv.innerHTML = `
        <div class="pokemon">
        <h2 style='color:${speciesData.color.name};text-shadow: 0 0px 5px black;'>${capitalizeFirstLetter(pokemonData.name)} (${kanjiName}) #${pokedexNum}<img src=${smallSprite}></img></h2>            
            <p><i>The ${genusName} </i></p>
            <p>${capitalizeFirstLetter(pkmnGeneration)}</p>
            <img id="pokemon-image" src="${officialArtworkUrl}" alt="${pokemonData.name}">
            <p><i>${flavorText.flavor_text.replace(/[\x00-\x1F\x7F-\x9F]/g, ' ')}</i> - Pokemon ${capitalizeFirstLetter(flavorText.version.name).replace("-", " ")}</p>
            <p>Height: ${pkmnHeightMeters} m</p>
            <p>Weight: ${pkmnWeightKg} kg</p>
            <p>Type: ${pokemonData.types.map(typeInfo => capitalizeFirstLetter(typeInfo.type.name)).join(', ')}</p>
            <p>Abilities:</p>
            <audio id="pokemon-cry" src="${pkmnCryUrl}"></audio>
            <div class="controls">
                <input type="range" id="volume-slider" min="0" max="1" step="0.01" value="1">
                <button id="mute-button">Mute</button>
            </div>
            <h3>Moves learned by leveling up (Scarlet and Violet):</h3>
        </div>
    `;

    setFavicon(smallSprite);

    pokemonInfoDiv.appendChild(movesTable);
    drawStatsChart(pokemonData.stats);

    const pokemonImage = document.getElementById('pokemon-image');
    const pokemonCry = document.getElementById('pokemon-cry');
    const volumeSlider = document.getElementById('volume-slider');
    const muteButton = document.getElementById('mute-button');

    const initialVolume = 0.33;
    pokemonCry.volume = initialVolume;

    // Event listener to play cry when image is clicked
    pokemonImage.addEventListener('click', function() {
        pokemonCry.play();
    });

    // Event listener for volume slider
    volumeSlider.addEventListener('input', function() {
        pokemonCry.volume = volumeSlider.value*initialVolume;
    });

    // Event listener for mute button
    muteButton.addEventListener('click', function() {
        if (pokemonCry.muted) {
            pokemonCry.muted = false;
            muteButton.textContent = 'Mute';
        } else {
            pokemonCry.muted = true;
            muteButton.textContent = 'Unmute';
        }
    });
}

function showTooltip(event, text) {
    let tooltip = document.getElementById('tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'tooltip';
        tooltip.className = 'tooltip';
        document.body.appendChild(tooltip);
    }
    tooltip.textContent = text;
    tooltip.style.display = 'block';
    tooltip.style.left = `${event.pageX + 10}px`;
    tooltip.style.top = `${event.pageY + 10}px`;
}

function moveTooltip(event) {
    const tooltip = document.getElementById('tooltip');
    if (tooltip) {
        tooltip.style.left = `${event.pageX + 10}px`;
        tooltip.style.top = `${event.pageY + 10}px`;
    }
}

function hideTooltip() {
    const tooltip = document.getElementById('tooltip');
    if (tooltip) {
        tooltip.style.display = 'none';
    }
}
function displayError() {
    const pokemonInfoDiv = document.getElementById('pokemon-info');
    pokemonInfoDiv.innerHTML = `
        <div class="pokemon">
            <p>Pokemon not found. Please try again.</p>
        </div>
    `;
}

function drawStatsChart(stats) {
    const canvas = document.getElementById('stats-chart');
    const ctx = canvas.getContext('2d');

    const statNames = ['HP', 'Attack', 'Defense', 'Special Attack', 'Special Defense', 'Speed'];
    const statValues = stats.map(stat => stat.base_stat);
    const maxStats = [255, 180, 230, 180, 230, 180];

    const maxValue = Math.max(...statValues);

    const barWidth = 30; // Reduced the width of the bars
    const barSpacing = 20;
    const chartHeight = canvas.height - 100; // Reduced the chart height to make room for stat values
    const chartWidth = (barWidth + barSpacing) * statNames.length;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw stat labels
    ctx.fillStyle = 'black';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    for (let i = 0; i < statNames.length; i++) {
        const labelX = (barWidth + barSpacing) * i + barWidth / 2;
        const labelY = canvas.height - 5;
        ctx.fillText(statNames[i], labelX, labelY);
        ctx.fillText(statValues[i], labelX, labelY - 15);
    }
    // Animation duration in milliseconds
    const animationDuration = 1000; // 1 second
    const animationInterval = 10; // Interval for animation loop

    // Start animation
    let startTime = null;
    requestAnimationFrame(animate);

    function animate(timestamp) {
        if (!startTime) {
            startTime = timestamp;
        }
        const progress = timestamp - startTime;
        for (let i = 0; i < statNames.length; i++) {
            const x = (barWidth + barSpacing) * i + (barSpacing / 2); // Center bars within the spacing
            const targetHeight = (statValues[i] / maxStats[i]) * chartHeight;
            const currentHeight = (progress / animationDuration) * targetHeight;
            const y = canvas.height - currentHeight - 60; // Adjusted position for bars
            ctx.fillStyle = 'blue';
            ctx.fillRect(x, y, barWidth, currentHeight);
        }
        if (progress < animationDuration) {
            requestAnimationFrame(animate);
        }
    }
}

function capitalizeFirstLetter(string) {
    let newText = string.replace("-", " ")
    const words = newText.split(" ");

    for (let i = 0; i < words.length; i++) {
        words[i] = words[i][0].toUpperCase() + words[i].substr(1);
    }
    return words.join(" ");
}

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const pokemon = urlParams.get('pokemon');
    if (pokemon) {
        fetchPokemonData(pokemon, false);
    }
});
