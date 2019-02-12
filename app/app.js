/*
Init app
interact with DOM
interact with localstorage

 */

$(document).ready(function(){
  // this is where we jquery
  //var keyData = 'ourKey'; // going to need to make this dynamic?
  
  //init firebase database
  var config = {
    apiKey: "AIzaSyCkWeI34gCKLke_L3EvbhEc6z-RqNqb_fw",
    authDomain: "my-cruddy-app.firebaseapp.com",
    databaseURL: "https://my-cruddy-app.firebaseio.com",
    projectId: "my-cruddy-app",
    storageBucket: "my-cruddy-app.appspot.com",
    messagingSenderId: "291881914568"
  };
  firebase.initializeApp(config);

  var database = firebase.database();
  var postTitle = "";
  var postTimestamp;
  var postContent = {};
  var postTags = [];

  $('.btn-add-local').on('click', function(e){
    console.log(e);
    var keyData = $('.input-title').val();
    var valueData = $('.input-textbox').val();

    // write to db
    localStorage.setItem(keyData, valueData);
    // read from db
    var displayText = keyData + ' | ' + localStorage.getItem(keyData);
    // this only displays the last one? might want to switch to html
    // and append a div
    // <div class="display-data-item" data-keyValue="keyData">valueData</div>
    // if you use backticks ` you can use ${templateLiterals}
    // TODO make this vars make sense across the app
    $('.container-data').html('<div class="display-data-item" data-keyValue="'+ keyData +'">'+valueData+'</div>');
    $('.input-title').val('');
    $('.input-textbox').val('');
  });

  $('.btn-add-db').on('click', function(e){
    // if ($(".input-title").val().trim() == "" || $(".input-textbox" || ".input-snippet" || ".input-whiteboard").val().trim() == ""){
    if ($(".input-title").val().trim() == "" || $(".input-textbox").val().trim() == ""){
      alert("Please fill in empty fields before adding")
    // } else if ($(".input-title").val().trim() !== "" && $(".input-textbox" || ".input-snippet" || ".input-whiteboard").val().trim() !== ""){
    } else if ($(".input-title").val().trim() !== "" && $(".input-textbox").val().trim() !== "") {
      //moment js
      var currentTime = moment();
      var currentTimeDisplay = currentTime.format("dddd, MMMM Do YYYY, h:mm:ss a");
      postTitle = $(".input-title").val().trim();
      postTimestamp = currentTimeDisplay;
      postContent["text"] = $(".input-textbox").val().trim();
      // postContent["whiteboard"] =;
      // postContent["snippet"] = ;
      // postTags = ;
      var newPost = {
        title: postTitle,
        timeStamp: postTimestamp,
        content: postContent,
        // tags: postTags,
    };
    database.ref().push(newPost);
    $(".input-title").val("");
    $(".input-textbox").val("");
    };
  });

  database.ref().on("child_added", function (childSnapshot, prevChildKey) {
    postTitle = childSnapshot.val().title;
    // try to calculate time since post to use here
    postTimestamp = childSnapshot.val().timeStamp;
    postContent["text"] = childSnapshot.val().content["text"];
    postContent["whiteboard"] = childSnapshot.val().content["whiteboard"];
    postContent["snippet"] = childSnapshot.val().content["snippet"];
    var iconStyle;
    if (postContent["snippet"] !== undefined) {
      // if code exists, use code icon
      iconStyle = "../images/code.png";
    } else if (postContent["whiteboard"] !== undefined && postContent["snippet"] == undefined){
      // if whiteboard exists when code does not, use whiteboard icon
      iconStyle = "../images/whiteboard.png";
    } else if (postContent["text"] !== undefined  && postContent["whiteboard"] == undefined && postContent["snippet"] == undefined){
      // if text exists but whiteboard and code do not, use text icon
      iconStyle = "../images/text.png";
    };
    $(".cards-container").append(

      );
});

  // update db
    // need to expand when  more than 1 item is added

  // delete item
  $('.container-data').on('click', '.display-data-item', function(e){
    console.log(e.currentTarget.dataset.keyvalue);
    var keyData = e.currentTarget.dataset.keyvalue;
    localStorage.removeItem(keyData);
    $('.container-data').text('');
  });
  // delete all?
  $('.btn-clear').click(function(){
    localStorage.clear();
    $('.container-data').text('');
  });

  $('.btn-whiteboard').click(function(){
    // console.log(e.currentTarget.dataset.keyvalue);
    $(".whiteboard-entry").toggle();
    console.log("whiteboard!");
    var sometemp = database.ref().child("temp");
    sometemp.on("value", snap => console.log(snap.val()));
  });

  $('.btn-snippet').click(function(){
    // console.log(e.currentTarget.dataset.keyvalue);
    $(".snippet-entry").toggle();
    console.log("snippet!")
  });

  $('.btn-text').click(function(){
    // console.log(e.currentTarget.dataset.keyvalue);
    $(".text-entry").toggle();
    console.log("text!")
  });







});