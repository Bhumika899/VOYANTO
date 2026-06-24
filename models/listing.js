const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require('./review.js');
const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    // image:{
    //     default:"https://unsplash.com/s/photos/tropical-beach",
    //     type:String,
    //     set:(v)=>v===""?"https://unsplash.com/s/photos/tropical-beach ":v,
    // },
    image: {
        url: String,
        filename: String,
    },
    price: Number,
    location: String,
    country: String,
    geometry: {
        lat: Number,
        lng: Number,
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review"
    },
    ],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    category: [{
        type: String,
        enum: [
            "mountains",
            "farms",
            "arctic",
            "castles",
            "amazing pools",
            "camping",
            "iconic cities",
            "rooms",
            "boats",
            "domes",
            "trending"
        ]
    }
    ]

});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });

    }


})
const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;