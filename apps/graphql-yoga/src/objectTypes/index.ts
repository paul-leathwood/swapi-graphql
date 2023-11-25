import { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLList } from "graphql";

function fetchResponseByURL(url) {
  return fetch(url).then(res => res.json());
}

/**
 * An AsyncIterator object that fetches each url
 * it yields the result of the url before fetching the next
 * @param person
 * @returns 
 */
function fetchIterator(endpoints: string[]) {
  return {
    async *[Symbol.asyncIterator]() {
      for (const endpoint of endpoints) {
        yield fetchResponseByURL(endpoint)
      }
    }
  };
}

export const PersonType = new GraphQLObjectType({
  name: 'Person',
  fields: () => ({
    name: { type: GraphQLString },
    height: { type: GraphQLString },
    mass: { type: GraphQLString },
    hair_color: { type: GraphQLString },
    skin_color: { type: GraphQLString },
    eye_color: { type: GraphQLString },
    birth_year: { type: GraphQLString },
    gender: { type: GraphQLString },
    films: {
      type: new GraphQLList(FilmType),
      resolve: (person) => fetchIterator(person.films)
    },
    species: {
      type: new GraphQLList(SpeciesType),
      resolve: (person) => fetchIterator(person.species)
    },
    vehicles: {
      type: new GraphQLList(VehicleType),
      resolve: (person) => fetchIterator(person.vehicles),
    },
    starships: {
      type: new GraphQLList(StarshipType),
      resolve: (person) => fetchIterator(person.starships),
    },
  }),
});

export const FilmType = new GraphQLObjectType({
  name: 'Film',
  fields: () => ({
    title: { type: GraphQLString },
    episode_id: { type: GraphQLString },
    opening_crawl: { type: GraphQLString },
    director: { type: GraphQLString },
    producer: { type: GraphQLString },
    release_date: { type: GraphQLString },
    characters: {
      type: new GraphQLList(PersonType),
      resolve: (film) => fetchIterator(film.characters)
    },
  })
});

export const PlanetType = new GraphQLObjectType({
  name: 'Planet',
  fields: () => ({
    name: { type: GraphQLString },
    rotation_period: { type: GraphQLString },
    orbital_period: { type: GraphQLString },
    diameter: { type: GraphQLString },
    climate: { type: GraphQLString },
    gravity: { type: GraphQLString },
    terrain: { type: GraphQLString },
    surface_water: { type: GraphQLString },
    population: { type: GraphQLString },
    residents: {
      type: new GraphQLList(PersonType),
      resolve: (planet) => fetchIterator(planet.characters)
    },
    films: {
      type: new GraphQLList(FilmType),
      resolve: (planet) => fetchIterator(planet.films)
    },
  })
});

export const VehicleType = new GraphQLObjectType({
  name: 'Vehicle',
  fields: () => ({
    name: { type: GraphQLString },
    model: { type: GraphQLString },
    manufacturer: { type: GraphQLString },
    cost_in_credits: { type: GraphQLString },
    length: { type: GraphQLString },
    max_atmosphering_speed: { type: GraphQLString },
    crew: { type: GraphQLString },
    passengers: { type: GraphQLString },
    cargo_capacity: { type: GraphQLString },
    consumables: { type: GraphQLString },
    vehicle_class: { type: GraphQLString },
    pilots: {
      type: new GraphQLList(PersonType),
      resolve: (vehicle) => fetchIterator(vehicle.pilots)
    },
    films: {
      type: new GraphQLList(FilmType),
      resolve: (vehicle) => fetchIterator(vehicle.films)
    },
  })
});

export const StarshipType = new GraphQLObjectType({
  name: 'Starship',
  fields: () => ({
    name: { type: GraphQLString },
    model: { type: GraphQLString },
    manufacturer: { type: GraphQLString },
    cost_in_credits: { type: GraphQLString },
    length: { type: GraphQLString },
    max_atmosphering_speed: { type: GraphQLString },
    crew: { type: GraphQLString },
    passengers: { type: GraphQLString },
    cargo_capacity: { type: GraphQLString },
    consumables: { type: GraphQLString },
    hyperdrive_rating: { type: GraphQLString },
    MGLT: { type: GraphQLString },
    starship_class: { type: GraphQLString },
    pilots: {
      type: new GraphQLList(PersonType),
      resolve: (starship) => fetchIterator(starship.pilots)
    },
    films: {
      type: new GraphQLList(FilmType),
      resolve: (starship) => fetchIterator(starship.films)
    },
  })
});

export const SpeciesType = new GraphQLObjectType({
  name: 'Species',
  fields: () => ({
    name: { type: GraphQLString },
    classification: { type: GraphQLString },
    designation: { type: GraphQLString },
    average_height: { type: GraphQLString },
    skin_colors: { type: GraphQLString },
    hair_colors: { type: GraphQLString },
    eye_colors: { type: GraphQLString },
    average_lifespan: { type: GraphQLString },
    language: { type: GraphQLString },
    homeworld: {
      type: PlanetType,
      resolve: (species) => {
        if (species.homeworld) {
          return fetchResponseByURL(species.homeworld)
        }
      }
    },
    people: {
      type: new GraphQLList(PersonType),
      resolve: (species) => fetchIterator(species.people)
    },
    films: {
      type: new GraphQLList(FilmType),
      resolve: (species) => fetchIterator(species.films)
    },
  })
})