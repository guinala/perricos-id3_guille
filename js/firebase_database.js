import { db } from "./firebase_init.js";


async function addUser(name, mail, password)
{
    const docRef = await addDoc(collection(db, "cities"), {
        name: "Tokyo",
        country: "Japan"
    });
}