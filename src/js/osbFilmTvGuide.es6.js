'use strict';

(function() {
    let template = `
    	<style>
    	</style>
    	<main class="osb-film-tv-guide-holder">
    	    <header>
    	        <h1>TV/Movie Guide</h1>
                <p>Powered by TMDb</p>
    	    </header>
            <section>
                <ul class="feed-list"></ul>
            </section>
    	</main>
    	`;
    class osbFilmTvGuide extends HTMLElement {
        createdCallback() {
            this.createShadowRoot().innerHTML = template;
            this.baseUrl = 'https://api.themoviedb.org/3/';
            this.apiKey = '892ae99b0451fed76a0ece0a8d0c1414';
            this.$holder = this.shadowRoot.querySelector('.osb-film-tv-guide-holder');
        };

        attachedCallback() {};

        attributeChangedCallback(attrName, oldVal, newVal) {};

        getData(section, searchTerm) {
            var holder = this;
            var base = this.baseUrl;
            var apiKey = this.apiKey;
            fetch(base + section + '/' + searchTerm + '&api_key=' + apiKey)
                .then(function(response) {
                    //console.log('Location Success');
                    if (response.status !== 200) {
                        console.log('Looks like there was a problem. Status Code: ' + response.status);
                        return;
                    }
                    response.json().then(function(data) {
                        /*var location = data.results[0].address_components[3].long_name;
                        return holder.setAttribute('location', location);*/
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