const bcrypt = require("bcryptjs");

const User = require("../models/User");

const generateToken = require("../utils/generateToken");


const register = async (req, res) => {
    console.log("1. Register hit");

    try {
        console.log("2. Body:", req.body);

        const { name, email, password } = req.body;

        console.log("3. Before findOne");

        const existingUser = await User.findOne({ email });

        console.log("4. After findOne");

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists",
            });
        }

        console.log("5. Before hash");

        const hashedPassword = await bcrypt.hash(password, 10);

        console.log("6. After hash");

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        console.log("7. User created");

        const token = generateToken(user._id);

        console.log("8. Token generated");

        return res.status(201).json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                isOnline: user.isOnline,
            },
        });

    } catch (error) {
        console.error("REGISTER ERROR:", error);

        return res.status(500).json({
            message: error.message,
        });
    }
};








const login = async(req,res)=>{

try{


const {
email,
password
}=req.body;



const user =
await User.findOne({email});



if(!user){

return res.status(400).json({

message:"Invalid credentials"

});

}




const isMatch =
await bcrypt.compare(

password,

user.password

);



if(!isMatch){

return res.status(400).json({

message:"Invalid credentials"

});

}




const token =
generateToken(user._id);



res.status(200).json({

token,

user:{

_id:user._id,

name:user.name,

email:user.email,

avatar:user.avatar,

isOnline:user.isOnline,

}

});


}

catch(error){

res.status(500).json({

message:error.message

});

}


};





module.exports = {

register,

login,

};