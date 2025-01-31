import { Request, Response } from 'express';
import VendorVehicle from '../models/vendor_vehicle.model';
import vendorModel from '../models/vendor.model';

// Helper function to convert km to meters
const kmToMeters = (km: number) => km * 1000;

interface VendorPopulated {
  _id: string;
  business_name: string;
  business_address: string;
  pickup_location: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

interface VehicleWithVendor {
  vendor_id: VendorPopulated | any;
  [key: string]: any;
}

// Search API function
export const searchVehicles = async (req: Request, res: Response) => {
  console.log("searchVehicles");
  try {
    const { location, startDate, duration, vehicleType } = req.body;
    console.log("Received location:", location);
    const searchRadius = 20; // 20km radius

    // Parse location
    let searchLat: number | null = null;
    let searchLng: number | null = null;
    if (location && typeof location === 'object') {
      // Handle direct object
      searchLat = parseFloat(location.latitude);
      searchLng = parseFloat(location.longitude);
    } else if (location) {
      // Handle string
      try {
        const locationObj = JSON.parse(location as string);
        searchLat = parseFloat(locationObj.latitude);
        searchLng = parseFloat(locationObj.longitude);
      } catch (e) {
        console.log("Error parsing location:", e);
      }
    }

    console.log("Searching with coordinates:", { searchLat, searchLng });

    // Define base search criteria
    const searchCriteria: any = {
      availability_status: "Available",
    };

    // Get vendors within radius with more flexible range
    let vendorsInRange: any[] = [];
    if (searchLat !== null && searchLng !== null) {
      const latRange = searchRadius / 111.32; // roughly 1 degree = 111.32 km
      const lngRange = searchRadius / (111.32 * Math.cos(searchLat * Math.PI / 180));

      console.log("Searching vendors in ranges:", {
        latMin: searchLat - latRange,
        latMax: searchLat + latRange,
        lngMin: searchLng - lngRange,
        lngMax: searchLng + lngRange
      });

      vendorsInRange = await vendorModel.find({
        'pickup_location.latitude': {
          $gte: searchLat - latRange,
          $lte: searchLat + latRange
        },
        'pickup_location.longitude': {
          $gte: searchLng - lngRange,
          $lte: searchLng + lngRange
        }
      }).select('_id pickup_location business_name').lean();

      console.log("Found vendors:", vendorsInRange.length);
    }

    // Add vendor filter to search criteria if vendors found
    if (vendorsInRange.length > 0) {
      searchCriteria.vendor_id = {
        $in: vendorsInRange.map(vendor => vendor._id)
      };
    } else {
      // If no vendors in range, return empty result
      return res.status(200).json({
        success: true,
        message: 'No vehicles found in your area.',
        data: {
          vehicles: [],
          searchRadius,
          totalResults: 0
        },
      });
    }

    // Add vehicle type filter if provided
    if (vehicleType) {
      console.log("Adding vehicle type filter:", vehicleType);
      searchCriteria['vehicle_id.type'] = vehicleType;
      console.log("searchCriteria", searchCriteria);
    }

    console.log("Final search criteria:", JSON.stringify(searchCriteria, null, 2));

    // Filter by time availability if dates provided
    if (startDate && duration) {
      const startTime = new Date(startDate as string);
      const durationHours = parseInt(duration as string);
      if (!isNaN(durationHours)) {
        const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);
        searchCriteria.bookings = {
          $not: {
            $elemMatch: {
              start_date: { $lt: endTime },
              end_date: { $gt: startTime },
              status: { $in: ['Accepted', 'Pending'] }
            }
          }
        };
      }
    }

    // Query vehicles with populated data
    const vehicles = await VendorVehicle.find({
      availability_status: "Available",
      vendor_id: {
        $in: vendorsInRange.map(vendor => vendor._id)
      }
    })
    .populate({
      path: 'vehicle_id',
      select: 'name type make variant engine_cc fuel_type body_type features',
      match: vehicleType ? { type: vehicleType } : {} // Filter type during population
    })
    .populate({
      path: 'vendor_id',
      select: 'business_name business_address pickup_location'
    })
    .lean()
    .then(docs => {
      // Filter out any vehicles where population failed (null vehicle_id)
      return (docs.filter(doc => doc.vehicle_id !== null) as unknown as VehicleWithVendor[]);
    });

    // Calculate distance for each vehicle and add to response
    const vehiclesWithDistance = vehicles.map(vehicle => {
      if (searchLat !== null && searchLng !== null && vehicle.vendor_id?.pickup_location) {
        const vendorLat = vehicle.vendor_id.pickup_location.latitude;
        const vendorLng = vehicle.vendor_id.pickup_location.longitude;
        const distance = calculateDistance(
          searchLat,
          searchLng,
          vendorLat,
          vendorLng
        );
        return { ...vehicle, distance: Math.round(distance * 10) / 10 };
      }
      return vehicle;
    });

    // Sort by distance if location provided
    if (searchLat !== null && searchLng !== null) {
      vehiclesWithDistance.sort((a: any, b: any) => (a.distance || 0) - (b.distance || 0));
    }

    console.log("vehiclesWithDistance", vehiclesWithDistance);
    console.log("searchRadius", searchRadius);
    console.log("totalResults", vehiclesWithDistance.length);

    res.status(200).json({
      success: true,
      message: 'Vehicles retrieved successfully.',
      data: {
        vehicles: vehiclesWithDistance,
        searchRadius,
        totalResults: vehiclesWithDistance.length
      },
    });
  } catch (error: any) {
    console.error("Error in searchVehicles:", error);
    res.status(500).json({ 
      success: false, 
      message: 'Search failed', 
      error: error.message 
    });
  }
};

// Helper function to calculate distance using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

function toRad(degrees: number): number {
  return degrees * (Math.PI/180);
}
