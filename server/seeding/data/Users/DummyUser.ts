import { ObjectId } from "mongodb";
import { container } from "tsyringe";
import { dummyData } from "seeding/data";
import { PASSWORD_HASH_CONSTANT } from "seeding/constants.js";

export const dummyUsers = [
    {
        _id: dummyData.users.A.id,
        username: "User A",
        credentials: { 
            email: "anthony@norderhaug.org",
            password: PASSWORD_HASH_CONSTANT
        },
        pfpPath: "",
        desc: "User A sample acc.",
    },
    {
        _id: dummyData.users.B.id,
        username: "User B",
        credentials: { 
            email: "anthony@norderhaug.org",
            password: PASSWORD_HASH_CONSTANT
        },
        pfpPath: "",
        desc: "User B sample acc.",
    },
    {
        _id: dummyData.users.C.id,
        username: "User C",
        credentials: { 
            email: "anthony@norderhaug.org",
            password: PASSWORD_HASH_CONSTANT
        },
        pfpPath: "",
        desc: "User C sample acc.",
    }
]