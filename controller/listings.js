const Listing = require("../models/listing.js");
const { getDistance } = require("geolib");
const axios = require("axios");
module.exports.index = async (req, res) => {
    const { category } = req.query;

    console.log("Category =", category);

    let allListings;

    if (category) {
        allListings = await Listing.find({ category });
        console.log("Found listings =", allListings.length);
    } else {
        allListings = await Listing.find({});
    }

    res.render("listings/index.ejs", { allListings });
};
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
}
module.exports.showListing = async (req, res) => {
    let { id } = req.params;

    // ADD .populate("reviews") right here 👇
    const listing = await Listing.findById(id).populate({
        path: "reviews", populate: {
            path: "author",
        },
    }).populate("owner");
    if (!listing) {
        req.flash("error", "listing you requested doesnt exist");
        res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
}
module.exports.createListing = async (req, res) => {

    const location = req.body.listing.location;

    let lat = null;
    let lng = null;

    try {
        const response = await axios.get(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`,
            {
                headers: {
                    "User-Agent": "Wanderlust"
                }
            }
        );

        if (response.data.length > 0) {
            lat = response.data[0].lat;
            lng = response.data[0].lon;
        }
    } catch (err) {
        console.log("Geocoding Error:", err);
    }

    const newListing = new Listing(req.body.listing);

    newListing.owner = req.user._id;

    newListing.geometry = {
        lat,
        lng,
    };

    if (req.file) {
        newListing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    await newListing.save();

    req.flash("success", "New Listing Created");
    res.redirect(`/listings/${newListing._id}`);
};
module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "listing you requested doesn't exist");
        res.redirect("/listings");
    }
    let originalImageUrl = "";
    if (listing.image && listing.image.url) {
        originalImageUrl = listing.image.url.replace(
            "/upload",
            "/upload/h_300,w_250"
        );
    }
    res.render("listings/edit.ejs", { listing, originalImageUrl });

}
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
    req.flash("success", "Listing updated");
    res.redirect(`/listings/${id}`);
}
module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;

    let deletedListing = await Listing.findByIdAndDelete(id);

    console.log(deletedListing);

    req.flash("success", "listing deleted");
    res.redirect("/listings/");
};

module.exports.nearbyListings = async (req, res) => {
    const { lat, lng } = req.query;

    console.log("Nearby route hit");
    console.log(req.query);

    const allListings = await Listing.find({});

    const nearbyListings = allListings.filter((listing) => {

        if (!listing.geometry || !listing.geometry.lat || !listing.geometry.lng) {
            return false;
        }

        const distance = getDistance(
            {
                latitude: Number(lat),
                longitude: Number(lng),
            },
            {
                latitude: Number(listing.geometry.lat),
                longitude: Number(listing.geometry.lng),
            }
        );

        return distance <= 10000; // 10 km
    });

    res.render("listings/index.ejs", {
        allListings: nearbyListings,
    });
};