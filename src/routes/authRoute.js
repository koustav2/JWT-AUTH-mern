const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();
const prisma = new PrismaClient();

router.get('/', (req, res) => {
    res.send("Hello from auth route");
});

router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    try {
        await prisma.user.create({
            data: {
                email,
                username,
                hashedPassword,
            }
        });
        res.status(200).json({ message: "Registration successful" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
})

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: {
                email: email,
            }
        });
        if (!user) {
            throw new Error("User does not exist");
        }
        const valid = await bcrypt.compare(password, user.hashedPassword);
        if (!valid) {
            throw new Error("Incorrect password");
        }
        const token = jwt.sign({ email }, process.env.JWT_KEY);
        const id = user.id;
        res.status(200).json({ token, id,user, message: "Login successful" });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
});


function authenticateToken(req, res, next) {
    const token = req.header("Authorization");
    if (!token) {
        return res.status(401).json({ message: "You are not logged in" });
    }
    jwt.verify(token, process.env.JWT_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token" });
        }
        req.user = user;
        next();
    });
}


router.post("/logout", authenticateToken, (req, res) => {
    res.json({ message: "Logout successful" });
});
module.exports = router;
