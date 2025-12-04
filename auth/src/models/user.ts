import mongoose from "mongoose";

// An interfadce that describes the properties
// that are required to create a new User
interface UserAttrs{
    email: string,
    password: string
}

// An interface that describes the properties
// that a User Document has
interface UserDoc extends mongoose.Document{
  email: string;
  password: string;
  // here we could add additional properties from the DB
}

// An interface that describes the properties
// that a User Model has.
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;

}

const userSchema = new mongoose.Schema({
    email: {
      type: String,  // Mongoose required
      required: true
    },
    password: {
      type: String,
      required:true
    }
});
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
}

const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

export { User };
