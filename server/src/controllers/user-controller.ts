import type { Request, Response } from 'express';
import User from '../models/User.js';
import { signToken } from '../services/auth.js';
import type { JwtPayload } from '../services/auth.js';

/**
 * Get the currently authenticated user
 */
export const getSingleUser = async (req: Request, res: Response) => {
  const user = (req as any).user as JwtPayload | null;
  if (!user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const foundUser = await User.findById(user._id).select('-password -__v');
  if (!foundUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json(foundUser);
};

/**
 * Register a new user and return a signed JWT
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    const user = await User.create(req.body);
    const payload: JwtPayload = {
      _id: user.id,
      username: user.username,
      email: user.email,
    };
    const token = signToken(payload);
    return res.json({ token, user });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

/**
 * Authenticate user credentials and return a signed JWT
 */
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.isCorrectPassword(password))) {
    return res.status(400).json({ message: 'Incorrect credentials' });
  }

  const payload: JwtPayload = {
    _id: user.id,
    username: user.username,
    email: user.email,
  };
  const token = signToken(payload);
  return res.json({ token, user });
};

/**
 * Save a book to the authenticated user's saved list
 */
export const saveBook = async (req: Request, res: Response) => {
  const user = (req as any).user as JwtPayload | null;
  if (!user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $addToSet: { savedBooks: req.body } },
      { new: true, runValidators: true }
    );
    return res.json(updatedUser);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

/**
 * Remove a book from the authenticated user's saved list
 */
export const deleteBook = async (req: Request, res: Response) => {
  const user = (req as any).user as JwtPayload | null;
  if (!user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $pull: { savedBooks: { bookId: req.params.bookId } } },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: 'Could not find user to update' });
    }
    return res.json(updatedUser);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};
