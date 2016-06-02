'use strict';

(function() {
    let template = `
    	<style>
    	    @import url('https://fonts.googleapis.com/css?family=Roboto:400,300');
            @import url('https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css');
            @import url('https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css');
            @import url('https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap-theme.min.css');
            @import '/src/css/osbFilmTvGuide.css';
    	</style>
    	<main class="filmTvGuide">
    	    <header class="container">
    	        <h1>TV/Movie Guide</h1>
                <p>Powered by TMDb</p>
                <nav>
                    <ul class="list-unstyled list-inline main-nav-list"></ul>
                </nav>
    	    </header>
            <section class="filmTvGuide__listings">
                <ul class="feed-list"></ul>
                <div id="filmLoader">
                    <div>
                        <i class="fa fa-spinner fa-spin"></i>
                        <p>Loading...</p>
                    </div>
                </div>
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
            this.sections = [
                {name: 'Popular movies', section: 'movie', searchTerm: 'popular', icon: 'fa-film'},
                {name: 'Upcoming Movies', section: 'movie', searchTerm: 'upcoming', icon: 'fa-film'},
                {name: 'Top Rated Movies', section: 'movie', searchTerm: 'top_rated', icon: 'fa-film'},
                {name: 'Popular TV Shows', section: 'tv', searchTerm: 'popular', icon: 'fa-desktop'},
                {name: 'Top Rated TV Shows', section: 'tv', searchTerm: 'top_rated', icon: 'fa-desktop'}
            ];
            this.section = 'movie';
            this.searchTerm = 'popular';
            this.$holder = this.shadowRoot.querySelector('.filmTvGuide__listings');
            this.$modal = this.shadowRoot.querySelector('.filmTvGuide__modal');
            this.$mainNav = this.shadowRoot.querySelector('.main-nav-list');

            var userDetails = localStorage.getItem('osbFilmTvGuide.user');
            if (!userDetails) {
                localStorage.setItem(this.storagePrefix, JSON.stringify(this.user));
            }

            var mainNavHolder = this.$mainNav;
            this.sections.forEach(function(element) {
                mainNavHolder.innerHTML +=
                    '<li>' +
                        '<button class="btn btn-primary" data-section="' + element.section + '" data-search-term="' + element.searchTerm + '">' +
                            element.name + ' <i class="fa ' + element.icon + '"></i>' +
                        '</button>' +
                    '</li>';
            });

            var mainNavBtns = this.$mainNav.getElementsByClassName('btn');
            for (var i = 0; i < mainNavBtns.length; i++) {
                mainNavBtns[i].addEventListener('click', event => this.getSection(event));
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
            var templateHolder = this.$holder;
            listing.forEach(function(element, index, array) {
                //console.log(element);
                if (user.favourites) {
                    element.favActive = '';
                    //console.log('Add favourites');
                    user.favourites.forEach(function(index, value) {
                        if (index.id == element.id) {
                            element.favActive = 'favouriteActive';
                        }
                    });
                }
                if (user.watched) {
                    element.watchedActive = '';
                    //console.log('Add watched');
                    user.watched.forEach(function(index, value) {
                        if (index.id == element.id) {
                            element.watchedActive = 'watchedActive';
                        }
                    });
                }
                templateHolder.querySelector('.feed-list').innerHTML +=
                    '<li>' +
                        '<div id="' + element.id + '" class="filmTvGuide__listings--nav">' +
                        '<a title="More Info" class="infoBtn"><i class="fa fa-info-circle"></i></a>' +
                        '<a title="Add to Watched" class="watchedBtn ' + element.watchedActive + '"><i class="fa fa-eye"></i></a>' +
                        '<a title="Add to Favourite" class="favouriteBtn ' + element.favActive + '"><i class="fa fa-heart"></i></a></div>' +
                        '<img src="http://image.tmdb.org/t/p/w500'+ element.poster_path + '" class="img-responsive" />' +
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

            setTimeout(function() {
                var controller = new ScrollMagic.Controller();
                var scene = new ScrollMagic.Scene({triggerElement: '#filmLoader', triggerHook: 'onEnter'})
                    .addTo(controller)
                    .on('enter', function (e) {
                        console.log(e);
                        if (templateHolder.querySelector('#filmLoader').className.indexOf('active') == -1) {
                            /*element.find('#filmLoader').addClass('active');
                             $scope.filmTvGuide.getMoreData();*/
                            console.log('Load more data');
                        }
                    });
                scene.update();
            }, 2500);
        };

        closeModal() {
            console.log('Close modal');
            this.$modal.setAttribute('class', 'filmTvGuide__modal');
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
                        holder.$modal.setAttribute('class', 'filmTvGuide__modal show');
                        holder.$modal.innerHTML =
                            '<img src="http://image.tmdb.org/t/p/w1000' + data.backdrop_path + '" title="" />' +
                            '<div class="filmTvGuide__modal--content img-rounded">' +
                                '<div class="filmTvGuide__modal--closeBtn"><i class="fa fa-close"></i></div>' +
                                '<div class="col-md-8">' +
                                    '<h1>' + data.title + '</h1>' +
                                    '<h4>' + data.tagline + '</h4>' +
                                    '<p>' + data.overview + '</p>' +
                                    '<p>Status: ' + data.status + '</p>' +
                                '</div>' +
                                '<div class="col-md-4">' +
                                    '<img src="http://image.tmdb.org/t/p/w500' + data.poster_path + '" class="img-responsive" title="' + data.title + '" />' +
                                '</div>' +
                            '</div>';

                        holder.$modal.querySelector('.filmTvGuide__modal--closeBtn').addEventListener('click', event => holder.closeModal());
                    });
                })
                .catch(function(err) {
                    console.log('Failed');
                });
        };

        getSection(id) {
            var section = id.path[0].getAttribute('data-section');
            var searchTerm = id.path[0].getAttribute('data-search-term');
            this.$holder.querySelector('.feed-list').innerHTML = '';
            this.getData(section, searchTerm);
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