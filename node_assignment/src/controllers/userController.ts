import { Request, Response } from "express";
import { connectDB } from "../db";
import { User } from "../models/user";
import { Post } from "../models/post";
import { Comment } from "../models/comment";
import axios from "axios";

const JSON_PLACEHOLDER = "https://jsonplaceholder.typicode.com";

export async function loadUsers(req: Request, res: Response) {
  try {
    const db = await connectDB();
    const usersCollection = db.collection<User>("users");
    const postsCollection = db.collection<Post>("posts");
    const commentsCollection = db.collection<Comment>("comments");

    // Fetch users from JSONPlaceholder
    const { data: users } = await axios.get(`${JSON_PLACEHOLDER}/users`);
    
    for (const user of users) {
      const { data: posts } = await axios.get(`${JSON_PLACEHOLDER}/posts?userId=${user.id}`);

      for (const post of posts) {
        const { data: comments } = await axios.get(`${JSON_PLACEHOLDER}/comments?postId=${post.id}`);
        await commentsCollection.insertMany(comments);
      }

      await postsCollection.insertMany(posts);
      await usersCollection.insertOne(user);
    }

    res.status(200).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to load users" });
  }
}

export async function deleteAllUsers(req: Request, res: Response) {
  const db = await connectDB();
  await db.collection("users").deleteMany({});
  await db.collection("posts").deleteMany({});
  await db.collection("comments").deleteMany({});
  res.status(200).json({ message: "All users deleted" });
}

export async function deleteUser(req: Request, res: Response) {
  const db = await connectDB();
  const { userId } = req.params;

  const result = await db.collection("users").deleteOne({ id: parseInt(userId) });
  if (result.deletedCount === 0) return res.status(404).json({ error: "User not found" });

  await db.collection("posts").deleteMany({ userId: parseInt(userId) });
  await db.collection("comments").deleteMany({ postId: parseInt(userId) });

  res.status(200).json({ message: "User deleted" });
}

export async function getUser(req: Request, res: Response) {
  const db = await connectDB();
  const { userId } = req.params;
  const user = await db.collection<User>("users").findOne({ id: parseInt(userId) });

  if (!user) return res.status(404).json({ error: "User not found" });

  const posts = await db.collection<Post>("posts").find({ userId: parseInt(userId) }).toArray();

  for (const post of posts) {
    post["comments"] = await db.collection<Comment>("comments").find({ postId: post.id }).toArray();
  }

  res.status(200).json({ ...user, posts });
}

export async function addUser(req: Request, res: Response) {
  const db = await connectDB();
  const user: User = req.body;

  if (!user || !user.id) return res.status(400).json({ error: "Invalid user data" });

  const existingUser = await db.collection("users").findOne({ id: user.id });

  if (existingUser) return res.status(409).json({ error: "User already exists" });

  await db.collection("users").insertOne(user);
  res.status(201).json({ message: "User added" });
}
