# Script for creating an offline Pokedex database for searching
# Data taken from Pokemon API's files

# Interesting information you'd want:
# Generation, Name, Regional names
# Weight and height

import csv, json, re

with open('offline-pokedex.json', 'w') as jsonfile:
    with open('csv/pokemon.csv', newline='') as csvfile:
        pkmn_json = []
        pokedex = csv.reader(csvfile, delimiter=',')
        next(pokedex) # Skip the header row        
        total_pokemon = 0
        
        for row in pokedex:
            if(int(row[0]) <= 1025):
                total_pokemon += 1
                curr_pkmn = {}
                curr_pkmn["name"] = row[1].capitalize()
                print(curr_pkmn)
                pkmn_json.append(curr_pkmn)
                # if(int(row[0]) < 1025):
                #     jsonfile.write(",")
        json.dump(pkmn_json, jsonfile, indent=4)

        print(f"Total pokemon: {total_pokemon}")