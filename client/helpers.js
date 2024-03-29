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
    movies: () => (Template.instance().data.results || []).filter(i => !!i.backdrop_path),
    year: function() {
        return this.release_date.slice(0, 4)
    }
})

Template.navbar.onRendered(() => {
    $('.dropdown-button').dropdown()
})

Template.navbar.helpers({
    history: () => history.length > 0,
    home: () => ((Router.current() || {}).route || {}).getName() === 'home'
})
