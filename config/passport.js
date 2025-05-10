
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Configure the Google strategy for Passport.js
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.NODE_ENV === 'production'
        ? `${process.env.SERVER_URL}/api/auth/google/callback`
        : 'http://localhost:5000/api/auth/google/callback',
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists in our database
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // If user exists, return the user
          return done(null, user);
        } else {
          // If not, create a new user
          const newUser = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            profilePicture: profile.photos[0].value,
            // Additional fields can be set here
            // For example, you might want to set a flag indicating this user registered via Google
            googleId: profile.id
          });

          return done(null, newUser);
        }
      } catch (error) {
        console.error("Error in Google auth strategy:", error);
        return done(error, null);
      }
    }
  )
);

// Serialization and deserialization for sessions
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});