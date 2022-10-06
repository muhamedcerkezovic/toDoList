const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const _=require("lodash");

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true });

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const addItems = new Item({
    name: "You can add new items"
});
const removeItems = new Item({
    name: "You can remove items"
})
const customLists = new Item({
    name: "You can make custom lists"
})

const defaultItems = [addItems, removeItems, customLists];

const listSchema={
    name:String,
    items:[itemsSchema]
};
const List= mongoose.model("List",listSchema);


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
            res.render("list", { listTitle: "Today", newListItems: results });

        }

    });

});

app.get("/:customListName",function(req,res){
const customListName=_.capitalize(req.params.customListName);
List.findOne({name:customListName},function(err,foundList){
    if(!err){
        if(!foundList){
            const list=new List({
                name: customListName,
                items:defaultItems
            });
            list.save();
            res.redirect("/"+customListName)
        }else{
            res.render("list",{ listTitle: foundList.name, newListItems: foundList.items })
        }
    }
})

});

app.post("/", function (req, res) {
    const itemName = req.body.newItem;
    const listName= req.body.list;
    const item = new Item({
        name: itemName
    });

    if(listName==="Today"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name:listName},function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName)
        })
    }
    

});

app.post("/delete",function(req,res){
const checkedItemId=req.body.checkbox;
const listName=req.body.listName;

if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
    if(err){
        console.log(err)
    }else{
        console.log("Deleted item");
        res.redirect("/");
    }
});
}else{List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
        if(!err){
            res.redirect("/"+listName)
        }
    })
}


})
app.listen(3000, function () {
    console.log("Server is up and ready on 3000");
})