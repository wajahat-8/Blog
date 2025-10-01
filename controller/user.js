const bcrypt = require("bcryptjs");
const userRouter=require("express").Router()
const User=require('../model/user')
userRouter.get('/',async(request,response)=>{
    const users= await User.find({}).populate('blogs',{ title: 1,author: 1 })
    response.json(users)
})
userRouter.post('/',async(request,response)=>{
   const{username,name,password}=request.body
   if(!password||password.length<3){
    return response.status(400).json({
         error: "Password must be at least 3 characters long",
    })
   }
   const slatRounds=10
   const passwordHash=await bcrypt.hash(password,slatRounds)
   const user=new User({
    username,
    name,
    passwordHash
   })
  const savedUser= await user.save()
   response .status(201).json(savedUser)
})
module.exports=userRouter

