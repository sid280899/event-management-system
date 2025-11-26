import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Profile name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  timezone: {
    type: String,
    required: [true, 'Timezone is required'],
    default: 'UTC'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});


profileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});


profileSchema.statics.getActiveProfiles = function() {
  return this.find({ isActive: true });
};


profileSchema.methods.getProfileInfo = function() {
  return {
    id: this._id,
    name: this.name,
    timezone: this.timezone,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

const Profile = mongoose.model('Profile', profileSchema);

export default Profile;