/* eslint-disable class-methods-use-this */
import User from '../model/User.model';
import UserActivity from '../model/UserActivity.model';
 class UserServices {
   

  
  showUser = async () =>{


  }

  updateUser = async(req,res,decodedToken)=>{
    const updatedUser = await User.findOneAndUpdate({ _id: decodedToken._id }, { $set: { firstName: req.body.firstName } }, { new: true }, (err, updatedObeject) => {
      if (err) {
        return ('Something wrong when updating data!');
      }
      return updatedObeject;
    });
    return updatedUser;
  }

  saveLoggedInUser=async(req,res,user)=>{
    const userActivity = new UserActivity({
            userId: user._id,
            ipAddress: req.ip,
            uaString: req.headers['user-agent']
    });
          try{
               const userActivities= await userActivity.save();
                return userActivities;
          }
          catch(err){
            return 'somthing went wrong!';
          }
  }



}

export default new UserServices();

