const {OAuth2Client} = require("google-auth-library")
const jwt = require("jsonwebtoken")
const staffModel = require("../models/staffModel")
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


const googleLogin = async(req,res)=>{
    try {
        const {token} = req.body

        if(!token){
            return res.status(400).json({message: "token is required"})
        }
        const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
              });
         const { email, given_name, family_name } = ticket.getPayload()

         let user = await staffModel.findOne({email });
         if(!user){
            user = await staffModel.create({
                email,
                firstName: given_name,
                lastName: family_name,
                password: null,
                authProvider: "google",
                role: "staff"
              });
         }

         if (user.role !== "staff") {
          return res.status(403).json({
            message: "Google login not allowed for this role",
          });
        }
        
         const appToken = jwt.sign(
            { 
              id: user._id, role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
          );

          res.status(200).json({
            success: true,
            token: appToken,
            user:{
              id: user._id,
              email: user.email,
              role: user.role,
            }
            
          })
          
    } catch (error) {
        console.error("Google login error:", error);
        res.status(401).json({ message: "Google authentication failed" });
        
    }
}

module.exports = googleLogin