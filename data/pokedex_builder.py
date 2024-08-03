# Script for creating an offline Pokedex database for searching
# Data taken from Pokemon API's files

# Interesting information you'd want:
# Types

#TO-DO:
# Fix names with special symbols
# E.g. Mr. Mime, Sirfetch'd, Type:Null

# LATER:
# Multi-language support

import csv, json, re

with open('offline-pokedex.json', 'w') as jsonfile:
    pkmn_json = []

    with open('csv/pokemon.csv', newline='') as pkmn_file:
        pokemon_csv = csv.reader(pkmn_file, delimiter=',')
        next(pokemon_csv) # Skip the header row        
        
        for row in pokemon_csv:
            if(int(row[0]) <= 1025):
                curr_pkmn = {}
                curr_pkmn["id"] = row[0]
                if "-" in row[1] and "-o" not in row[1]:
                    full_name = ""
                    for i, name in enumerate(row[1].split("-")):
                        if i:
                            full_name += " "
                        full_name += name.capitalize()
                    curr_pkmn["name"] = full_name
                else:
                    curr_pkmn["name"] = row[1].capitalize()
                curr_pkmn["height-decimeter"] = row[3]
                curr_pkmn["weight-hectogram"] = row[4]

                pkmn_json.append(curr_pkmn)
                # if(int(row[0]) < 1025):
                #     jsonfile.write(",")

    with open('csv/pokemon_species.csv', newline='') as species_file:
        species_csv = csv.reader(species_file, delimiter=',')
        next(species_csv) # Skip the header row

        for row in species_csv:
            if(int(row[0]) <= 1025):
                pkmn_json[int(row[0])-1]["generation"] = row[2]

    with open('csv/pokemon_types.csv', newline='') as types_file:
        types_csv = csv.reader(types_file, delimiter=',')
        next(types_csv) # Skip the header row

        type_names = []
        with open('csv/types.csv', newline='') as typename_file:
            typenames_csv = csv.reader(typename_file, delimiter=',')
            next(typenames_csv) # Skip the header row
            
            for row in typenames_csv:
                if int(row[0]) <= 19:
                    type_names.append(row[1])

        for row in types_csv:
            if(int(row[0]) <= 1025):
                #pkmn_types = []
                if "types" not in pkmn_json[int(row[0])-1]:
                    pkmn_json[int(row[0])-1]["types"] = [type_names[int(row[1])-1]]
                else:
                    pkmn_json[int(row[0])-1]["types"].append(type_names[int(row[1])-1])


    json.dump(pkmn_json, jsonfile, indent=4)
    print(f"Total pokemon: {len(pkmn_json)}")