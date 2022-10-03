const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true });

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const buyFood = new Item({
    name: "Buy Food"
});
const cookFood = new Item({
    name: "Cook Food"
})
const eatFood = new Item({
    name: "Eat Food"
})

const defaultItems = [buyFood, cookFood, eatFood];



app.get("/", function (req, res) {
    Item.find({}, function (err, results) {
        if (results.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err)
                } else {
                    console.log("Succesfully added new items ! ! ! ")
                }
            });
            res.redirect("/");
        } else {
            res.render("list", { kindOfDay: "Today", newListItems: results });

        }

    });

})
app.post("/", function (req, res) {
    const itemName = req.body.newItem;
    const item = new Item({
        name: itemName
    });
    item.save();
    res.redirect("/");

});

app.post("/delete",function(req,res){
const checkedItemId=req.body.checkbox;

Item.findByIdAndRemove(checkedItemId,function(err){
    if(err){
        console.log(err)
    }else{
        console.log("Deleted item");
        res.redirect("/");
    }
})
})
app.listen(3000, function () {
    console.log("Server is up and ready on 3000");
})