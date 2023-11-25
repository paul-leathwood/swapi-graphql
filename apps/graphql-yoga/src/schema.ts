import { GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";

const BASE_URL = 'https://swapi.dev/api/';

function fetchResponseByURL(url) {
  return fetch(url).then(res => res.json());
}

function fetchPeople() {
  return {
    async *[Symbol.asyncIterator]() {
      let people = await fetchResponseByURL(`${BASE_URL}people`);
      for(const person of people.results) {
        yield person;
      }
      while(people.next) {
        people = await fetchResponseByURL(people.next);
        for(const person of people.results) {
          yield person;
        }
      }
    }
  }
}

/**
 * An AsyncIterator object that fetches each film
 * it yields the film before fetching the next film
 * @param person
 * @returns 
 */
function fetchFilmsForPerson(person) {
  return {
    async *[Symbol.asyncIterator]() {
      for (const film of person.films) {
        const result = await fetchResponseByURL(film)
        yield result;
      }
    }
  };
}

const FilmType = new GraphQLObjectType({
  name: 'Film',
  fields: {
    title: { type: GraphQLString },
  }
});

const PersonType = new GraphQLObjectType({
  name: 'Person',
  fields: {
    name: { type: GraphQLString },
    height: { type: GraphQLInt },
    mass: { type: GraphQLString },
    hair_color: { type: GraphQLString },
    skin_color: { type: GraphQLString },
    eye_color: { type: GraphQLString },
    birth_year: { type: GraphQLString },
    gender: { type: GraphQLString },
    films: {
      type: new GraphQLList(FilmType),
      resolve: fetchFilmsForPerson
    },
  },
});

const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    allPeople: {
      type: new GraphQLList(PersonType),
      resolve: fetchPeople,
    },
    person: {
      type: PersonType,
      args: {
        id: { type: GraphQLString },
      },
      resolve: (_root, args) => fetchResponseByURL(`${BASE_URL}people/${args.id}`),
    },
  }),
});

const schema = new GraphQLSchema({
  query: QueryType,
});

export {
  schema
};
