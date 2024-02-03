const express = require('express');
const { graphqlHTTP } = require('express-graphql');

const {schema, resolvers} = require('./schemas/schema') ;

// const { ApolloClient, InMemoryCache } = require('@apollo/client');

// const client = new ApolloClient({
//   uri: 'https://major-pigeon-46.hasura.app/v1/graphql',
//   cache: new InMemoryCache(),
// });



const app = express();

// GraphQL endpoint
app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    rootValue: resolvers,
    graphiql: true, // Enable GraphiQL for testing in the browser
  })
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/graphql`);
});
