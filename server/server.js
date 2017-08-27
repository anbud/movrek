const apiUrl = 'https://api.themoviedb.org/3'
const apiKey = '84fcaac366c4f4efa66458ad7aa32d16'

const predictionioKey = ''

const predictionio = require('predictionio-driver')
const pioClient = new predictionio.Events({
    appId: 1,
    accessKey: predictionioKey
})

Meteor.methods({
    callApi: function(method, endpoint, data = {}) {
        check(method, String)
        check(endpoint, String)
        check(data, Object)

        const Future = require('fibers/future')
        const future = new Future()

        HTTP.call(method, `${apiUrl}${endpoint}${endpoint.indexOf('?') !== -1 && '&' || '?'}api_key=${apiKey}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: data
        }, (err, data) => {
            if (data) {
                future.return({
                    success: true,
                    data: data.data
                })
            } else {
                future.return({
                    success: false,
                    data: {}
                })
            }
        })

        return future.wait()
    }
})

Accounts.config({
    forbidClientAccountCreation: false
})

Meteor.users.deny({
    update: () => true,
    remove: () => true,
    insert: () => true
})

Accounts.onCreateUser((options, user) => {
    if (!user.services.facebook && !(RegExp('.+@.+\..+', 'i').test(user.emails[0].address) && require('disposable-email').validate(user.emails[0].address.split('@')[1]))) {
        throw new Meteor.Error('Error!', 'Invalid email address!')
    }

    if (!options.profile) {
        options.profile = {}
    }

    if (user.services.facebook) {
        options.profile.picture = `https://graph.facebook.com/${user.services.facebook.id}/picture?type=large`
    }

    if (options.name) {
        options.profile.name = options.name
    }

    user.profile = options.profile

    pioClient.createUser({
        uid: user._id
    }).then(res => {}).catch(err => {})

    return user
})

Meteor.startup(() => {
    if (!ServiceConfiguration.configurations.findOne({
        service: 'facebook'
    })) {
        ServiceConfiguration.configurations.insert({
            service: 'facebook',
            appId: '310142442784636',
            secret: '572d149cc9b1bb80aeaba9de301c9a34',
            loginStyle: 'redirect'
        })
    }
})
