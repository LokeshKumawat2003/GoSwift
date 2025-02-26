import express from "express";
import { loadUsers, deleteAllUsers, deleteUser, getUser, addUser } from "../controllers/userController";

const router = express.Router();

router.get("/load", loadUsers);
router.delete("/users", deleteAllUsers);
router.delete("/users/:userId", deleteUser);
router.get("/users/:userId", getUser);
router.put("/users", addUser);

export default router;
