import { Router } from 'express';
import { Request, Response } from 'express';
import SocketConnection from '../models/socket_connections.model';
import { successResponse, failureResponse } from '../utils/response';

const router = Router();

router.get('/:userId/:userType', async (req: Request, res: Response) => {
    console.log("Running check-socket-connection");
  try {
    const { userId, userType } = req.params;

    const connection = await SocketConnection.findOne({ 
      userId: userId,
      userType: userType 
    });

    console.log("connection", connection);

    if (!connection) {
      return res.status(404).json(failureResponse('Socket connection not found', {
      }));
      
    }
     res.status(200).json(successResponse('Socket connection found'));

  

  } catch (error: any) {
    res.status(500).json(failureResponse(error.message));
  }
});

export default router;
