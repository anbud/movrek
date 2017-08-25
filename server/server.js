const apiUrl = 'https://api.themoviedb.org/3'
const apiKey = '84fcaac366c4f4efa66458ad7aa32d16'

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

