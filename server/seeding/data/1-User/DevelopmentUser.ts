import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { data } from "../../data"

export = {
    _id: data.users.development.id,
    username: "Development User",
    credentials: {
        email: "anthony@norderhaug.org",
        password: bcrypt.hashSync("password123", 10)
    },
    pfpPath: "fucker",
    desc: "This is the development account for testing.",
    followers: [],
    boardsFollowed: [],
    usersFollowed: [],
    notifications: []
}