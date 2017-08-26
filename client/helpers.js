Template.home.helpers({
    stars: function(type) {
        let arr = []

        let lowerBound = type === 'full' ? 1 : (type === 'half' ? (Math.floor(this.vote_average / 2) + 1) : (Math.ceil(this.vote_average / 2) + 1))
        let upperBound = type === 'full' ? Math.floor(this.vote_average / 2) : (type === 'half' ? Math.ceil(this.vote_average / 2) : 5)

        for (let i = lowerBound; i <= upperBound; i++) {
            arr.push(i)
        }

        return arr
    },
    overview_short: function() {
        return `${this.overview.slice(0, 150)}...`
    }
})

Template.navbar.onRendered(() => {
    $('.dropdown-button').dropdown()
})
