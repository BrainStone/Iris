
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import FontAwesome from 'react-fontawesome'

import SidebarToggleButton from '../../components/SidebarToggleButton'
import ArtistSentence from '../../components/ArtistSentence'
import ArtistGrid from '../../components/ArtistGrid'
import AlbumGrid from '../../components/AlbumGrid'
import TrackList from '../../components/TrackList'
import Parallax from '../../components/Parallax'
import AddSeedField from '../../components/AddSeedField'
import * as helpers from '../../helpers'
import * as spotifyActions from '../../services/spotify/actions'

class Discover extends React.Component{

	constructor(props) {
		super(props)

		this._autocomplete_timer = false

		this.state = {
			seeds: [
				{
					uri: 'spotify:genre:chill',
					name: 'Chill'
				}
			],
			add_seed: '',
			adding_seed: false
		}
	}

	componentDidMount(){
		if (this.props.authorized){
			this.props.spotifyActions.getFavorites()
		} else {
			this.getRecommendations()
		}
	}

	componentWillReceiveProps(newProps, newState){

		// When we've loaded favorite_artists.
		// This indirectly listens for when the action has
		// loaded new data.
		if (this.props.favorite_artists.length <= 0 && newProps.favorite_artists.length > 0){
			var initial_seeds = newProps.favorite_artists.sort(() => .5 - Math.random())
			initial_seeds = initial_seeds.slice(0,2)

			this.setState({seeds: initial_seeds})
			this.getRecommendations(initial_seeds)
		}
	}

	getRecommendations(seeds = this.state.seeds){
		if (seeds.length > 0){
			var uris = helpers.asURIs(seeds)
			this.props.spotifyActions.getRecommendations(uris, 50)
		}
	}

	removeSeed(index){
		var seeds = this.state.seeds
		seeds.splice(index,1)
		this.setState({seeds: seeds})
		this.getRecommendations(seeds)
	}

	handleSelect(e,item){
		var seeds = this.state.seeds
		seeds.push(item)
		this.setState({seeds: seeds})
		this.getRecommendations(seeds)
	}

	renderSeeds(){
		return (
			<div className="seeds">
				{
					this.state.seeds.map((seed,index) => {
						var type = helpers.uriType(seed.uri)
						if (!type){
							type = 'genre'
						}
						return (
							<span className="seed" key={seed.uri}>
								{seed.name}
								<span className="type">({type})</span>
								<FontAwesome name="close" className="remove" onClick={() => this.removeSeed(index)} />
							</span>
						)
					})
				}
				<AddSeedField onSelect={(e,item) => this.handleSelect(e,item)} />
			</div>
		)
	}

	renderResults(){
		if (helpers.isLoading(this.props.load_queue,['spotify_recommendations'])){
			return (
				<div className="body-loader">
					<div className="loader"></div>
				</div>
			)
		}
		
		if (!this.props.recommendations || typeof(this.props.recommendations.albums_uris) === 'undefined' || typeof(this.props.recommendations.artists_uris) === 'undefined'){
			return null
		}

		var albums = []
		if (this.props.recommendations.albums_uris && this.props.albums){
			for (var i = 0; i < this.props.recommendations.albums_uris.length; i++){
				var uri = this.props.recommendations.albums_uris[i]
				if (this.props.albums.hasOwnProperty(uri)){
					albums.push(this.props.albums[uri])
				}
			}
		}

		var artists = []
		if (this.props.recommendations.artists_uris && this.props.artists){
			for (var i = 0; i < this.props.recommendations.artists_uris.length; i++){
				var uri = this.props.recommendations.artists_uris[i]
				if (this.props.artists.hasOwnProperty(uri)){
					artists.push(this.props.artists[uri])
				}
			}
		}
		
		return (
			<div className="recommendations-results">
				<section className="grid-wrapper">
					<h4>Artists</h4>
					<ArtistGrid artists={artists} />
				</section>
				<section className="grid-wrapper">
					<h4>Albums</h4>
					<AlbumGrid albums={albums} />
				</section>
				<section className="list-wrapper">
					<h4 className="left-padding">Tracks</h4>
					{this.props.recommendations.tracks ? <TrackList className="discover-track-list" uri="iris:discover" tracks={this.props.recommendations.tracks} /> : null}
				</section>
			</div>
		)
	}

	render(){
		return (
			<div className="view discover-view">
				<SidebarToggleButton />
				<div className="intro">
					<Parallax image="/iris/assets/backgrounds/discover.jpg" />
					<div className="liner">
						<h1>Discover new music</h1>
						<h3>
							Add seeds below to build your sound. Let's start with 
							{this.props.authorized ? " two of your favorite artists" : " the chill genre"}.
						</h3>
						{this.renderSeeds()}
					</div>
				</div>
				{this.renderResults()}
			</div>
		)
	}
}


/**
 * Export our component
 *
 * We also integrate our global store, using connect()
 **/

const mapStateToProps = (state, ownProps) => {
	return {
		albums: state.ui.albums,
		artists: state.ui.artists,
		authorized: state.spotify.authorized,
		load_queue: state.ui.load_queue,
		quick_search_results: (state.spotify.quick_search_results ? state.spotify.quick_search_results : {artists: [], tracks: []}),
		recommendations: (state.spotify.recommendations ? state.spotify.recommendations : {}),
		favorite_artists: (state.spotify.favorite_artists ? state.spotify.favorite_artists : []),
		favorite_tracks: (state.spotify.favorite_tracks ? state.spotify.favorite_tracks : [])
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		spotifyActions: bindActionCreators(spotifyActions, dispatch)
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Discover)