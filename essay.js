const express = require('express');
const app = express();
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://rcchadrac:5025412849@cluster0-pb05w.mongodb.net/cat_app?retryWrites=true&w=majority', {
useNewUrlParser:true,
useCreateIndex:true
}).then(() =>{
console.log("connected to DB")
}).catch(err =>{
console.log("error:", err.message);
});

const PostSchema = new mongoose.Schema({
   title: String,
   description: String,
});

const Post = mongoose.model("Post", PostSchema);

app.get('/', async (req, res) => {
	let post = await Post.create({title: 'Test', description: 'This is a test also'});
	res.send(post);
});
 
app.listen(process.env.PORT||3000 , process.env.IP, () =>{
console.log("Server has started!!")
});