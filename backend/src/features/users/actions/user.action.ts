"use server";

import User from "../Model";
import { connectDB } from "../../../lib/db";

export async function createUser(user: any) {
  try {
    await connectDB();
    const newUser = await User.create(user);
    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    console.log(error);
  }
}

export async function deleteUser(clerkID: string) { 
  try {
    await connectDB();
    const userToDelete = await User.findOne({ clerkID });

    if (!userToDelete) {
        throw new Error("User not found");
}
    const deletedUser = await User.findByIdAndDelete(userToDelete._id);

    return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null;
} catch (error) {
    console.log('error deleting user:', error);
}
}