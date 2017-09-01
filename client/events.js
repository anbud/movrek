Template.home.events({
    'click .star': (event, templateInstance) => {
        event.preventDefault()

        let data = Meteor.data.get('discover')

        for (let i = 0; i < data.results.length; i++) {
            if (data.results[i].id === Number($(event.currentTarget).data('id'))) {
                data.results[i].original_average_vote = data.results[i].vote_average
                data.results[i].vote_average = Number($(event.currentTarget).data('val')) * 2

                break
            }
        }

        Meteor.data.set('discover', data)

        $(event.currentTarget).parent('.card-action').removeClass('cyan-text text-darken-3').addClass('pink-text text-accent-2')

        Meteor.call('recordAction', $(event.currentTarget).data('id') + '', 'rate', {
            rating: Number($(event.currentTarget).data('val'))
        }, (err, data) => {})
    }
})

Template.home.onRendered(() => {
    if (!((Meteor.user() || {}).profile || {}).disableInfinite) {
        $(window).scroll(() => {
            if ($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
                $('#progress-bar').removeClass('determinate').addClass('indeterminate')

                Meteor.apiSubscribe('discover-inf', 'get', `/discover/movie?page=${Number(Math.random() * 998) + 1}`, {}, true, (err, data) => {
                    if (!err && data) {
                        let d = Meteor.data.get('discover')

                        d.results = _.union(d.results, (data.results || []).slice(0, ((Meteor.user() || {}).profile || {}).movies || 20))

                        Meteor.data.set('discover', d)
                    }
                    $('#progress-bar').removeClass('indeterminate').addClass('determinate')
                })
            }
        })
    }
})

Template.navbar.events({
    'click #js-logout': (event, templateInstance) => {
        event.preventDefault()

        Meteor.logout()

        Router.go('splash')
    },
    'click #js-refresh': (event, templateInstance) => {
        event.preventDefault()

        $('#progress-bar').removeClass('determinate').addClass('indeterminate')

        Meteor.apiSubscribe('discover', 'get', `/discover/movie?page=${Number(Math.random() * 998) + 1}`, {}, true, (err, data) => {
            $('#progress-bar').removeClass('indeterminate').addClass('determinate')
        })
    },
    'click #js-back': (event, templateInstance) => {
        history.back(-1)
    },
    'click #js-exit': (event, templateInstance) => {
        navigator.app.exitApp()
    }
})

Template.login.events({
    'click #js-submit': (event, templateInstance) => {
        Meteor.loginWithPassword($('#js-email').val(), $('#js-password').val(), (err, data) => {
            if (!err) {
                Router.go('home')
            } else {
                Materialize.toast('Wrong password!')
            }
        })
    }
})

Template.register.events({
    'click #js-submit': (event, templateInstance) => {
        Accounts.createUser({
            email: $('#js-email').val(),
            password: $('#js-password').val(),
            profile: {
                name: $('#js-name').val()
            }
        }, (err, data) => {
            if (!err) {
                Router.go('home')
            } else {
                Materialize.toast(err.reason)
            }
        })
    }
})

Template.splash.events({
    'click #js-facebook': (event, templateInstance) => {
        Meteor.loginWithFacebook({})
    },
    'click #js-password': (event, templateInstance) => {
        Router.go('login')
    }
})

Template.settings.events({
    'click #js-infinite, click #js-movies': (event, templateInstance) => {
        Meteor.call('saveSettings', !$('#js-infinite').is(':checked'), Number($('#js-movies').val()), (err, data) => {
            if (!err) {
                Materialize.toast('Saved successfully!')
            }
        })
    }
})
