import passport from "passport"
import { Strategy } from "passport-google-oauth20"
import { JWTAuthenticate } from "./tools.js"
import UsersSchema from "../schemas/UsersSchema.js"
const { CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env
if (!CLIENT_ID || !GOOGLE_CLIENT_SECRET)
  throw new Error("Environment variables unreadable")

passport.use(
  "google",
  new Strategy(
    {
      // PROVIDE CLIENTiD, clientToken, and callbackUrl  WARNING THE NAMES SHOULD BE THE SAME AS THE CODE IN THE BELOW IF YOU CHANGE THE VARIABLE NAME YOU WILL GET THE ERROR
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3001/user/googleRedirect",
    },
    async (accesToken, refreshToken, profile, passportNext) => {
      //this function will be executed when we got the response back from google
      try {
        console.log(profile)
        // when we receive the user from google, we check if the user existent ot not
        const user = await UsersSchema.findOne({ googleId: profile.id })
        //if the user is existent we need to create him couple of token
        if (user) {
          const tokens = await JWTAuthenticate(user)
          passportNext(null, { user, tokens })
        } else {
          // else we are creating a new user
          const newUser = {
            name: profile.name.givenName,
            surname: profile.name.familyName,
            email: profile.emails[0].value,
            role: "User",
            googleId: profile.id,
          }
          const createdUser = await new UsersSchema(newUser)
          const savedUser = await createdUser.save()
          const tokens = await JWTAuthenticate(savedUser)
          passportNext(null, { user: savedUser, tokens })
        }
      } catch (error) {
        passportNext(error)
      }
    })
  
)
passport.serializeUser(function (user, passportNext) {
  // this is for req.user

  passportNext(null, user)
})
export default {}
