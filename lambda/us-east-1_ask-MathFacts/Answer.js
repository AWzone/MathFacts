  // Allow this module to be reloaded by hotswap when changed
module.change_code = 1;
var askNewQuestion = require("./Question");
var questionLimit = 5;



  module.exports = function(request,response) {   

 
  var question = request.session('question');
  if (!question) {
    return response.say("Oops! I got confused.");
  }
  console.log(question);
  var type = request.session('type');
  var slotA = question.slotA;
  var slotB = question.slotB;
  var questionsAttempted = parseInt(request.session('questionsAttempted')) || 0;
  var questionsCorrect = parseInt(request.session('questionsCorrect')) || 0;

  function summarizeSession (request, response) {
          var summaryText = ("You got " + questionsCorrect + " correct out of " + questionsAttempted + ".");
          var congrats = "";
          var ratio = questionsCorrect / questionsAttempted;
          if (ratio < (0.8)) {
            congrats = "Nice work! Keep practicing!";
          } 
          if (ratio >= (0.8)) {

            var congratulations = ["Jolly good time!", "Chick-chicka Boom Boom la la!", "You might have a career in this!", "You're a superstar!", "You are top banana!", "Cowabunga!", "You're the bee's knees!", "You're the cat's pajamas!"]
            var index = Math.floor(Math.random() * (congratulations.length));
            congrats = congratulations[index];
          }
          var speechText = (summaryText + " " + congrats)
          var cardTitle = "";
          switch (type) {
            case "addition":
              cardTitle = "Addition Practice";
              break;
            case "subtraction":
              cardTitle = "Subtraction Practice";
              break;
            case "multiplication":
              cardTitle = "Multiplication Practice";
              break;
            case "division":
              cardTitle = "Division Practice";
              break;
            default:
              break;
          }
          response.say(speechText).card({
            type: "Standard",
            title: cardTitle,  //this is not required for type Simple OR Standard
            text:  speechText,
            image: {                //image is optional
              smallImageUrl: "https://s3.amazonaws.com/awzone/Math-Facts-Icons/Math+Facts+Icon_480.png",  //One must be specified
              largeImageUrl: "https://s3.amazonaws.com/awzone/Math-Facts-Icons/Math+Facts+Icon_800.png"
            }
          });
          response.clearSession();

  }

  var attempt = request.slot('Attempt')
  console.log("Attempt: " + attempt);

  if (attempt == question.solution) { // Correct
    console.log("That's right");
    response.say("That's right!");
    response.say(question.solutionText);

    // Record the attempt
    questionsAttempted++
    questionsCorrect++
    response.session('questionsAttempted', questionsAttempted);
    response.session('questionsCorrect', questionsCorrect);

    console.log(questionsCorrect + " questions correct out of " + questionsAttempted);


    //Check and see if we are at the question limit
    if (questionsAttempted < questionLimit) {
      var newQuestion = askNewQuestion(type);
      response.session('question', newQuestion);
      var reprompt = ("Let me give you a chance to think. <break time='5s'/> " + newQuestion.promptText);
      response.say(newQuestion.promptText).reprompt(reprompt).shouldEndSession(false);
    } else {
      summarizeSession(request, response);
      }
    } else { // Incorrect
      
      response.say("That's not quite it.");
      response.say(question.solutionText);
      response.say("Let's try saying that together 3 times.");
      for (var i = 0; i < 3; i++) {
        response.say(question.solutionText);
      }
      // Record the attempt
      questionsAttempted++
      response.session('questionsAttempted', questionsAttempted);
      response.say("Good!")

      if (questionsAttempted > 0) {
        if (questionsAttempted < questionLimit) {
          var newQuestion = askNewQuestion(type);
          response.session('question', newQuestion);
          var reprompt = ("Let me give you a chance to think. <break time='5s'/> " + newQuestion.promptText);
          response.say(newQuestion.promptText).reprompt(reprompt).shouldEndSession(false);
        } else {
          summarizeSession(request, response);
          }          
        }
      }
      return(request, response);
    }
  