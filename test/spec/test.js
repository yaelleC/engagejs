/*global describe, it, spyOn, expect, beforeEach*/
(function ($, engage) {
  'use strict';

  var idSG = 55;

  describe('guestLogin', function () {
    var dfrGuestLogin;
    beforeEach(function(){
      dfrGuestLogin = $.Deferred();
      spyOn($, 'post').and.returnValue(dfrGuestLogin.promise());
    });

    it('should call the right endpoint', function () {
      engage.guestLogin(idSG);
      var url = $.post.calls.argsFor(0)[0];
      expect(url).toContain('/SGaccess');
    });
    
    it('should pass empty username and password', function () {
      engage.guestLogin(idSG);
      var data = $.post.calls.argsFor(0)[1];
      expect(data).toEqual(
      	JSON.stringify({idSG: idSG, username: '', password: ''})
      );
  	});

    it('should return a Session object on success ', function () {
        dfrGuestLogin.resolve({version: 55});      
        var session;
        engage.guestLogin(idSG).done(function(s){ session = s;});
        expect(session.version).toEqual(55);
  	});
    
    it('should return error message on failure', function () {
      var message;
      dfrGuestLogin.reject();
      engage.guestLogin(idSG).fail(function(msg){ message = msg;});
      expect(message).toEqual('Could not login as guest');
    });

    it('should fail when the game is not public', function () {
      var message;
      dfrGuestLogin.resolve({});
      engage.guestLogin(idSG).fail(function(msg){ message = msg;});
      expect(message).toEqual('Sorry this game is not public');
    });
  });

  describe('loginStudent', function () {
    var dfrLoginStudent;
    beforeEach(function(){
      dfrLoginStudent = $.Deferred();
      spyOn($, 'post').and.returnValue(dfrLoginStudent.promise());
    });

    it('should call the right endpoint', function () {
      engage.loginStudent(idSG);
      var url = $.post.calls.argsFor(0)[0];
      expect(url).toContain('/SGaccess');
    });
    
    it('should pass empty username and password', function () {
      engage.loginStudent(idSG, 'user', 'pass');
      var data = $.post.calls.argsFor(0)[1];
      expect(data).toEqual(
        JSON.stringify({idSG: idSG, username: 'user', password: 'pass'})
      );
    });

    it('should return a Session object on success ', function () {
        dfrLoginStudent.resolve({version: 55, loginSuccess: true});      
        var session;
        engage.loginStudent(idSG).done(function(s){ session = s;});
        expect(session.version).toEqual(55);
    });
    
    it('should return a message when the login is incorrect', function () {
        dfrLoginStudent.resolve({version: 55, loginSuccess: false});      
        var msg;
        engage.loginStudent(idSG).fail(function(m){ msg = m;});
        expect(msg).toEqual('Login failed');
    });
    
    it('should return error message on failure', function () {
      var message;
      dfrLoginStudent.reject();
      engage.loginStudent(idSG).fail(function(msg){ message = msg;});
      expect(message).toEqual('Could not login');
    });

    it('should fail when the game is not public', function () {
      var message;
      dfrLoginStudent.resolve({loginSuccess: true});
      engage.loginStudent(idSG).fail(function(msg){ message = msg;});
      expect(message).toEqual('Sorry this game is not public');
    });
  });

  describe('session', function () {
    var dfrGetJSON, session;
    beforeEach(function(){
      // login as guest
      var dfrGuestLogin = $.Deferred();
      spyOn($, 'post').and.returnValue(dfrGuestLogin.promise());
      dfrGuestLogin.resolve({
        version: 33, params: []});
      engage.guestLogin(idSG).done(function(s){session=s;});
      
      dfrGetJSON = $.Deferred();
      spyOn($, 'getJSON').and.returnValue(dfrGetJSON.promise());
    });

    describe('getLeaderboard', function () {

      it('should call the right endpoint', function () {
        session.getLeaderboard();
        expect($.getJSON.calls.argsFor(0)[0])
          .toContain('/learninganalytics/leaderboard/seriousgame/55/version/33');
      });
    });

    describe('getGameDesc', function () {
      it('should call the right endpoint', function () {
       session.getGameDesc(1);
        expect($.getJSON.calls.argsFor(0)[0])
          .toContain('/seriousgame/55/version/33');
     });
    });

    describe('getBadgesWon', function () {
      it('should call the right endpoint', function () {
       session.getBadgesWon(1);
        expect($.getJSON.calls.argsFor(0)[0])
          .toContain('/badges/seriousgame/55/version/33/player/-1');
     });
    });

    describe('startGameplay', function () {
      var dfrStartGameplay;
      beforeEach(function(){
        dfrStartGameplay = $.Deferred();
        spyOn($, 'ajax').and.returnValue(dfrStartGameplay.promise());
      });

      it('should call the right endpoint', function () {
        session.startGameplay();
        expect($.ajax.calls.argsFor(0)[0].url)
          .toContain('/gameplay/start');
      });

      it('should send the correct data new users ', function () {
        session.startGameplay();
        expect($.ajax.calls.argsFor(0)[0].data)
          .toEqual(JSON.stringify({idSG: idSG, version: 33, idStudent: 0, params: []}));
      });

      it('should send the correct data known users ', function () {
        session.idPlayer = 15;
        session.startGameplay();
        expect($.ajax.calls.argsFor(0)[0].data)
          .toEqual(JSON.stringify({idSG: idSG, version: 33, idPlayer: 15}));
      });

      it('should return a gameplay', function () {
        var idGamePlay = 88;
        dfrStartGameplay.resolve(idGamePlay);
        dfrGetJSON.resolve([1,2,3]);
        
        var gameplay;
        session.startGameplay().done(function(gp){ gameplay = gp;});
        expect(gameplay.scores).toEqual([1,2,3]);
        expect(gameplay.idGameplay).toEqual(88);
      });
    });

    describe('Gameplay', function () {
      var gameplay;
      beforeEach(function(){
        var dfrStartGameplay = $.Deferred();
        spyOn($, 'ajax').and.returnValue(dfrStartGameplay.promise());
        var idGamePlay = 88;
        dfrGetJSON.resolve([1,2,3]);
        session.startGameplay().done(function(gp){ gameplay = gp;});
        dfrStartGameplay.resolve(idGamePlay);
      });

      describe('Assess', function () {
        it('should call the right endpoint', function () {
          gameplay.assess('hello', 'world');
          expect($.ajax.calls.argsFor(1)[0].url)
            .toContain('/gameplay/88/assessAndScore');
        });

        it('should send action and value as PUT', function () {
          gameplay.assess('hello', 'world');
          expect($.ajax.calls.argsFor(1)[0].data)
            .toEqual(JSON.stringify({action: 'hello', value: 'world'}));
        });
      });

      describe('endGameplay', function () {
        it('should call the right endpoint on win', function () {
          gameplay.endGameplay(true);
          expect($.ajax.calls.argsFor(1)[0].url)
            .toContain('/gameplay/88/end/win');
        });
        it('should call the right endpoint on lose', function () {
          gameplay.endGameplay(false);
          expect($.ajax.calls.argsFor(1)[0].url)
            .toContain('/gameplay/88/end/lose');
        });

      });
      describe('getFeedback', function () {
        it('should call the right endpoint', function () {
          gameplay.getFeedback();
          expect($.getJSON.calls.argsFor(1)[0])
            .toContain('/gameplay/88/feedback');
        });
      });
      describe('getScores', function () {
        it('should call the right endpoint', function () {
          gameplay.getScores();
          expect($.getJSON.calls.argsFor(1)[0])
            .toContain('/gameplay/88/scores');
        });
      });
    });
  });

  // });
})(window.jQuery, window.engage);
