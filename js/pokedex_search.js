let pkmnArray = []

async function loadOfflineDex()
{
    fetch("../data/offline-pokedex.json")
    .then(response => {
        if (response.ok)
        {
            return response.json(); 
        }
        else
        {
            console.error(`Error: HTTP Code ${response.status} ${response.statusText}`)
        }
    }, error => console.error(error.message))
    .then(responseJSON => {
        console.log(responseJSON);
        console.log(responseJSON[0])
        pkmnArray = responseJSON

        displaySearchResults(pkmnArray)
})
}

function displaySearchResults(inputArray)
{
    console.log("Calling displaySearchResults");
    const resultsDiv = document.getElementById("search-results");
    resultsDiv.replaceChildren();

    for (result of inputArray)
        {
            currPkmnHTML = document.createElement("li");
            currPkmnJSON = result;
            currPkmnName = currPkmnJSON.name

            currPkmnLink = document.createElement("a");
            console.log(`${currPkmnJSON.apiLink}`)
            
            currPkmnLink.setAttribute("href", `pokedex-view.html?pokemon=${currPkmnJSON.apiLink}`);
            currPkmnLink.innerHTML = currPkmnName;

            currPkmnHTML.append(currPkmnLink);
            resultsDiv.append(currPkmnHTML);
        }
}

function searchForPkmn()
{
    const name = document.getElementById("pkmn-name").value;
    const gen = document.getElementById("pkmn-generation").value;
    const types = Array.from(document.querySelectorAll("#search-options > select[id*='type-select']"))
    .filter((type) => type.value != "Any");
    
    console.log(`number of selected types: ${types.length}`)
    console.log(`Selected types: `);
    for(element of types)
    {
        console.log(`Type: ${element.value}`);
    };
        
    function pkmnFilter(pkmnObject)
    {
        matchesFilter = pkmnObject.name.toLowerCase().includes(name);

        if(gen != "any")
        {
            matchesFilter &&= pkmnObject.generation === gen; // Logical assignment operator for adding extending filter boolean
        }
        if(types.length != 0)
        {
            for (type of types)
            {
                console.log(pkmnObject.types)
                matchesFilter &&= pkmnObject.types.includes(type.value.toLowerCase());
            }
        }

        return matchesFilter;
    }

    const searchResults = pkmnArray.filter(pkmnFilter)
    console.log(`Search results: ${searchResults.length}`)
    displaySearchResults(searchResults)
}

window.onload = (event) => {
    const firstTypeSelect = document.createElement("select");
    firstTypeSelect.id = "first-type-select"

    const pkmnTypes = ["Any", "Normal", "Fire", "Water", "Electric", "Grass", "Ice",
        "Fighting", "Poison", "Ground", "Flying", "Psychic",
        "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy", "Stellar"];
    for (type of pkmnTypes)
    {
        typeOption = document.createElement("option")
        typeOption.value = type;
        typeOption.innerHTML = type;
        firstTypeSelect.append(typeOption);
    }
    const firstTypeLabel = document.createElement("label");
    firstTypeLabel.for = firstTypeSelect;
    firstTypeLabel.innerHTML = "1st Type:";

    const secondTypeSelect = firstTypeSelect.cloneNode(true);
    secondTypeSelect.id = "second-type-select";
    const secondTypeLabel = document.createElement("label");
    secondTypeLabel.for = secondTypeSelect;
    secondTypeLabel.innerHTML = "2nd Type:";

    document.getElementById("search-options").append(firstTypeLabel);
    document.getElementById("search-options").append(firstTypeSelect);
    document.getElementById("search-options").append(secondTypeLabel);
    document.getElementById("search-options").append(secondTypeSelect);

    loadOfflineDex();
    document.getElementById("search-button").onclick = searchForPkmn;
};