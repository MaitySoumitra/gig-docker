const { loginUser } = require("../../controller/userController");
const User = require("../../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const redisClient = require("../../config/redis");

jest.mock("../../models/User");
jest.mock("jsonwebtoken");
jest.mock("bcrypt");
jest.mock("../../config/redis");

describe("loginUser Controller", () => {

    let req;
    let res;

    beforeEach(() => {

        req = {
            body: {
                email: "test@gmail.com",
                password: "123456"
            }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn()
        };

        jest.clearAllMocks();

    });

    // =========================
    // SUCCESS LOGIN
    // =========================
    test("should login successfully", async () => {

        const fakeUser = {
            _id: "123",
            name: "Test",
            email: "test@gmail.com",
            password: "hashedpassword",
            role: "user"
        };

        User.findOne.mockResolvedValue(fakeUser);

        bcrypt.compare.mockResolvedValue(true);

        jwt.sign.mockReturnValue("fake-jwt-token");

        redisClient.set.mockResolvedValue(true);

        await loginUser(req, res);

        expect(User.findOne).toHaveBeenCalledWith({
            email: "test@gmail.com"
        });

        expect(bcrypt.compare).toHaveBeenCalledWith(
            "123456",
            "hashedpassword"
        );

        expect(jwt.sign).toHaveBeenCalled();

        expect(redisClient.set).toHaveBeenCalled();

        expect(res.cookie).toHaveBeenCalled();

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith({
            message: "Login success",
            user: {
                id: fakeUser._id,
                name: fakeUser.name,
                role: fakeUser.role
            }
        });

    });

    // =========================
    // USER NOT FOUND
    // =========================
    test("should return 401 if user not found", async () => {

        User.findOne.mockResolvedValue(null);

        await loginUser(req, res);

        expect(User.findOne).toHaveBeenCalled();

        expect(res.status).toHaveBeenCalledWith(401);

        expect(res.json).toHaveBeenCalledWith({
            message: "Invalid credentials"
        });

    });

    // =========================
    // WRONG PASSWORD
    // =========================
    test("should return 401 for wrong password", async () => {

        const fakeUser = {
            _id: "123",
            email: "test@gmail.com",
            password: "hashedpassword"
        };

        User.findOne.mockResolvedValue(fakeUser);

        bcrypt.compare.mockResolvedValue(false);

        await loginUser(req, res);

        expect(bcrypt.compare).toHaveBeenCalled();

        expect(res.status).toHaveBeenCalledWith(401);

        expect(res.json).toHaveBeenCalledWith({
            message: "Invalid credentials"
        });

    });

    // =========================
    // DATABASE ERROR
    // =========================
    test("should return 500 if database fails", async () => {

        User.findOne.mockRejectedValue(
            new Error("Database Error")
        );

        await loginUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            message: "server error"
        });

    });

    // =========================
    // REDIS ERROR
    // =========================
    test("should return 500 if redis fails", async () => {

        const fakeUser = {
            _id: "123",
            name: "Test",
            email: "test@gmail.com",
            password: "hashedpassword",
            role: "user"
        };

        User.findOne.mockResolvedValue(fakeUser);

        bcrypt.compare.mockResolvedValue(true);

        jwt.sign.mockReturnValue("fake-jwt-token");

        redisClient.set.mockRejectedValue(
            new Error("Redis Error")
        );

        await loginUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);

    });

    // =========================
    // JWT ERROR
    // =========================
    test("should return 500 if jwt fails", async () => {

        const fakeUser = {
            _id: "123",
            name: "Test",
            email: "test@gmail.com",
            password: "hashedpassword",
            role: "user"
        };

        User.findOne.mockResolvedValue(fakeUser);

        bcrypt.compare.mockResolvedValue(true);

        jwt.sign.mockImplementation(() => {
            throw new Error("JWT Error");
        });

        await loginUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);

    });

});