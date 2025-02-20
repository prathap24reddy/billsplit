import jwt from "jsonwebtoken";
const secret = "secret";

function setUser(user){
    const payload={
        id:user.id,
        username:user.username
    }
    return jwt.sign(payload,secret);
}

function getUser(token){
    return jwt.verify(token,secret);
}

export {setUser, getUser};