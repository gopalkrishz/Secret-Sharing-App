 const express=require("express")
 const bodyparser = require("body-parser")
 const ejs = require("ejs")
 const mongoose = require("mongoose")
 const session =require("express-session")
 const passport = require("passport")
 const passportLocalMongoose = require("passport-local-mongoose")
 const app = express()
 app.use(express.static("public"))
 app.set("view engine","ejs")
 app.use(bodyparser.urlencoded({extended:true}));
 app.use(session({
   secret:"the Vintage Devil",
   resave:false,
   saveUninitialized:false
 }));
 app.use(passport.session());
 app.use(passport.initialize());
 mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true})
 const userSchema = new mongoose.Schema({
   email:String,
   password:String,
   secret:String
 });
 userSchema.plugin(passportLocalMongoose);
 const User = mongoose.model("User",userSchema);
 passport.use(User.createStrategy());
 passport.serializeUser(User.serializeUser());
 passport.deserializeUser(User.deserializeUser());
app.get("/",(req,res)=>{
   res.render("home")
})
app.get("/login",(req,res)=>{
   res.render("login")
})
app.get("/register",(req,res)=>{
   res.render("register")
})
app.get("/secrets", function(req, res){
   User.find({"secret": {$ne: null}}, function(err, foundUsers){
     if (err){
       console.log(err);
     } else {
       if (foundUsers) {
         res.render("secrets", {usersWithSecrets: foundUsers});
       }
     }
   });
 });
app.get("/logout",(req,res)=>{
   res.redirect('/')
});
app.get("/submit", function(req, res){
   if (req.isAuthenticated()){
     res.render("submit");
   } else {
     res.redirect("/login");
   }
 });
 
 app.post("/submit", function(req, res){
   const submittedSecret = req.body.secret;
 
   User.findById(req.user.id, function(err, foundUser){
     if (err) {
       console.log(err);
     } else {
       if (foundUser) {
         foundUser.secret = submittedSecret;
         foundUser.save(function(){
           res.redirect("/secrets");
         });
       }
     }
   });
 });
app.post("/register",(req,res)=>{
   User.register({username:req.body.username},req.body.password,function(err,user){
      if(err){
         console.log(err);
         res.sendStatus(500);
         return;
      }else{
         passport.authenticate("local")(req,res,function(){
            res.redirect("/secrets")
         })
      }
   })
 });

 app.post("/login",(req,res)=>{
   const user = new User({
      username:req.body.username,
      password:req.body.password
   });
   req.login(user,function(err){
      if(err){
         console.log(err);
      }else{
         passport.authenticate("local")(req,res,function(){
         res.redirect("/secrets")
         })

      }
   })

 })












 app.listen(3000,()=>{
    console.log("server starts at the port 3000")
 })
