// src/controllers/admincontroller.ts

import { Response } from "express";
import Joi from "joi";
import Booking from "../models/booking.model";
import Vehicle from "../models/vehicle.model";
import Vendor from "../models/vendor.model";
import { AuthenticatedRequest } from "../types/auth";
import User from "../models/user.model";




const SUPER_PASSWORD="ABCDEFGH"

async function createAdmin(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, email, superPassword, password } = req.body;
    // Validate input data using Joi
    const schema = Joi.object({
      name: Joi.string().required(),
      password: Joi.string().required(),
    });


    if(superPassword===SUPER_PASSWORD){
      await User.create({ name, email, password, role: "admin" });
      return res.status(200).json({ message: "Admin created successfully" });
    }
    else{
      return res.status(400).json({ message: "Invalid credentials" });
    }

  }
  catch (error) {
    console.error("Error creating admin: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }


  
 
}





