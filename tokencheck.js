const jwt = require("jsonwebtoken");

module.exports = function(req,res,next){
        let jwttoken = req.headers.token;
        let data = jwt.verify(jwttoken,'shhh')
        console.log("data ",data);
        req.data = data;
        next();
}