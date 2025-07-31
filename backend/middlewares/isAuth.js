import jwt from 'jsonwebtoken';

const isAuth = async (req, res, next) => {
   try{
      const token = req.cookies.token;
      if(!token){
         return res.status(401).json({message: "Unauthorized !!Token not found"});
      }
      const decoded = await jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.id;
      next();
   } catch(error){
      console.error("Authentication error:", error);
      return res.status(401).json({message: "Unauthorized !! Invalid token"});
   }
};

export default isAuth;