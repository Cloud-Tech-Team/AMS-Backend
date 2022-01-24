const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
        
        try {
          const token = req.headers.authorization.split(" ")[1];
          const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY);
          req.userData = decoded;
          next();
        } catch(err) {
            console.log(err.message)
            return res.status(401).json({
                message: err.message
            })

        }

};
