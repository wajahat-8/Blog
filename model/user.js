const mongoose=require('mongoose')
mongoose.set('strictQuery', false)
const userSchema=new mongoose.Schema({
     blogs:[{
        type:mongoose.Schema.ObjectId,
        ref:'Blog'
    }],
    username:{
        type:String,
        required:true,
        unique:true,
         minlength:3 
    },
    name:String,
    passwordHash:{type:String,
       
    },
   
})
userSchema.set('toJSON',{
    transform:(document,returnedObject)=>{
        returnedObject.id=returnedObject._id.toString()
        delete returnedObject.__v
        delete returnedObject._id
        delete returnedObject.passwordHash
    }
})
const User=mongoose.model('User',userSchema)

module.exports=User