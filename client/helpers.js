Template.home.helpers({
    fullStars: function() {
        let arr = []

        for (let i = 1; i < Math.floor(this.vote_average / 2); i++) {
            arr.push(i)
        }

        return arr
    },
    halfStars: function() {
        let arr = []

        for (let i = Math.floor(this.vote_average / 2); i < Math.ceil(this.vote_average / 2); i++) {
            arr.push(i)
        }

        return arr
    },
    emptyStars: function() {
        let arr = []

        for (let i = Math.ceil(this.vote_average / 2); i <= 5; i++) {
            arr.push(i)
        }

        return arr
    },
})
