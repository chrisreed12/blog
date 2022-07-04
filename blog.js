const parser = require('body-parser');
const express = require('express');
const ejs = require('ejs');
const app = express();
const fs = require('fs');
const {v1: uid1} = require('uuid');
let signedIn = false;
var posts = [];

getData();

app.use(parser.urlencoded({extended:true}));
app.use(express.static('public'));

app.set('view engine', 'ejs');

app.get('/', function(req, res){
    res.render('blog',{signedIn: signedIn, posts: posts});
});

app.get('/about', function(req, res){
    res.render('about', {signedIn: signedIn});
})

app.get('/contact', function(req, res){
    res.render('contact', {signedIn: signedIn});
})

app.get('/signin', function(req, res){
    res.render('signin');
})

app.post('/signin', function(req, res){
   if(req.body.email === 'test@user.com'  && req.body.pass === 'test123'){
    signedIn = true;
    res.redirect('/');
   }else{
    res.redirect('/signin');
   }
})

app.get('/compose', function(req,res){
    if(signedIn){
        res.render('compose', {signedIn: signedIn});
    }else{
        res.redirect('/signin');
    }
})

app.post('/compose', function(req, res){
    const post = {
    uid: uid1(),
    title: req.body.title, 
    date: new Date().toLocaleDateString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"}),
    body: req.body.body
    };
    createView(post);
    posts.push(post);
    writeData();
    res.redirect('/');
})

app.get('/posts/*', function(req, res){
    const postID = req.url.substr(7,req.url.lengt);
    for(var i = 0; i < posts.length; i++ ){
        var selectedPost = [];
        if(posts[i].uid === postID){
            selectedPost = posts[i];
        }
    }
    res.render('posts/'+postID,{post: selectedPost, signedIn: signedIn});
})

app.listen(process.env.PORT || 3000, function(){
    console.log('Server started on port 3000');
})

function getData(){
    try {
        const rawData = fs.readFileSync('posts/posts.json');
        posts = JSON.parse(rawData);
    } catch (err) {
        console.log(err);
    }
}

function writeData(){
    try {
        const dataToWrite = JSON.stringify(posts);
        fs.writeFileSync('posts/posts.json', dataToWrite);
    } catch (err) {
        console.log(err);
    }
}

function createView(post){
    const path = 'views/posts/'+post.uid+'.ejs';
    try{
        fs.copyFileSync('views/post.ejs', path);
    }catch (err) {
        console.log(err);
    }
}