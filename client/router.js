Router.configure({
    layoutTemplate: 'mainLayout',
    loadingTemplate: 'loading'
})

Router.onRun(function() {
    $('#progress-bar').removeClass('determinate').addClass('indeterminate')

    this.next()
})

Router.onBeforeAction(function() {
    if (!Meteor.userId()) {
        Router.go('splash')
    }

    this.next()
}, {
    except: ['login', 'register', 'splash']
})

Router.onAfterAction(function() {
    $('#progress-bar').removeClass('indeterminate').addClass('determinate')
})

Router.route('/', {
    name: 'home',
    waitOn: () => Meteor.apiSubscribe('discover', 'get', `/discover/movie?page=${Number(Math.random() * 998) + 1}`),
    action: function() {
        this.render('home', {
            data: () => ({
                movies: Meteor.data.get('discover').results.filter(i => !!i.backdrop_path).slice(0, 6)
            })
        })
    }
})

Router.route('/splash', {
    name: 'splash',
    action: function() {
        this.render('splash')
    }
})

Router.route('/login', {
    name: 'login',
    action: function() {
        if (!Meteor.userId()) {
            this.render('login')
        } else {
            Router.go('home')
        }
    }
})

Router.route('/register', {
    name: 'register',
    action: function() {
        if (!Meteor.userId()) {
            this.render('register')
        } else {
            Router.go('home')
        }
    }
})
