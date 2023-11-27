import { GraphQLObjectType, GraphQLList, GraphQLString } from "graphql";
import { FilmType, PersonType, PlanetType, StarshipType, VehicleType } from "../objectTypes";


const BASE_URL = 'https://swapi.dev/api/';

function fetchResponseByURL(url) {
  return fetch(url).then(res => res.json());
}

/**
 * An AsyncIterator object that fetches pages of objects
 * it yields the object before fetching the next page
 * each object must be yield individually
 * @returns 
 */
function fetchPageIterator(type: string) {
  return {
    async *[Symbol.asyncIterator]() {
      let response = await fetchResponseByURL(`${BASE_URL}${type}`);
      for(const result of response.results) {
        yield result;
      }
      while(response.next) {
        response = await fetchResponseByURL(response.next);
        for(const result of response.results) {
          yield result;
        }
      }
    }
  }
}

export const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    characters: {
      type: new GraphQLList(PersonType),
      resolve: () => fetchPageIterator('people'),
    },
    films: {
      type: new GraphQLList(FilmType),
      resolve: () => fetchPageIterator('films'),
    },
    planets: {
      type: new GraphQLList(PlanetType),
      resolve: () => fetchPageIterator('planets'),
    },
    starships: {
      type: new GraphQLList(StarshipType),
      resolve: () => fetchPageIterator('starships'),
    },
    vehicles: {
      type: new GraphQLList(VehicleType),
      resolve: () => fetchPageIterator('vehicles'),
    },
    character: {
      type: PersonType,
      args: {
        id: { type: GraphQLString },
      },
      resolve: (_root, args) => fetchResponseByURL(`${BASE_URL}people/${args.id}`),
    },
    film: {
      type: FilmType,
      args: {
        id: { type: GraphQLString },
      },
      resolve: (_root, args) => fetchResponseByURL(`${BASE_URL}films/${args.id}`),
    },
    planet: {
      type: PlanetType,
      args: {
        id: { type: GraphQLString },
      },
      resolve: (_root, args) => fetchResponseByURL(`${BASE_URL}planets/${args.id}`),
    },
    starship: {
      type: StarshipType,
      args: {
        id: { type: GraphQLString },
      },
      resolve: (_root, args) => fetchResponseByURL(`${BASE_URL}starships/${args.id}`),
    },
    vehicle: {
      type: VehicleType,
      args: {
        id: { type: GraphQLString },
      },
      resolve: (_root, args) => fetchResponseByURL(`${BASE_URL}vehicles/${args.id}`),
    },
  }),
});