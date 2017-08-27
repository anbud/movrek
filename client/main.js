import 'materialize-css/dist/css/materialize.css'

const Hammer = require('hammerjs')
const Materialize = require('materialize-css')


Meteor.data = new ReactiveDict()

Meteor.apiSubscribe = (key, method, endpoint, data = {}, rerun = false, callback = () => {}) => {
    if (data && typeof data === 'function') {
        callback = data
        data = {}
    }

    if (rerun && typeof rerun === 'function') {
        callback = rerun
        rerun = false
    }

    if (!Meteor.data.get(key) || rerun) {
        Meteor.call('callTMDBApi', method, endpoint, data || {}, (err, data) => {
            if (data) {
                Meteor.data.set(key, data.data)
            }

            if (callback && typeof callback === 'function') {
                callback(!data, data && data.data)
            }
        })
    } else {
        if (callback && typeof callback === 'function') {
            callback(false, Meteor.data.get(key))
        }
    }

    return () => !!Meteor.data.get(key)
}

