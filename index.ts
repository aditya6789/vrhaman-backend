import express from "express";
import cors from "cors";
import http from "http";
import path from "path";
import { connectDB } from "./src/db/db";
import { router } from "./src/router/index";
import { Server } from 'socket.io';
import auth from "./src/middleware/auth";
import jwt from "jsonwebtoken";
import logger from "express-requests-logger";
import SocketConnection from "./src/models/socket_connections.model";
import { AuthSocket, Location } from "./src/types/socket_types";
import userModel from "./src/models/user.model";
import JwtService from "./src/services/JwtService";
import { Server as SocketIOServer } from 'socket.io';
// import { JWT_SECRET } from "./config";

// import JwtService from "./src/services/jwt.service";


const app = express();
app.use(express.json());
app.use(cors());
// app.use(logger());
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use(express.static(path.join("./", "public")));

app.use(auth);

app.use("/api", router);



// Apply auth middleware only to /api routes

const PORT = 5000;

connectDB()
  .then(() => {
    const server = http.createServer(app);


    // Createing SocketIO Server
    const io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    console.log('Socket.IO server initialized');

    // Authentication middleware for Socket.IO
    io.use((socket: AuthSocket, next) => {
      console.log("Socket connection attempt:", socket.id);
      const token = socket.handshake.auth.token;

      if (token) {
        jwt.verify(token, process.env.JWT_SECRET as string, (err: any, decoded: any) => {
          if (err) {
            console.log("JWT verification failed:", err);
            return next(new Error("Authentication error"));
          } else {
            socket.user = decoded.username;
            next();
          }
        });
      } else {
        next(new Error("Authentication error"));
      }
    });

    io.on("connection", (socket: AuthSocket) => {
      console.log("New connection: ", socket.id);
      console.log("Handshake auth: ", socket.handshake.auth);
    });

    // Connection handler
    io.on("connection", (socket: AuthSocket) => {
      console.log("New socket connection:", socket.id);
      
      socket.emit('connected', { message: 'Successfully connected' });

      socket.on("error", (error) => {
        console.error("Socket error:", error);
      });

      // Handle vendor registration
      socket.on("register", async (data: { vendorId: string, role: string }) => {
        try {
          console.log("Vendor registered:", data);

          await SocketConnection.deleteMany({ userId: data.vendorId,  });
          const connection = await SocketConnection.findOne({ userId: data.vendorId, userType: data.role });
          if(connection){
            return ;
          }
          // Store socket connection with vendor ID
          await SocketConnection.create({
            socketId: socket.id,
            userId: data.vendorId,
            userType: data.role
          });

          // Join vendor-specific room
          
          socket.emit("registered", { success: true });
        } catch (err) {
          console.error("Vendor registration error:", err);
          socket.emit("error", { message: "Registration failed" });
        }
      });

      socket.on("register-customer",async (data: { customerId: string, role: string }) => {
        try {
          await SocketConnection.deleteMany({ userId: data.customerId, userType: data.role });
          await SocketConnection.create({
            socketId: socket.id,
            userId: data.customerId,
            userType: data.role
          });
          console.log("Customer registered:", data);
          socket.emit("registered", { success: true });
        } catch (err) {
          console.error("Customer registration error:", err);
          socket.emit("error", { message: "Registration failed" });
        }
      });

      // Handle disconnection
      socket.on("disconnect", async () => {
        try {
          await SocketConnection.deleteOne({ socketId: socket.id });
          console.log("Socket disconnected:", socket.id);
        } catch (err) {
          console.error("Disconnect error:", err);
        }
      });
    });


    app.locals.io = io;

    // Listen TO http server

    server
      .listen(PORT, "0.0.0.0", () => {
        console.log(`Server connected to port ${PORT}`);
      })
      .on("error", (err) => {
        console.error(`Error starting the server: ${err.message}`);
      });

    // Make io available globally
    // declare global {
    //   var io: SocketIOServer;
    // }
    global.io = io;
  })
  .catch((err) => {
    console.error(`Error connecting to the database: ${err.message}`);
  });

  // Add function to emit booking notifications
export const notifyVendor = async (vendorId: string, bookingData: any) => {
  try {
    const io = app.locals.io;
    io.to(`vendor:${vendorId}`).emit("newBooking", bookingData);
  } catch (err) {
    console.error("Error sending notification:", err);
  }
};

 