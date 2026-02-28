const jwt = require("jsonwebtoken")

const authentication = async(req, res, next)=>{
    const{token}= req.cookies
    //check it token exists / user logged in
    if(!token){
        console.log(" No token found in cookies");
    return res.status(401).json({ message: "Not authenticated" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (error, payload)=>{
        if(error){
            console.log("JWT error:", error.message);
        return res.status(401).json({ message: "Session expired" })
        } 
        req.user= {id:payload.id, role:payload.role}
        
        next()
    })

}

module.exports = authentication 