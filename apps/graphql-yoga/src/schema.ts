import { GraphQLList, GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";

const BASE_URL = 'https://swapi.dev/api/';

function fetchResponseByURL(url) {
  return fetch(url).then(res => res.json());
}

function fetchPeople() {
  return fetchResponseByURL(`${BASE_URL}people`).then((json) => json.results);
}

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
