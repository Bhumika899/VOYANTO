if (process.env.NODE_ENV != "production") {
    require('dotenv').config()
}
console.log(process.env.SECRET);
const express = require("express");
const app = express();
const mongoose = require("mongoose");
// const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const { listingSchema, reviewSchema } = require("./schema.js");
// const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user.js")


const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
main().then(() => {
    console.log("connected");
}).catch((err) => {
    console.log(err);
});
async function main() {
    await mongoose.connect(MONGO_URL);
}
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
// app.use((req, res, next) => {
//     console.log("METHOD:", req.method);
//     console.log("URL:", req.url);
//     next();
// });
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
    res.send("Hi i am root");

});
const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;    // console.log("success");
    next();

});
// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "sigma-student"
//     });
//     let registeredUser = await User.register(fakeUser, "helloWorld"); //save user with this password ,check username is unique
//     res.send(registeredUser);

// })


app.use("/listings", listingsRouter);

app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);
app.use((req, res, next) => {
    next(new ExpressError(404, "Page not found!"));
});

app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).render("error.ejs", { err });
});
// app.get("/testListing",async (req,res)=>{
//     let sampleListing=new Listing({
//         title:"My New Villa",
//         description:"By the beach",
//         price:1200,
//         location:"Calangaute,Goa",
//         country:"India",
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// })
//Read route
// app.get("/listings", async (req, res) => {
//     const allListings = await Listing.find({});
//     res.render("listings/index.ejs", { allListings });

// });
//new route
// app.get("/listings/new", (req, res) => {
//     res.render("listings/new.ejs");
// });

//Show Route
// Show Route
// app.get("/listings/:id", async (req, res) => {
//     let { id } = req.params;

// ADD .populate("reviews") right here 👇
//     const listing = await Listing.findById(id).populate("reviews");

//     res.render("listings/show.ejs", { listing });
// });
//create route
// app.post("/listings", validateListing, wrapAsync(async (req, res) => {
// if(!req.body.listing){
//     throw new ExpressError(400,"send valid data");
// }
// let{title,description,image,price,country,location}=req.body;

// const newListing = new Listing(req.body.listing);
// if(!newListing.title){
//     throw new ExpressError(400,"Title is missing!");
// }
// if(!newListing.description){
//     throw new ExpressError(400,"Description is missing!");
// }
// if(!newListing.location){
//     throw new ExpressError(400,"Location is missing!");
// }


//     await newListing.save();
//     res.redirect("/listings");


// }));
// //edit route
// app.get("/listings/:id/edit", async (req, res) => {
//     let { id } = req.params;
//     const listing = await Listing.findById(id);
//     res.render("listings/edit.ejs", { listing });

// });
//update route
// app.put("/listings/:id", async (req, res) => {
//     let { id } = req.params;
//     await Listing.findByIdAndUpdate(id, { ...req.body.listing });
//     res.redirect(`/listings/${id}`);

// });
//delete route
// app.delete("/listings/:id", async (req, res) => {
//     let { id } = req.params;
//     let deletedListing = await Listing.findByIdAndDelete(id);
//     console.log(deletedListing);
//     res.redirect("/listings/");

// });

// // 1. ALL VALID ROUTES FIRST (Move the Review route up here)
// app.post("/listings/:id/review", validateReview, wrapAsync(async (req, res) => {
//     console.log("BODY:", req.body);
//     let listing = await Listing.findById(req.params.id);
//     if (!listing) {
//         throw new ExpressError(404, "Listing not found");
//     }
//     let newReview = new Review(req.body.reviews); // *See note below
//     listing.reviews.push(newReview);
//     await newReview.save();
//     await listing.save();
//     res.redirect(`/listings/${listing._id}`);
// }));
// app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res) => {
//     let { id, reviewId } = req.params;
//     await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
//     await Review.findByIdAndDelete(reviewId);
//     res.redirect(`/listings/${id}`);
// })
// );

// 2. CATCH-ALL 404 ROUTE GOES NEXT
// app.use((req, res, next) => {
//     next(new ExpressError(404, "Page not found!"));
// });

// 3. ERROR HANDLER GOES ABSOLUTELY LAST
// app.use((err, req, res, next) => {
//     let { statusCode = 500, message = "Something went wrong!" } = err;
//     res.status(statusCode).render("error.ejs", { err });
// });
//review-post route
// app.post("/listings/:id/review", wrapAsync(req, res) => {
//     let listing = await Listing.findById(req.params.id);
//     let newReview = new Review(req.body.review);
//     listing.reviews.push(newReview);
//     await newReview.save();
//     await listing.save();
//     // console.log("New Review Saved");
//     // res.send("New Review Saved");
//     res.redirect(`/listings/${listing._id}`);

// });


app.listen(8080, () => {
    console.log("server is listening to port 8080");
});