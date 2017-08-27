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

Router.route('/home', {
    name: 'home',
    waitOn: () => Meteor.apiSubscribe('discover', 'get', `/discover/movie?page=${Number(Math.random() * 998) + 1}`),
    action: function() {
        this.render('home', {
            data: () => Meteor.data.get('discover')
        })
    }
})

Router.route('/', {
    name: 'splash',
    action: function() {
        if (!Meteor.userId()) {
            this.render('splash')
        } else {
            Router.go('home')
        }
    },
    layoutTemplate: ''
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
