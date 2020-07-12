const RememberMeStrategy = require('passport-remember-me').Strategy; 

const rememberMeStrategy= new RememberMeStrategy(
    function(token, done) {
        Token.consume(token, function (err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            return done(null, user);
        });
    },
    function(user, done) {
        var token = utils.generateToken(64);
        Token.save(token, { userId: user.id }, function(err) {
            if (err) { return done(err); }
            return done(null, token);
        });
    }
)

module.exports = rememberMeStrategy;
