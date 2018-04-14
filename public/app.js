// Grab the articles as a json
$.getJSON("/articles", function (data) {
  // For each one
  for (var i = 0; i < 20; i++) {

    // Create new article
    var newArticle = $("<div>");
    newArticle.addClass("display-article");
    newArticle.attr("data-id", data[i]._id);
    newArticle.attr("showNote", true);
    newArticle.text(data[i].title);
    // Add byline
    var byline = $("<div class='byline'>");
    byline.text(data[i].byline);
    newArticle.append(byline);
    // Add summary
    var summary = $("<div class='summary'>");
    summary.text(data[i].summary);
    newArticle.append(summary);
    // Add Link to Article
    var link = $("<div class='link'>");
    link.html("<a href=" + data[i].link + ' target=_"blank">Continue Reading</a>');
    newArticle.append(link);

    var articleRow = $("<div class='row'>")
    articleRow.attr("id", data[i]._id);
    var articleColumn = $("<div class='col-sm-8'>")

    articleColumn.append(newArticle);
    articleRow.append(articleColumn);
    $("#articles").append(articleRow);
  }
});

$(".homeButton").on("click", function () {
  $.ajax({
      method: "GET",
      url: "/scrape"
    })
    // With that done, add the note information to the page
    .then(function (data) {
      console.log(data);
    });
})

// Whenever someone clicks a p tag
$(document).on("click", ".display-article", function () {

  var showNote = $(this).attr("showNote");
  console.log(showNote);
  console.log(typeof (showNote));
  if (showNote === "false") {
    console.log("Show note is " + showNote);
    $(".col-sm-4").empty();
    $(this).attr("showNote", true);
    return;
  }

  $(this).attr("showNote", false);
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");
  console.log(thisId);
  // Now make an ajax call for the Article
  $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })
    // With that done, add the note information to the page
    .then(function (data) {
      // The title of the article
      var newNote = $("<div>");
      newNote.append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
      newNote.append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      newNote.append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      newNote.append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      var noteColumn = $("<div class='col-sm-4'>")
      noteColumn.append(newNote);

      $("#" + thisId).append(noteColumn);
      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});


// When you click the savenote button
$(document).on("click", "#savenote", function () {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        // Value taken from title input
        title: $("#titleinput").val(),
        // Value taken from note textarea
        body: $("#bodyinput").val()
      }
    })
    // With that done
    .then(function (data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry

});

$(".mySaved").on("click", function () {
  $.getJSON("/articles", function (data) {
    // For each one
    $("#articles").html("");
    for (var i = 0; i < 20; i++) {
      if (data[i].note != undefined) {
        // Create new article
        var newArticle = $("<div>");
        newArticle.addClass("display-article");
        newArticle.attr("data-id", data[i]._id);
        newArticle.attr("showNote", true);
        newArticle.text(data[i].title);
        // Add byline
        var byline = $("<div class='byline'>");
        byline.text(data[i].byline);
        newArticle.append(byline);
        // Add summary
        var summary = $("<div class='summary'>");
        summary.text(data[i].summary);
        newArticle.append(summary);
        // Add Link to Article
        var link = $("<div class='link'>");
        link.html("<a href=" + data[i].link + ' target=_"blank">Continue Reading</a>');
        newArticle.append(link);

        var articleRow = $("<div class='row'>")
        articleRow.attr("id", data[i]._id);
        var articleColumn = $("<div class='col-sm-8'>")

        articleColumn.append(newArticle);
        articleRow.append(articleColumn);
        $("#articles").append(articleRow);
      }

    }
  });
})