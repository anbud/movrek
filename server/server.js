const apiUrl = 'https://api.themoviedb.org/3'
const apiKey = '84fcaac366c4f4efa66458ad7aa32d16'

const pioUrl = 'http://pio.zx.rs'
const pioKey = 'YVgRJUeiXrniPBON6Rq42_f6OiwOUsuXhmNDKq7dPRGq-M8yZ3ZHM5_FHRWL2A4Y'

const predictionio = require('predictionio-driver')
const pioClient = new predictionio.Events({
    appId: 1,
    accessKey: pioKey,
    url: pioUrl,
    port: 7070
})
const pioEngine = new predictionio.Engine({
    url: pioUrl,
    port: 8000
})

Meteor.methods({
    callTMDBApi: function(method, endpoint, data = {}) {
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
    },
    // utility function to populate the predictionio event server, not to be called multiple times (already called, do not use)
    importTMDB: (token) => {
        check(token, String)

        if (token === 'h1dd3nt0k3n') {
            let k = 0
            const cb = (err, data) => {
                if (data.success) {
                    (data.data.results || []).forEach(j => {
                        pioClient.createItem({
                            iid: j.id,
                            properties: {
                                itypes: 1,
                                title: j.title,
                                poster_path: j.poster_path,
                                overview: j.overview,
                                release_date: j.release_date,
                                genre: j.genre,
                                popularity: j.popularity,
                            },
                            eventTime: new Date().toISOString()
                        }).then(res => {
                            k++
                            console.log(`${k / 200}%`)
                        }).catch(err => {
                            console.log(err)
                        })
                    })
                }
            }

            for (let i = 1; i < 1000; i++) {
                Meteor.call('callTMDBApi', 'get', `/discover/movie?page=${i}`, {}, cb)
            }
        }
    },
    recordAction: (movieId, event, properties = {}) => {
        check(movieId, String)
        check(event, String)
        check(properties, Object)

        let user = Meteor.userId()

        pioClient.createAction({
            event: event,
            uid: user,
            iid: movieId,
            eventTime: new Date().toISOString(),
            properties: properties
        }).then(res => {}).catch(err => {
            console.err(err)
        })
    },
    getRecommendation: () => {
        const Future = require('fibers/future')
        const future = new Future()

        pioEngine.sendQuery({
            user: Meteor.userId(),
            n: 1
        }, Meteor.bindEnvironment((err, res) => {
            if (res.itemScores.length > 0) {
                Meteor.call('callTMDBApi', 'get', `/movie/${res.itemScores[0].item}`, {}, (err, data) => {
                    future.return(_.extend(data.data.data, {
                        recommendation: true
                    }))
                })
            } else {
                future.return({})
            }
        }))

        return future.wait()
    },
    saveSettings: (infinite, movies) => {
        check(infinite, Boolean)
        check(movies, Number)

        Meteor.users.update({
            _id: Meteor.userId()
        }, {
            $set: {
                'profile.disableInfinite': infinite,
                'profile.movies': movies
            }
        })
    },
    user1: () => {
        let user = Meteor.userId()

        pioClient.createUser({
            uid: user
        }).then(res => {console.log(res)}).catch(err => {console.log(err)})
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
