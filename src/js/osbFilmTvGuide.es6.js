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
            <section class="filmTvGuide__modal"></section>
    	</main>
    	`;
    class osbFilmTvGuide extends HTMLElement {
        createdCallback() {
            this.createShadowRoot().innerHTML = template;
            this.storagePrefix = 'osbFilmTvGuide.user';
            this.baseUrl = 'https://api.themoviedb.org/3/';
            this.apiKey = '892ae99b0451fed76a0ece0a8d0c1414';
            this.user = {};
            this.user.favourites = [];
            this.user.watched = [];
            this.section = 'movie';
            this.searchTerm = 'popular';
            this.$holder = this.shadowRoot.querySelector('.filmTvGuide__listings');
            this.$modal = this.shadowRoot.querySelector('.filmTvGuide__modal');

            var userDetails = localStorage.getItem('osbFilmTvGuide.user');
            if (!userDetails) {
                localStorage.setItem(this.storagePrefix, JSON.stringify(this.user));
            }

            this.getData(this.section, this.searchTerm);
        };

        attachedCallback() {};

        attributeChangedCallback(attrName, oldVal, newVal) {
            if (attrName === 'listings') {
                this.renderListings(JSON.parse(newVal));
            }
        };

        renderListings(listing) {
            var user = JSON.parse(localStorage.getItem('osbFilmTvGuide.user'));
            // Get template feed list and loop through feed
            var templateHolder = this.$holder.querySelector('.feed-list');
            listing.forEach(function(element, index, array) {
                //console.log(element);
                if (user.favourites) {
                    element.favActive = '';
                    //console.log('Add favourites');
                    user.favourites.forEach(function(index, value) {
                        if (index.id == element.id) {
                            console.log('Add fav');
                            element.favActive = 'favouriteActive';
                        }
                    });
                }
                if (user.watched) {
                    element.watchedActive = '';
                    //console.log('Add watched');
                    user.watched.forEach(function(index, value) {
                        if (index.id == element.id) {
                            console.log('Add watched');
                            element.watchedActive = 'watchedActive';
                        }
                    });
                }
                templateHolder.innerHTML +=
                    '<li>' +
                        '<div id="' + element.id + '" class="filmTvGuide__listings--nav">' +
                        '<a title="More Info" class="infoBtn"><i class="fa fa-info-circle"></i></a>' +
                        '<a title="Add to Watched" class="watchedBtn ' + element.watchedActive + '"><i class="fa fa-eye"></i></a>' +
                        '<a title="Add to Favourite" class="favouriteBtn ' + element.favActive + '"><i class="fa fa-heart"></i></a></div>' +
                        '<img src="http://image.tmdb.org/t/p/w500'+ element.poster_path + '" />' +
                    '</li>';
            });
            // Not sure if I am feeling this loop for click function 0_o
            var favBtns = this.$holder.getElementsByClassName('favouriteBtn');
            for (var i = 0; i < favBtns.length; i++) {
                favBtns[i].addEventListener('click', event => this.setFavourite(event));
            }

            var watchedBtns = this.$holder.getElementsByClassName('watchedBtn');
            for (var j = 0; j < watchedBtns.length; j++) {
                watchedBtns[j].addEventListener('click', event => this.setWatched(event));
            }

            var infoBtns = this.$holder.getElementsByClassName('infoBtn');
            for (var k = 0; k < watchedBtns.length; k++) {
                infoBtns[k].addEventListener('click', event => this.getDetails(event));
            }
        };

        getDetails(id) {
            var base = this.baseUrl;
            var apiKey = this.apiKey;
            var section = this.section;
            var holder = this;
            fetch(base + section + '/' + id.path[2].id + '?api_key=' + apiKey)
                .then(function(response) {
                    if (response.status !== 200) {
                        console.log('Looks like there was a problem. Status Code: ' + response.status);
                        return;
                    }
                    response.json().then(function(data) {
                        console.log(data);
                        holder.$modal.setAttribute('class', 'filmTvGuide__modal show');
                    });
                })
                .catch(function(err) {
                    console.log('Failed');
                });
        };

        getData(section, searchTerm) {
            var base = this.baseUrl;
            var apiKey = this.apiKey;
            var holder = this;
            fetch(base + section + '/' + searchTerm + '?api_key=' + apiKey)
                .then(function(response) {
                    if (response.status !== 200) {
                        console.log('Looks like there was a problem. Status Code: ' + response.status);
                        return;
                    }
                    response.json().then(function(data) {
                        //console.log(data);
                        var listings = JSON.stringify(data.results);
                        return holder.setAttribute('listings', listings);
                    });
                })
                .catch(function(err) {
                    console.log('Failed');
                });
        };

        setFavourite(id) {
            this.user = JSON.parse(localStorage.getItem('osbFilmTvGuide.user'));
            if (this.user.favourites) {
                var exists = false;
                this.user.favourites.forEach(function(element, index, array) {
                    if(element.id == id.path[2].id) {
                        console.log('Exists');
                        exists = true;
                    }
                });
                // If the id doesn't exist add
                if (!exists) {
                    this.user.favourites.push({'section': this.section,'id': id.path[2].id});
                    localStorage.setItem(this.storagePrefix, JSON.stringify(this.user));
                }
            }
        };

        setWatched(id) {
            this.user = JSON.parse(localStorage.getItem('osbFilmTvGuide.user'));
            if (this.user.watched) {
                var exists = false;
                this.user.watched.forEach(function(element, index, array) {
                    if(element.id == id.path[2].id) {
                        console.log('Exists');
                        exists = true;
                    }
                });
                // If the id doesn't exist add
                if (!exists) {
                    this.user.watched.push({'section': this.section,'id': id.path[2].id});
                    localStorage.setItem(this.storagePrefix, JSON.stringify(this.user));
                }
            }
        };
    }
    // Register Element
    document.registerElement('osb-film-tv-guide', osbFilmTvGuide);
})();