const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLFloat,
  GraphQLList,
  GraphQLID,
  GraphQLNonNull,
} = require('graphql')

const {
  getAllUsers,
  getAlerts,
  createNewUser,
  prediction,
  createNewTip,
  updateTip,
  createNewDailyVital,
  updateDailyVital,
  updateAlert,
  authenticate,
  isSignedIn,
  createNewVital,
  createNewAlert,
  getDailyVitalByPatientId,
  getAllTip,
} = require('../../resolvers/usersResolvers')

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: {
    _id: { type: GraphQLID },
    email: { type: GraphQLString },
    password: { type: GraphQLString },
    roles: { type: new GraphQLList(GraphQLString) },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    active: { type: GraphQLBoolean },
    gender: { type: GraphQLString },
    dob: { type: GraphQLString },
  },
})

const VitalType = new GraphQLObjectType({
  name: 'Vital',
  fields: {
    _id: { type: GraphQLID },
    age: { type: GraphQLInt },
    sex: { type: GraphQLInt },
    cp: { type: GraphQLInt },
    trestbps: { type: GraphQLFloat },
    chol: { type: GraphQLFloat },
    fbs: { type: GraphQLInt },
    restecg: { type: GraphQLInt },
    thalach: { type: GraphQLFloat },
    exang: { type: GraphQLInt },
    oldpeak: { type: GraphQLFloat },
    slope: { type: GraphQLInt },
    ca: { type: GraphQLInt },
    thal: { type: GraphQLInt },
    num: { type: GraphQLInt },
    updateDate: { type: GraphQLString },
    patients: { type: new GraphQLList(GraphQLString) },
  },
})

const DailyVitalType = new GraphQLObjectType({
  name: 'DailyVital',
  fields: {
    _id: { type: GraphQLID },
    pulseRate: { type: GraphQLString },
    bloodPressure: { type: GraphQLString },
    weight: { type: GraphQLString },
    temperature: { type: GraphQLString },
    updateDate: { type: GraphQLString },
    respRate: { type: GraphQLString },
    patient: { type: UserType },
  },
})

const TipType = new GraphQLObjectType({
  name: 'Tip',
  fields: {
    _id: { type: GraphQLID },
    title: { type: GraphQLString },
    description: { type: GraphQLString },
  },
})

const AlertType = new GraphQLObjectType({
  name: 'Alert',
  fields: {
    _id: { type: GraphQLID },
    message: { type: GraphQLString },
    address: { type: GraphQLString },
    phone: { type: GraphQLString },
    patient: { type: UserType },
  },
})

const AuthenticationResultType = new GraphQLObjectType({
  name: 'AuthenticationResult',
  fields: () => ({
    status: { type: GraphQLString },
    message: { type: GraphQLString },
    data: { type: UserType },
  }),
})

const LoginDataType = new GraphQLObjectType({
  name: 'LoginData',
  fields: () => ({
    token: { type: GraphQLString },
    user: { type: UserType },
  }),
})

const LoginResponseType = new GraphQLObjectType({
  name: 'LoginResponse',
  fields: () => ({
    status: { type: GraphQLString },
    message: { type: GraphQLString },
    data: { type: LoginDataType },
  }),
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
    // getVital
    getVital: {
      type: new GraphQLList(VitalType),
      args: {
        patient: { type: GraphQLString },
      },
      resolve(parent, args) {
        return getVital(parent, args)
      },
    },
    // getDailyVital
    getDailyVital: {
      type: new GraphQLList(DailyVitalType),
      args: {
        patient: { type: GraphQLString },
      },
      resolve(parent, args) {
        return getDailyVitalByPatientId(parent, args)
      },
    },
    // getTip
    getTip: {
      type: new GraphQLList(TipType),
      resolve(parent, args) {
        return getAllTip(parent, args)
      },
    },
    // getAlert
    getAlert: {
      type: new GraphQLList(AlertType),
      args: {
        patient: { type: GraphQLString },
      },
      resolve(parent, args) {
        return getAlert(parent, args)
      },
    },
    // getAlerts
    getAlerts: {
      type: new GraphQLList(AlertType),
      resolve(parent, args) {
        return getAlerts(parent, args)
      },
    },
    isLoggedIn: {
      type: LoginResponseType,
      resolve: isSignedIn,
    },
  },
})

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    // createNewUser
    createNewUser: {
      type: AuthenticationResultType,
      args: {
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        roles: { type: new GraphQLList(GraphQLString) },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        gender: { type: GraphQLString },
        dob: { type: GraphQLString },
      },
      resolve(parent, args) {
        return createNewUser(parent, args)
      },
    },
    // updateUser
    updateUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        roles: { type: new GraphQLList(GraphQLString) },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        gender: { type: GraphQLString },
        dob: { type: GraphQLString },
      },
      resolve(parent, args) {
        return updateUser(parent, args)
      },
    },
    // createNewVital
    createNewVital: {
      type: VitalType,
      args: {
        age: { type: GraphQLInt },
        sex: { type: GraphQLInt },
        cp: { type: GraphQLInt },
        trestbps: { type: GraphQLFloat },
        chol: { type: GraphQLFloat },
        fbs: { type: GraphQLInt },
        restecg: { type: GraphQLInt },
        thalach: { type: GraphQLFloat },
        exang: { type: GraphQLInt },
        oldpeak: { type: GraphQLFloat },
        slope: { type: GraphQLInt },
        ca: { type: GraphQLInt },
        thal: { type: GraphQLInt },
        num: { type: GraphQLInt },
        updateDate: { type: GraphQLString },
        patient: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve(parent, args) {
        return createNewVital(parent, args)
      },
    },
    // updateVital
    updateVital: {
      type: VitalType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: GraphQLInt },
        sex: { type: GraphQLInt },
        cp: { type: GraphQLInt },
        trestbps: { type: GraphQLFloat },
        chol: { type: GraphQLFloat },
        fbs: { type: GraphQLInt },
        restecg: { type: GraphQLInt },
        thalach: { type: GraphQLFloat },
        exang: { type: GraphQLInt },
        oldpeak: { type: GraphQLFloat },
        slope: { type: GraphQLInt },
        ca: { type: GraphQLInt },
        thal: { type: GraphQLInt },
        num: { type: GraphQLInt },
        updateDate: { type: GraphQLString },
        patient: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve(parent, args) {
        return updateVital(parent, args)
      },
    },
    // createNewDailyVital
    createNewDailyVital: {
      type: DailyVitalType,
      args: {
        pulseRate: { type: GraphQLString },
        bloodPressure: { type: GraphQLString },
        weight: { type: GraphQLString },
        temperature: { type: GraphQLString },
        updateDate: { type: GraphQLString },
        respRate: { type: GraphQLString },
        patient: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve(parent, args) {
        return createNewDailyVital(parent, args)
      },
    },
    // updateDailyVital
    updateDailyVital: {
      type: DailyVitalType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        pulseRate: { type: GraphQLString },
        bloodPressure: { type: GraphQLString },
        weight: { type: GraphQLString },
        temperature: { type: GraphQLString },
        updateDate: { type: GraphQLString },
        patient: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve(parent, args) {
        return updateDailyVital(parent, args)
      },
    },
    // createNewTip
    createNewTip: {
      type: TipType,
      args: {
        title: { type: GraphQLString },
        description: { type: GraphQLString },
      },
      resolve(parent, args) {
        return createNewTip(parent, args)
      },
    },
    // updateTip
    updateTip: {
      type: TipType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        title: { type: GraphQLString },
        description: { type: GraphQLString },
      },
      resolve(parent, args) {
        return updateTip(parent, args)
      },
    },
    // createNewAlert
    createNewAlert: {
      type: AlertType,
      args: {
        message: { type: GraphQLString },
        address: { type: GraphQLString },
        phone: { type: GraphQLString },
        patient: { type: GraphQLID },
      },
      resolve(parent, args) {
        return createNewAlert(parent, args)
      },
    },
    // updateAlert
    updateAlert: {
      type: AlertType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        message: { type: GraphQLString },
        address: { type: GraphQLString },
        phone: { type: GraphQLString },
        patient: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve(parent, args) {
        return updateAlert(parent, args)
      },
    },
    prediction: {
      type: GraphQLString,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => prediction(parent, args),
    }, // Add a comma here
    // login
    login: {
      type: LoginResponseType,
      args: {
        email: { type: GraphQLString },
        password: { type: GraphQLString },
      },
      resolve: authenticate,
    },
    logOut: {
      type: GraphQLString,
      resolve: (parent, args, { res }) => {
        res.clearCookie('token')
        return 'Logged out successfully!'
      },
    },
  },
})

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation,
})
