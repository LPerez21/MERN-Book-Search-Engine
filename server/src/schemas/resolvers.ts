import { AuthenticationError } from 'apollo-server-express';
import User from '../models/User.js';
import { signToken } from '../services/auth.js';

// Give resolvers an explicit `any` type so TS won’t leak internal IUser types
const resolvers: any = {
  Query: {
    me: async (_parent: any, _args: any, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }
      return User.findById(context.user._id).select('-password -__v');
    },
  },

  Mutation: {
    addUser: async (_parent: any, args: any) => {
      const user = await User.create(args);
      const payload = {
        _id: user.id,
        username: user.username,
        email: user.email,
      };
      const token = signToken(payload);
      return { token, user };
    },

    login: async (_parent: any, { email, password }: any) => {
      const user = await User.findOne({ email });
      if (!user || !(await user.isCorrectPassword(password))) {
        throw new AuthenticationError('Incorrect credentials');
      }
      const payload = {
        _id: user.id,
        username: user.username,
        email: user.email,
      };
      const token = signToken(payload);
      return { token, user };
    },

    saveBook: async (_parent: any, { bookData }: any, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('You need to be logged in');
      }
      return User.findByIdAndUpdate(
        context.user._id,
        { $addToSet: { savedBooks: bookData } },
        { new: true }
      );
    },

    removeBook: async (_parent: any, { bookId }: any, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('You need to be logged in');
      }
      return User.findByIdAndUpdate(
        context.user._id,
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      );
    },
  },
};

export default resolvers;
