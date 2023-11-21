const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLBoolean,
  GraphQLList,
  GraphQLID,
} = require('graphql')

const { getAllUsers, createNewUser } = require('../../resolvers/usersResolvers')

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: { type: GraphQLID },
    email: { type: GraphQLString },
    password: { type: GraphQLString },
    roles: { type: new GraphQLList(GraphQLString) },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    active: { type: GraphQLBoolean },
  },
})

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    // getAllUsers
    getAllUsers: {
      type: new GraphQLList(UserType),
      resolve(parent, args) {
        return getAllUsers(parent, args)
      },
    },
  },
})

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    // createNewUser
    createNewUser: {
      type: UserType,
      args: {
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        roles: { type: new GraphQLList(GraphQLString) },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
      },
      resolve(parent, args) {
        return createNewUser(parent, args)
      },
    },
  },
})

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation,
})
