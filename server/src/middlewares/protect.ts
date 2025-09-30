// import util from "util";
// import AppError from "../utils/AppError";
// import catchAsync from "../utils/catchAsync";
// import jwt from "jsonwebtoken";
// import { UserPayload } from "../schemas/user.schema";
// import userModel from "../model/user.model";

// const protect = catchAsync(async (req, _res, next) => {
//   // 1) Get token from cookies
//   const token = req.cookies?.jwt;

//   // 2) If no token, block access
//   if (!token) {
//     return next(
//       new AppError("You are not logged in! Please log in to get access.", 401)
//     );
//   }

//   // 3) Verify token
//   const jwtSecret = process.env.ACCESS_JWT_SECRET as string;
//   const verifyToken = util.promisify<string, string, any>(jwt.verify);
//   const decoded = (await verifyToken(token, jwtSecret)) as {
//     id: number;
//     role: string;
//     hospital_id?: number;
//     iat: number;
//   };

//   const lastPasswordUpdate = await userModel.getLastTimePasswordUpdated(
//     decoded.id
//   );
//   if (lastPasswordUpdate) {
//     const passwordChangedTimestamp = Math.floor(
//       new Date(lastPasswordUpdate).getTime() / 1000
//     );

//     if (passwordChangedTimestamp > decoded.iat) {
//       return next(
//         new AppError("Password recently changed! Please log in again.", 401)
//       );
//     }
//   }

//   // 4) Build user payload
//   const user: UserPayload = {
//     id: decoded.id,
//     role: decoded.role,
//     hospital_id: decoded.hospital_id,
//   };

//   // 5) Attach user to request
//   req.user = user;
//   next();
// });

// export default protect;
