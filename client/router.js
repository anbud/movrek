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
        Router.go('login')
    }

    this.next()
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
                movies: Meteor.data.get('discover').results
            })
        })
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
