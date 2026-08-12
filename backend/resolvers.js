const { GraphQLError } = require("graphql");
const jwt = require("jsonwebtoken");
const { PubSub } = require("graphql-subscriptions");

const Person = require("./models/person");
const User = require("./models/user");
const pubsub = new PubSub();

const resolvers = {
  Query: {
    personCount: async () => Person.collection.countDocuments(),
    allPersons: async (root, args) => {
      if (!args.phone) {
        return Person.find().populate("friendOf");
      }

      return Person.find({ phone: { $exists: args.phone === "YES" } }).populate(
        "friendOf",
      );
    },
    findPerson: async (root, args) => Person.findOne({ name: args.name }),
    me: (root, args, context) => context.currentUser,
  },

  Person: {
    address: ({ street, city }) => ({ street, city }),
  },

  Mutation: {
    addPerson: async (root, args, context) => {
      const currentUser = context.currentUser;

      if (!currentUser) {
        throw new GraphQLError("not authenticated", {
          code: "UNAUTHENTICATED",
        });
      }

      if (await Person.exists({ name: args.name })) {
        throw new GraphQLError(`Name must be unique: ${args.name}`, {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.name,
          },
        });
      }

      const person = new Person({ ...args });

      try {
        await person.save();
        currentUser.friends = currentUser.friends.concat(person);
        await currentUser.save();
        person.friendOf = person.friendOf.concat(currentUser._id);
        await person.save();
      } catch (error) {
        throw new GraphQLError(`Saving person failed: ${error.message}`, {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.name,
          },
        });
      }

      pubsub.publish("PERSON_ADDED", { personAdded: person });

      return person;
    },

    editPhone: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError("Not authenitacated");
      }
      let person = await Person.findOne({ name: args.name });

      if (!person) {
        throw new GraphQLError(`Person does not exist`);
      }

      person.phone = args.phone;

      try {
        await person.save();
      } catch (error) {
        throw new GraphQLError(`Saving number failed: ${error.message}`, {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.name,
          },
        });
      }

      return person;
    },

    createUser: async (root, args) => {
      const user = new User({ username: args.username });

      try {
        await user.save();
      } catch (error) {
        throw new GraphQLError(`Creating user failed: ${error.message}`);
      }

      return user;
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== "secret") {
        throw new GraphQLError(`wrong credentaials`);
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      };

      return { value: jwt.sign(userForToken, process.env.TOKENKEY) };
    },

    addFriend: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError("not authenticated");
      }

      const notFriendAlready = (person) =>
        !currentUser.friends
          .map((f) => f._id.toString())
          .includes(person._id.toString());

      const person = await Person.findOne({ name: args.name });

      if (!person) {
        throw new GraphQLError(`Person not found: ${args.name}`);
      }

      if (notFriendAlready(person)) {
        currentUser.friends = currentUser.friends.concat(person);
        person.friendOf = person.friendOf.concat(currentUser._id);
      }

      try {
        await currentUser.save();
        await person.save();
      } catch (error) {
        throw new Error("Unable to add friend");
      }

      return currentUser;
    },
  },

  Subscription: {
    personAdded: {
      subscribe: () => pubsub.asyncIterableIterator("PERSON_ADDED"),
    },
  },
};

module.exports = resolvers;
