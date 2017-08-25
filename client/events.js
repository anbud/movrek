Template.home.events({
    'click .star': (event, templateInstance) => {
        console.log($(event.currentTarget).data('val'))
    }
})
