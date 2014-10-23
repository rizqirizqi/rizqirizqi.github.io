/* form.js */

$(window).load(function() {
    $("#loader").delay(3000).animate({
        top: -2000
    }, 1000);
});

$(document).ready(function(){
    $.preloadImages = function() {
      for (var i = 0; i < arguments.length; i++) {
        $("<img />").attr("src", arguments[i]);
      }
    }
    $.preloadImages("images/0.gif", "images/1.gif", "images/2.gif", "images/3.gif"
                    , "images/4.gif", "images/5.gif", "images/6.gif", "images/7.gif");
    gameStart();
    if(localStorage.getItem("score-logs") != null) {
        var scoreLogs = JSON.parse(localStorage.getItem("score-logs"));
        for(i = 1; i <= scoreLogs.length; i++) {
            $("#log tbody").append("<tr><td>" + i + "</td><td>" + scoreLogs[i-1] + "</td></tr>");
        }
    } else {
        var scoreLogs = [];
        localStorage.setItem("score-logs", JSON.stringify(scoreLogs));
    }
    
    $(window).keyup(function(event){
        if(checkButtonDisabled(event)) {
            if (event.keyCode >= "65" && event.keyCode <= "90") {
                var selector = "#" + String.fromCharCode(event.keyCode).toLowerCase();
                $(selector).trigger("click");
            }
        }
    });
    $("#keyboard > button").click(function(){
        disableButton(this);
        var character = $(this).val();
        checkChar(character);
    });
    $("#play-again").click(function(){
        hideMessage();
        $("#play-again").text("NEXT WORD");
        gameStart();
    });
    $("#reset-game").click(function(){
        hideMessage();
        $("#log tbody").html("");
        $("#lose").text(0);
        $("#win").text(0);
        var scoreLogs = [];
        localStorage.setItem("score-logs", JSON.stringify(scoreLogs));
        localStorage.setItem("lose", $("#lose").text());
        localStorage.setItem("win", $("#win").text());
        gameStart();
    });
});

function gameStart() {
    getRandomWord();
    sessionStorage.setItem("hangman", "0");
    $("#hangman").html('<img alt="Hangman 0" src="images/0.gif">');
    sessionStorage.setItem("score-now", 0);
    $("#score-now span").text(sessionStorage.getItem("score-now"));
    if(localStorage.getItem("win") != null) {
        $("#win").text(localStorage.getItem("win"));
    }
    if(localStorage.getItem("lose") != null) {
        $("#lose").text(localStorage.getItem("lose"));
    }
    enableAllButton();
}

function getRandomWord() {
    // AJAX
    $.get('listkata.txt', function(data) {
        var lineByLine = data.split("\n");
        var randomNumber = Math.floor((Math.random() * lineByLine.length) + 1);
        sessionStorage.setItem("selectedKeyword", lineByLine[randomNumber]);
        var html = "";
        for(i = 1; i < lineByLine[randomNumber].length; i++) {
            html = html + '<div class="keyChar"><span>_</span></div>';
        }
        $("#keyword").html(html);
    }, 'text');
}

function disableButton(selector) {
    $(selector).css("background", "#B1B1B1");
    $(selector).css("border", "2px solid #B1B1B1");
    $(selector).prop("disabled", true);
}

function disableAllButton() {
    for(i = 97; i <= 122; i++) {
        var selector = "#" + String.fromCharCode(i);
        $(selector).css("background", "#B1B1B1");
        $(selector).css("border", "2px solid #B1B1B1");
        $(selector).prop("disabled", true);
    }
}

function enableAllButton(selector) {
    for(i = 97; i <= 122; i++) {
        var selector = "#" + String.fromCharCode(i);
        $(selector).css("background", "#2AB284");
        $(selector).css("border", "2px solid #2AB284");
        $(selector).prop("disabled", false);
    }
}

function checkButtonDisabled(event) {
    var selector = "#" + String.fromCharCode(event.keyCode).toLowerCase();
    if ($(selector).prop("disabled")) {
        return false;
    } else {
        return true;
    }
}

function showWinMessage() {
    $("#alert").html("<h2>YOU WIN!</h2>");
    $("#alert").css("opacity", "1");
    $("#alert").css("top", "180px");
}

function showLoseMessage() {
    $("#alert").html("<h2>YOU LOSE!</h2>");
    $("#alert").css("opacity", "1");
    $("#alert").css("top", "180px");
}

function hideMessage() {
    $("#alert").html("");
    $("#alert").css("top", "150px");
    $("#alert").css("opacity", "0");
}

function nextHangman() {
    var hangman = parseInt(sessionStorage.getItem("hangman"));
    $("#hangman").html('<img alt="Hangman ' + hangman+1 + '" src="images/' + (hangman+1) + '.gif">');
    sessionStorage.setItem("hangman", (hangman+1));
}

function updateScore(score) {
    sessionStorage.setItem("score-now", parseInt(sessionStorage.getItem("score-now")) + score);
    $("#score-now span").text(sessionStorage.getItem("score-now"));
}

function updateGameLog() {
    var scoreLogs = JSON.parse(localStorage.getItem("score-logs"));
    scoreLogs[scoreLogs.length] = sessionStorage.getItem("score-now");
    localStorage.setItem("score-logs", JSON.stringify(scoreLogs));
    var out;
    for(i = 1; i <= scoreLogs.length; i++) {
        out = out + "<tr><td>" + i + "</td><td>" + scoreLogs[i-1] + "</td></tr>";
    }
    $("#log tbody").html(out);
}

function showAnswer() {
    var selectedKeyword = sessionStorage.getItem("selectedKeyword");
    for(i = 0; i < selectedKeyword.length; i++) {
        $("#keyword div:nth-of-type(" + (i+1) + ")").html("<span>" + selectedKeyword.charAt(i) + "</span>");
    }
}

function checkChar(character) {
    var selectedKeyword = sessionStorage.getItem("selectedKeyword");
    var isValidKey = false;
    for(i = 0; i < selectedKeyword.length; i++) {
        if(selectedKeyword.charAt(i) == character) {
            $("#keyword div:nth-of-type(" + (i+1) + ")").html("<span>" + character + "</span>");
            isValidKey = true;
        }
    }
    if(isValidKey == false) {
        var hangman = parseInt(sessionStorage.getItem("hangman"));
        updateScore(-10);
        nextHangman();
        if(hangman >= 6) {
            showAnswer();
            updateGameLog();
            disableAllButton();
            $("#play-again").text("PLAY AGAIN!");
            $("#lose").text(parseInt($("#lose").text()) + 1);
            localStorage.setItem("lose", $("#lose").text());
            $('#scrollable-table').scrollTop($('#scrollable-table').prop('scrollHeight'));
            showLoseMessage();
        }
    }
    else {
        updateScore(20);
        var win = false;
        for(i = 0;i < selectedKeyword.length; ++i) {
            if($("#keyword div:nth-of-type(" + (i+1) + ") span").text() == "_") {
                break;
            } else if(i == selectedKeyword.length-1){
                win = true;
            }
        }
        if(win) {
            updateGameLog();
            disableAllButton();
            $("#play-again").text("NEXT WORD");
            $("#win").text(parseInt($("#win").text()) + 1);
            localStorage.setItem("win", $("#win").text());
            $('#scrollable-table').scrollTop($('#scrollable-table').prop('scrollHeight'));
            showWinMessage();
        }
    }
}