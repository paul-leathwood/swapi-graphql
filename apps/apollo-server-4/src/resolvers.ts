const BASE_URL = 'https://swapi.dev/api/';

function fetchResponseByURL(relativeURL) {
  return fetch(`${BASE_URL}${relativeURL}`).then(res => res.json());
}

function fetchPeople() {
  return fetchResponseByURL('people').then((json) => json.results);
}

const typeDefs = `#graphql
  type Person {
    name: String
  }

  type Query {
    people: [Person]
  }
`;

const resolvers = {
  Query: {
    people: fetchPeople,
  },
};

export {
  typeDefs,
  resolvers
}