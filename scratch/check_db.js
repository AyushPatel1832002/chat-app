const mongoose = require("mongoose");

const MONGODB_URI = "mongodb://localhost:27017/chat_app";

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB");
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
    
    // Query users
    const users = await mongoose.connection.db.collection("users").find({}).toArray();
    console.log("Users in DB:");
    users.forEach(u => {
      console.log(`- Name: ${u.name}, Email: ${u.email}, ID: ${u._id}`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error("Error:", err);
    process.exit(1);
  });
