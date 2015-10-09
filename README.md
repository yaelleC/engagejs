EnGAge JS
========================================

## Getting Started

Here is an example of how to use the library

```javascript

// Set the unique ID for your serious game  
var idSG = 1234;

// Start a session
var session;
engage.guestLogin(idSG)
    // what do do on success
    .done(function(s){ session=s;})
    // what to do on failure
    .fail(function(msg){
        console.log(msg);
    });

// atlernatively, login as student
engage.loginStudent(idSG, username, password)
    .done(function(s){ session=s;})
    .fail(function(msg){ /*todo*/});


session.getLeaderboard()
    .done(function(leaderboard){
        console.log(leaderboard);
    });
    
// to get a specific number of results
session.getLeaderboard(5)
    .done(function(leaderboard){
        console.log(leaderboard);
    });

// to get only badges won
session.getBadgesWon().done(
    function(badges){
        console.log(badges);
    });

// to get list of all badges (with boolean earned)
session.getBadges().done(
    function(badges){
        menu.createPanelBadges(badges);
        console.log(badges);
    });

session.getGameDesc().done(
    function(gameDesc){
        console.log(gameDesc);
    });

var gameplay;
session.startGamePlay()
    .done(function(gp){ gameplay = gp;})
    .fail(function(msg){ console.log(msg);})

gameplay.assess(action, value)
    .done(function(response){
        console.log(response);
    });

var win = true;
gameplay.endGameplay(win);

gameplay.getScores()
    .done(function(scores){console.log(scores);});

gameplay.getFeedback()
    .done(function(feedback){console.log(feedback);});

```

