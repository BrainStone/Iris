
import React, { PropTypes } from 'react'
import FontAwesome from 'react-fontawesome'
import { Link } from 'react-router'

export default class ArtistSentence extends React.Component{

	constructor(props) {
		super(props);
	}

	render(){
		if( !this.props.artists ) return <span>-</span>

		return (
			<span className="artist-sentence">
				{
					this.props.artists.map( (artist, index) => {
						var separator = null;
						if( index == this.props.artists.length - 2 ){
							separator = ' and ';
						}else if( index < this.props.artists.length - 2 ){
							separator = ', ';
						}
						if( !artist.name ) artist.name = '-'
						if( artist.uri ){
							var content = <Link className="artist" to={'/artist/'+artist.uri}>{ artist.name }</Link>
						}else{
							var content = <span>{ artist.name }</span>
						}
						return (
							<span key={'index_'+artist.uri}>
								{ content }
								{ separator }
							</span>
						);
					})
				}
			</span>
		);
	}
}