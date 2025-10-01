// import AppError from "../utils/AppError";
// import catchAsync from "../utils/catchAsync";

// const restrict = (...allowed: string[]) => {
//   return catchAsync(async (req, _res, next) => {
//     console.log(req.user.role, allowed);
//     if (!req.user || !allowed.includes(req.user.role)) {
//       return next(
//         new AppError("You do not have permission to perform this action", 403)
//       );
//     }
//     next();
//   });
// };

// export default restrict;
