import mongoose, { Model, Types } from "mongoose";

// Define the Address interface
export interface IAddress {
  type: "home" | "office" | "other";
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

// Define size profile interface
export interface ISizeProfile {
  topSize?: string;
  bottomSize?: string;
  shoeSize?: string;
  dressSize?: string;
}

// Define social media interface
export interface ISocialMedia {
  instagram?: string;
  facebook?: string;
  twitter?: string;
}

// Define preferences interface
export interface IPreferences {
  preferredSizes?: Array<{
    category: string;
    size: string;
  }>;
  favoriteColors?: string[];
  stylePref?: string[];
  fitPreference?: "Slim" | "Regular" | "Loose" | "Oversized";
}

// Define measurements interface
export interface IMeasurements {
  chest?: number;
  waist?: number;
  hips?: number;
  height?: number;
  weight?: number;
  unit: "metric" | "imperial";
}

// Main profile interface
export interface IUserProfile {
  user: Types.ObjectId;
  avatar?: string;
  firstName: string;
  lastName?: string;
  dateOfBirth?: Date;
  gender?: "Male" | "Female";
  phone?: string;
  addresses?: IAddress[];
  sizeProfile?: ISizeProfile;
  socialMedia?: ISocialMedia;
  preferences?: IPreferences;
  measurements?: IMeasurements;
  createdAt: Date;
  updatedAt: Date;
}

// Profile methods interface (if you need instance methods)
export interface IProfileMethods {
  getFullName(): string;
  getDefaultAddress(): IAddress | undefined;
}

// Profile document interface
export interface IProfileDocument extends IUserProfile, IProfileMethods, mongoose.Document {
  _id: Types.ObjectId;
}

// Profile model interface
export interface IProfileModel extends Model<IUserProfile, {}, IProfileMethods> {
  findByUserId(userId: string | Types.ObjectId): Promise<IProfileDocument | null>;
  findWithUser(profileId: string | Types.ObjectId): Promise<IProfileDocument | null>;
}

// Validators
const validators = {
  isPhone: (value: string): boolean => {
    // Basic phone validation - adjust regex as needed
    const phoneRegex = /^[\d\s\-\+KATEX_INLINE_OPENKATEX_INLINE_CLOSE]+$/;
    return phoneRegex.test(value) && value.length >= 10 && value.length <= 15;
  },
  isZipCode: (value: string): boolean => {
    // Basic zip code validation - adjust for your country
    const zipRegex = /^[0-9]{5,6}$/; // For Indian pin codes
    return zipRegex.test(value);
  }
};

const profileSchema = new mongoose.Schema<IUserProfile, IProfileModel, IProfileMethods>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    avatar: { 
      type: String, 
      required: false 
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: [30, "First name cannot exceed 30 characters"],
    },
    lastName: {
      type: String,
      required: false,
      trim: true,
      maxlength: [30, "Last name cannot exceed 30 characters"],
    },
    dateOfBirth: {
      type: Date,
      validate: {
        validator: function(value: Date) {
          // Ensure date is not in the future
          return value <= new Date();
        },
        message: "Date of birth cannot be in the future"
      }
    },
    gender: {
      type: String,
      enum: ["Male", "Female"],
    },
    phone: {
      type: String,
      validate: {
        validator: validators.isPhone,
        message: "Please provide a valid phone number",
      },
    },
    addresses: [
      {
        type: {
          type: String,
          enum: ["home", "office", "other"],
          default: "home",
        },
        firstName: { 
          type: String, 
          required: true,
          trim: true,
        },
        lastName: { 
          type: String, 
          required: true,
          trim: true,
        },
        addressLine1: { 
          type: String, 
          required: true,
          trim: true,
        },
        addressLine2: { 
          type: String,
          trim: true,
        },
        city: { 
          type: String, 
          required: true,
          trim: true,
        },
        state: { 
          type: String, 
          required: true,
          trim: true,
        },
        zipCode: {
          type: String,
          required: true,
          validate: {
            validator: validators.isZipCode,
            message: "Please provide a valid zip code",
          },
        },
        country: { 
          type: String, 
          required: true, 
          default: "India",
          trim: true,
        },
        phone: { 
          type: String,
          validate: {
            validator: function(value: string) {
              return !value || validators.isPhone(value);
            },
            message: "Please provide a valid phone number",
          },
        },
        isDefault: { 
          type: Boolean, 
          default: false 
        },
      },
    ],
    sizeProfile: {
      topSize: { type: String },
      bottomSize: { type: String },
      shoeSize: { type: String },
      dressSize: { type: String },
    },
    socialMedia: {
      instagram: { 
        type: String,
        trim: true,
      },
      facebook: { 
        type: String,
        trim: true,
      },
      twitter: { 
        type: String,
        trim: true,
      },
    },
    preferences: {
      preferredSizes: [
        {
          category: { type: String },
          size: { type: String },
        },
      ],
      favoriteColors: [{ 
        type: String,
        trim: true,
      }],
      stylePref: [{ 
        type: String,
        trim: true,
      }],
      fitPreference: {
        type: String,
        enum: ["Slim", "Regular", "Loose", "Oversized"],
      },
    },
    measurements: {
      chest: { 
        type: Number,
        min: [0, "Chest measurement must be positive"],
      },
      waist: { 
        type: Number,
        min: [0, "Waist measurement must be positive"],
      },
      hips: { 
        type: Number,
        min: [0, "Hips measurement must be positive"],
      },
      height: { 
        type: Number,
        min: [0, "Height must be positive"],
      },
      weight: { 
        type: Number,
        min: [0, "Weight must be positive"],
      },
      unit: { 
        type: String, 
        enum: ["metric", "imperial"], 
        default: "metric" 
      },
    },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

// Add indexes for better query performance
profileSchema.index({ user: 1 });
profileSchema.index({ 'addresses.isDefault': 1 });

// Instance methods
profileSchema.methods.getFullName = function(): string {
  return `${this.firstName} ${this.lastName || ''}`.trim();
};

profileSchema.methods.getDefaultAddress = function(): IAddress | undefined {
  return this.addresses?.find(addr => addr.isDefault);
};

// Static methods
profileSchema.statics.findByUserId = async function(
  userId: string | Types.ObjectId
): Promise<IProfileDocument | null> {
  return this.findOne({ user: userId }).populate('user');
};

profileSchema.statics.findWithUser = async function(
  profileId: string | Types.ObjectId
): Promise<IProfileDocument | null> {
  return this.findById(profileId).populate('user');
};

// Pre-save middleware to ensure only one default address
profileSchema.pre('save', function(next) {
  if (this.addresses && this.addresses.length > 0) {
    const defaultAddresses = this.addresses.filter(addr => addr.isDefault);
    if (defaultAddresses.length > 1) {
      // Keep only the first default address as default
      this.addresses.forEach((addr, index) => {
        if (addr.isDefault && index > 0) {
          addr.isDefault = false;
        }
      });
    }
  }
  next();
});

const Profile = (mongoose.models.Profile || 
  mongoose.model<IUserProfile, IProfileModel>("Profile", profileSchema)) as IProfileModel;

export default Profile;