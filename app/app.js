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
  //navigation - new post
  $(".post-page").click(postPage);
  function postPage(){
    $(".cards-container").hide();
    $(".btn-container").show();
    $(".btn-container").css("display", "flex");
    $(".input-title").show();
    $(".text-entry").show();
  }
  //navigation - view posts
  $(".view-page").click(viewPage);
  function viewPage(){
    $(".cards-container").show();
    $(".btn-container").hide();
    $(".input-title").hide();
    $(".whiteboard-entry").hide();
    $(".snippet-entry").hide();
    $(".text-entry").hide();
  };

  var database = firebase.database();
  var postTitle = "";
  var postTimestamp;
  var postContent = {};
  // var postTags = [];

  // local storage
  $('.btn-add-local').on('click', function(e){
    console.log(e);
    var keyData = $('.input-title').val();
    var valueData = $('.input-textbox').val();

    var currentTime = moment();
    var currentTimeDisplay = currentTime.format("dddd, MMMM Do YYYY, h:mm:ss a");
    postTitle = $(".input-title").val().trim();
    postTimestamp = currentTimeDisplay;
    postContent["text"] = $(".input-textbox").val().trim();
    postContent["whiteboard"] = canvas.toDataURL();
    // postContent["snippet"] = ;
    // postTags = ;
    var valueData = {
      title: postTitle,
      timeStamp: postTimestamp,
      content: postContent,
      // tags: postTags,
    };
    // write to local
    localStorage.setItem(keyData, JSON.stringify(valueData));
    // read from local
    // needs refactoring
    // var displayText = keyData + ' | ' + localStorage.getItem(keyData);
    // this only displays the last one? might want to switch to html
    // and append a div
    // if you use backticks ` you can use ${templateLiterals}
    // TODO make this vars make sense across the app
    // $('.container-data').html('<div class="display-data-item" data-keyValue="'+ keyData +'">'+valueData+'</div>');
    var iconStyle;
    addCard(postTitle)
    $('.input-title').val('');
    $('.input-textbox').val('');
    // $("#whiteboard").getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  });

  // firebase
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
      postContent["whiteboard"] = canvas.toDataURL();
      postContent["snippet"] = "no snippet";
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
    // $("#whiteboard").getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    };
  });

  database.ref().on("child_added", function (childSnapshot) {
    var uniqueKey = childSnapshot.key;
    postTitle = childSnapshot.val().title;
    postTimestamp = childSnapshot.val().timeStamp;
    postContent["text"] = childSnapshot.val().content["text"];
    postContent["whiteboard"] = childSnapshot.val().content["whiteboard"];
    postContent["snippet"] = childSnapshot.val().content["snippet"];
    var iconStyle;
    addCard(uniqueKey);
  });

  // whiteboard
  var canvas = document.getElementById("whiteboard");
  var context = canvas.getContext("2d");
  var holding = false;
  var prev;
  
  $("#whiteboard").mousedown(function(){
    holding = true
  });
  $("#whiteboard").mouseup(function(){
    holding = false;
    prev = undefined;
  });
  $("#whiteboard").mousemove(function(e){
    if (holding) {
      var coord = { 'x': e.offsetX, 'y': e.offsetY };
      if (prev !== undefined) {
        context.beginPath();
        context.moveTo(prev.x, prev.y);
        context.lineTo(coord.x, coord.y);
        context.strokeStyle = "#000000";
        context.stroke();
      }
      prev = coord;
    }
  })

  // opening posts from card
  $(".cards-container").on("click", ".open-post", function(){
    var uniqueKey = $(this).attr("data-id");
    var thisPost;
    database.ref(uniqueKey).once('value').then(function(snapshot) {
      var exists = (snapshot.val() !== null)
      if (exists){
        database.ref(uniqueKey).once('value').then(function(childSnapshot) {
          thisPost = childSnapshot.val();
          var thisTitle = thisPost.title;
          var thisContent = thisPost.content;
          populatePost(uniqueKey, thisContent, thisTitle);
        });
      } else {
        var thisTitle = uniqueKey;
        var thisContent = JSON.parse(localStorage.getItem(uniqueKey))["content"];
        populatePost(uniqueKey, thisContent, thisTitle);
      };
    });
  });
  
  function populatePost(uniqueKey, thisContent, thisTitle){
    var image = new Image();
    image.id = "whiteboardpic"
    // image.src = thisContent["whiteboard"];
    image.src = JSON.parse(localStorage.getItem(uniqueKey))["content"]["whiteboard"];
    // console.log(thisContent);
    $(".modal-header").prepend(
      "<h5 data-key =" + uniqueKey + ">" + thisTitle + "</h2>"
    );
    $(".modal-body").prepend(
      "<img src =" + image.src + "></div>" +
      "<p>" + thisContent["snippet"] + "</p>" +
      "<p>" + thisContent["text"] + "</p>"
    );
    $(".modal-footer").prepend(
      "<button type='button' class='btn btn-secondary btn-edit' data-dismiss='modal' data-id=" + uniqueKey + ">Edit Post</button>" +
      "<button type='button' class='btn btn-secondary btn-delete' data-dismiss='modal' data-id=" + uniqueKey + ">Delete Post</button>" +
      "<button type='button' class='btn btn-secondary modal-close-btn' data-dismiss='modal'>Close</button>"
    );
    $(".postModal").modal(focus)
  };
  // clear and close modal
  $('.modal').on("click", ".modal-close-btn", function(){
    $(".modal-header").empty();
    $(".modal-body").empty();
    $(".modal-footer").empty()
  });

  function addCard(uniqueKey){
    if (postContent["snippet"] !== undefined) {
      iconStyle = "images/code.png";
    } else if (postContent["whiteboard"] !== undefined && postContent["snippet"] == undefined){
      iconStyle = "images/whiteboard.png";
    } else if (postContent["text"] !== undefined  && postContent["whiteboard"] == undefined && postContent["snippet"] == undefined){
      iconStyle = "images/text.png";
    };
    $(".cards-container").prepend(
      "<div class='card' data-id=" + uniqueKey + ">" +
        "<img src=" + iconStyle + " class='card-img-top' alt='icon'>" + 
        "<div class='card-body'>" +
          "<h5 class= 'card-title'>" + postTitle + "</h5>" + 
          "<p class='card-time'>" + postTimestamp + "</p>" +
          // gotta fix here
          "<div class='card-content'>" + 
            // "<div class = 'snippet' >" + postContent["snippet"] + "</div>" +
          "</div>" +
          // "<button type='button' class='btn btn-primary open-post' data-toggle='modal' data-target='.postModal' data-id='" + uniqueKey + "'>" +
          "<button type='button' class='btn btn-primary open-post' data-target='.postModal' data-id='" + uniqueKey + "'>" +
            "View Post" +
          "</button>" +
        "</div>" +
      "</div>"
      );
  };

  // edit item
  $('.modal').on('click', '.btn-edit', function(e){
    var uniqueKey = $(this).attr("data-id");
    var thisCard = ("[data-id=" + uniqueKey + "]");
    database.ref(uniqueKey).once('value').then(function(snapshot) {
      var exists = (snapshot.val() !== null)
      if (exists){
        $(thisCard).remove();
        $(".modal-header").empty();
        $(".modal-body").empty();
        postPage();
        database.ref(uniqueKey).once('value').then(function(childSnapshot) {
          thisPost = childSnapshot.val();
          var thisTitle = thisPost.title;
          var thisContent = thisPost.content;
          $(".input-title").val(thisTitle).prop("readonly", true);
          $(".input-textbox").html(thisContent["text"]);
          $(".manage-btns").prepend(
            "<button class='btn-update' data-id=" + uniqueKey + ">Update Post</button>"
          );
        });
      } else {
        $(thisCard).remove();
        $(".modal-header").empty();
        $(".modal-body").empty();
        postPage();
        var thisTitle = uniqueKey;
        var thisContent = JSON.parse(localStorage.getItem(uniqueKey))["content"];
        $(".input-title").val(thisTitle).prop("readonly", true);
        $(".input-textbox").val(thisContent["text"]);
        $(".manage-btns").prepend(
          "<button class='btn-update' data-id=" + uniqueKey + ">Update Post</button>"
        );
      }
    });
  });

  // delete item
  $('.modal').on('click', '.btn-delete', function(e){
    var uniqueKey = $(this).attr("data-id");
    var thisCard = ("[data-id=" + uniqueKey + "]");
    database.ref(uniqueKey).once('value').then(function(snapshot) {
      var exists = (snapshot.val() !== null)
      if (exists){
        database.ref(uniqueKey).remove();
      } else {
        localStorage.removeItem(uniqueKey);
      }
    });
    $(thisCard).remove();
    $(".modal-header").empty();
    $(".modal-body").empty();
  });

  // update item
  $('.manage-btns').on('click', '.btn-update', function(e){
    var uniqueKey = $(this).attr("data-id");
    var thisCard = ("[data-id=" + uniqueKey + "]");
    database.ref(uniqueKey).once('value').then(function(snapshot) {
      var exists = (snapshot.val() !== null)
      if (exists){
        console.log(database.ref(uniqueKey));
        database.ref(uniqueKey).val();
        // incompleted here
      } else {
        var vals = JSON.parse(localStorage.getItem(uniqueKey));
        console.log(vals);
        var updateContent = $(".input-textbox").val().trim();
        var valueData = {
          title: uniqueKey,
          timeStamp: vals["timeStamp"],
          content: updateContent,
        };
        localStorage.setItem(uniqueKey, JSON.stringify(valueData));
        var currentTime = moment();
        var currentTimeDisplay = currentTime.format("dddd, MMMM Do YYYY, h:mm:ss a");
        postTitle = uniqueKey;
        postTimestamp = currentTimeDisplay;
        var iconStyle;
        addCard(postTitle)
      }
    });
  });

  // delete all?
  $('.btn-clear').click(function(){
    localStorage.clear();
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

});