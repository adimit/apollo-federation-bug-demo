const { ApolloServer, gql } = require("apollo-server");
const { buildFederatedSchema } = require("@apollo/federation");

const typeDefs = gql`
  extend type Query {
    dummy: [Complex]
  }

  type User @extends @key(fields: "id") {
    id: ID! @external
  }

  type Complex @extends {
    # ERROR: subproperty can't be external without @key or @requires!
    subproperty: String @external
  }

  # But subproperty is in a @key directive here! Apollo federation doesn't recognise this
  type BaseType @extends @key(fields: "user {id} dependency {subproperty}") {
    user: User! @external
    dependency: Complex! @external
    # A requires directive here will work. Uncomment this line to "fix" the problem
    # workaround: String! @requires(fields: "dependency {subproperty}")
  }
`;

const resolvers = {
  Complex: {
    __resolveReference(object) {
      return products.find((product) => product.upc === object.upc);
    },
  },
  Query: {
    topProducts(_, args) {
      return products.slice(0, args.first);
    },
  },
};

const server = new ApolloServer({
  schema: buildFederatedSchema([
    {
      typeDefs,
      resolvers,
    },
  ]),
});

server.listen({ port: 4003 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});

const products = [
  {
    upc: "1",
    name: "Table",
    price: 899,
    weight: 100,
  },
  {
    upc: "2",
    name: "Couch",
    price: 1299,
    weight: 1000,
  },
  {
    upc: "3",
    name: "Chair",
    price: 54,
    weight: 50,
  },
];
