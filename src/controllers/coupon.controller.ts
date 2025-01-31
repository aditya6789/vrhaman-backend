// coupon controller
import { Request, Response } from "express";
import Coupon from "../models/coupon.model";
import { successResponse, failureResponse } from "../utils/response";
import Joi from "joi";
// create coupon
const createCoupon = async (req: Request, res: Response) => {
  const { code, discount, expirationDate } = req.body;


  // joi validation
  const schema = Joi.object({
    code: Joi.string().required(),
    discount: Joi.number().required(),
    expirationDate: Joi.date().required(),
    maxUses: Joi.number().optional(),
    isActive: Joi.boolean().optional(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json(failureResponse(error.details[0].message));

  try {
    const coupon = await Coupon.create({ code, discount, expirationDate });
    res.status(201).json(successResponse("Coupon created successfully.", { coupon }));
  } catch (err) {
    console.error("Create Coupon Error:", err);
    res.status(500).json(failureResponse("Internal server error."));
  }
};

// get all coupons
const getAllCoupons = async (req: Request, res: Response) => {
  try {
    const coupons = await Coupon.find();
    res.status(200).json(successResponse("Coupons retrieved successfully.", { coupons }));
  } catch (err) {
    console.error("Get All Coupons Error:", err);
    res.status(500).json(failureResponse("Internal server error."));
  }
};

// get coupon by code
const getCouponByCode = async (req: Request, res: Response) => {
  const { code } = req.params;

  try {
    const coupon = await Coupon.findOne({ code });
    if (!coupon) return res.status(404).json(failureResponse("Coupon not found."));

    res.status(200).json(successResponse("Coupon retrieved successfully.", { coupon }));
  } catch (err) {

    console.error("Get Coupon By Code Error:", err);
    res.status(500).json(failureResponse("Internal server error."));
  }
};

// update coupon
const updateCoupon = async (req: Request, res: Response) => {

  const { code } = req.params;

  try {
    const coupon = await Coupon.findOneAndUpdate({ code }, req.body, { new: true });
    if (!coupon) return res.status(404).json(failureResponse("Coupon not found."));

    res.status(200).json(successResponse("Coupon updated successfully.", { coupon }));
  } catch (err) {
    console.error("Update Coupon Error:", err);
    res.status(500).json(failureResponse("Internal server error."));
  }
};

// delete coupon
const deleteCoupon = async (req: Request, res: Response) => {
  const { code } = req.params;

  try {
    const coupon = await Coupon.findOneAndDelete({ code });
    if (!coupon) return res.status(404).json(failureResponse("Coupon not found."));

    res.status(200).json(successResponse("Coupon deleted successfully.", { coupon }));
  } catch (err) {
    console.error("Delete Coupon Error:", err);
    res.status(500).json(failureResponse("Internal server error."));
  }
};



export { createCoupon, getAllCoupons, getCouponByCode, updateCoupon, deleteCoupon };

