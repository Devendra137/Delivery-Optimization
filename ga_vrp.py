import json
from flask import Flask, request, jsonify
from flask_cors import CORS


app = Flask(__name__)
CORS(app)
@app.route('/process_json', methods=['POST'])
def process_json():
    # Get JSON data from request
    json_data = request.json


    import os
    import folium
    import math

    import random


    # return json_data
    # parsed_json = json.loads(json_data)
    coords=[(coord["lat"], coord["lng"]) for coord in json_data["userLocations"]]
    def generate_similar_coords(coords, num_samples):
        similar_coords = []
        new_coords = []
        for _ in range(num_samples):
                # Add small random variations
            lat = coords[0][0] + random.uniform(-0.05, 0.05)
            lon = coords[0][1] + random.uniform(-0.05, 0.05)
            new_coords.append((lat, lon))

        return new_coords
    # Generate 100 sets of similar coordinates
    # coords = generate_similar_coords(coords, 100)
    # print(coords)
    # Define the depot location
    depot = (json_data["depotLocations"][0]['lat'],json_data["depotLocations"][0]["lng"])

    # Define the number of vehicles
    num_vehicles = json_data["NoOfVehicles"]

    # Define the capacity of each vehicle
    vehicle_capacity = json_data["vehicleCapacities"]

    # return json_data

    # return json_data
    # Define the population size
    population_size =100

    # Define the number of generations
    num_generations = 10
    # Define mutation rate
    mutation_rate = 0.1

    # Define a function to calculate the distance between two points
    def distance(point1, point2):
        return abs(point1[0] - point2[0]) + abs(point1[1] - point2[1])

    # Generate initial population
    def generate_population():
        population = []
        for _ in range(population_size):
            routes = [[] for _ in range(num_vehicles)]
            remaining_coords = coords[:]
            for vehicle in range(num_vehicles):
                capacity = vehicle_capacity[vehicle]
                while capacity > 0 and remaining_coords:
                    chosen_coord = random.choice(remaining_coords)
                    routes[vehicle].append(chosen_coord)
                    remaining_coords.remove(chosen_coord)
                    capacity -= 1
            population.append(routes)
        return population

    # Calculate fitness of each route
    def calculate_fitness(routes):
        total_distance = 0
        for route in routes:
            route_with_depo=[depot]+route+[depot]
            for i in range(len(route_with_depo) - 1):
                total_distance += distance(route_with_depo[i], route_with_depo[i+1])
        return total_distance

    # Select parents for crossover using tournament selection
    def select_parents(population):
        parents = []
        for _ in range(2):
            if len(population) < 5:
                tournament = population
            else:
                tournament = random.sample(population, 5)
            best_routes = min(tournament, key=calculate_fitness)
            parents.append(best_routes)
        return parents

    # Perform crossover to generate offspring
    def crossover(parents):
        parent1, parent2 = parents
        crossover_point = random.randint(1, len(parent1[0]) - 1)
        child1 = [parent1[i][:crossover_point] + parent2[i][crossover_point:] for i in range(num_vehicles)]
        child2 = [parent2[i][:crossover_point] + parent1[i][crossover_point:] for i in range(num_vehicles)]
        return child1, child2

    # Perform mutation
    def mutate(routes):
        for i in range(len(routes)):
            if (random.random() < mutation_rate and len(routes[i])>1):
                idx1, idx2 = random.sample(range(len(routes[i])), 2)
                routes[i][idx1], routes[i][idx2] = routes[i][idx2], routes[i][idx1]
        return routes

    def clean_population(population):
        correct_population=[]
        def chk(offspring):
            total_size=0
            for vehicle_route in offspring:
              check_set=set(vehicle_route)
              if(len(check_set)!=len(vehicle_route)):
                return False
              total_size+=len(check_set)
            if(total_size!=len(coords)):
                return False
            return True

        for offspring in population:
          if chk(offspring):
            correct_population+=[offspring]
        return correct_population

    def are_all_elements_distinct(lst):
        seen = set()
        for element in lst:
            if tuple(element) in seen:  # Convert list to tuple
                return False
            seen.add(tuple(element))  # Convert list to tuple before adding to the set
        return True


    def sort_and_select_best(population, calculate_fitness, num_best):

      # Sort the population based on fitness in ascending order
      sorted_population = sorted(population, key=calculate_fitness)

      # Select the best `num_best` elements
      best_elements = sorted_population[:num_best]

      return best_elements


    # Genetic algorithm
    def genetic_algorithm():
        population = generate_population()
        for generation in range(num_generations):
            population=clean_population(population)
            # print(population)
            new_population = []
            for _ in range(population_size // 2):
                parents = select_parents(population)
                offspring = crossover(parents)
                offspring = [mutate(routes) for routes in offspring]

                distinct = all(are_all_elements_distinct(route) for route in offspring[0])
                distinct &= all(are_all_elements_distinct(route) for route in offspring[0])

                if(distinct):
                    new_population.extend(offspring)
            population+=new_population
            population=sort_and_select_best(population, calculate_fitness, 10)
            best_routes = min(population, key=calculate_fitness)
            print(f"Generation {generation+1}, Best Distance: {calculate_fitness(best_routes)}")
            print("\n")
        return best_routes

    # Run the genetic algorithm
    # m = folium.Map(location=list(reversed(depot['location'])), tiles="cartodbpositron", zoom_start=14)
    best_routes = genetic_algorithm()

    # for route in best_routes:
    #     folium.PolyLine(locations=[list(reversed(coords)) for coords in ors.convert.decode_polyline(route['geometry'])['coordinates']], color=line_colors[route['vehicle']]).add_to(m)
    # m
    print(best_routes)

    def routes_to_json(best_routes):
        json_data = []
        for idx, route in enumerate(best_routes, start=1):
            route_json = [depot]+[c for c in route]+[depot]
            json_data.append({f"Route for Vehicle {idx}": route_json})
        return json.dumps(json_data, indent=4)

    
    best_routes_final = []

    # for i, route in enumerate(best_routes):
    #     print(f"Route for vehicle {i+1}: {'->'.join([f'customer{coords.index(c)+1}' for c in route])}")
    #     temp = [f'customer{coords.index(c)+1}' for c in route]
    #     best_routes_final.append(temp)
    # best_routes_json = routes_to_json(best_routes_final)
    best_routes_json = routes_to_json(best_routes)
    return best_routes_json
    # return best_routes_json
    # return best_routes

if __name__ == '__main__':
    app.run(debug=True)
