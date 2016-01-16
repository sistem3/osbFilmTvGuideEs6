'use strict';

(function() {
    let template = `
    	<style>
    	    @import url('https://fonts.googleapis.com/css?family=Roboto:400,300');
            @import url('https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css');
            @import '/src/css/osbFilmTvGuide.css';
    	</style>
    	<main class="filmTvGuide">
    	    <header>
    	        <h1>TV/Movie Guide</h1>
                <p>Powered by TMDb</p>
                <nav>
                    <ul></ul>
                </nav>
    	    </header>
            <section class="filmTvGuide__listings">
                <ul class="feed-list"></ul>
            </section>
    	</main>
    	`;
    class osbFilmTvGuide extends HTMLElement {
        createdCallback() {
            this.createShadowRoot().innerHTML = template;
            this.baseUrl = 'https://api.themoviedb.org/3/';
            this.apiKey = '892ae99b0451fed76a0ece0a8d0c1414';
            this.section = 'movie';
            this.searchTerm = 'popular';
            this.$holder = this.shadowRoot.querySelector('.filmTvGuide__listings');
            this.getData(this.section, this.searchTerm);
        };

        attachedCallback() {};

        attributeChangedCallback(attrName, oldVal, newVal) {
            /*console.log(attrName);
            console.log(JSON.parse(newVal));*/
            if (attrName === 'listings') {
                this.renderListings(JSON.parse(newVal));
            }
        };

        renderListings(listing) {
            console.log(listing);
            var templateHolder = this.$holder.querySelector('.feed-list');
            listing.forEach(function(element, index, array) {
                console.log(element);
                templateHolder.innerHTML +=
                    '<li><img src="http://image.tmdb.org/t/p/w500'+ element.poster_path + '" /></li>';
            });
        };

        getData(section, searchTerm) {
            var base = this.baseUrl;
            var apiKey = this.apiKey;
            var holder = this;
            fetch(base + section + '/' + searchTerm + '?api_key=' + apiKey)
                .then(function(response) {
                    console.log(response);
                    //console.log('Location Success');
                    if (response.status !== 200) {
                        console.log('Looks like there was a problem. Status Code: ' + response.status);
                        return;
                    }
                    response.json().then(function(data) {
                        console.log(data);
                        var listings = JSON.stringify(data.results);
                        return holder.setAttribute('listings', listings);
                    });
                })
                .catch(function(err) {
                    console.log('Failed');
                });
        };
    }
    // Register Element
    document.registerElement('osb-film-tv-guide', osbFilmTvGuide);
})();