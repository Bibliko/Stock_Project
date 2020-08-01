import React from 'react';

import { withStyles } from '@material-ui/core/styles';

import Fade from '@material-ui/core/Slide';
import Alert from '@material-ui/lab/Alert';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';

import CloseIcon from '@material-ui/icons/Close';

const styles = theme => ({
	reminderBox: {
		position: '-webkit-sticky', /* Safari */
		position: 'sticky',
	},
});

class StickyReminder extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			visible: true;
		}
		this.closeReminder = this.closeReminder.bind(this);
	}

	closeReminder() {
		this.setState({
			visible: false
		});
	}

	render() {
		const { classes, collapsible, stickyPosition, message } = this.props;
		const style = { [stickyPosition]: '5px' };	// posible value for stickyPosition prop: top, bottom, left, right
		const { visible } = this.state;

		return (
			<Fade in={visible} timeout={800} className={classes.reminderBox} style={style} mountOnEnter unmountOnExit>
				<Alert severity="warning"
					action={
						<span>
							{this.props.children}    {/* Custom button */}
							{
								collapsible &&
								<IconButton
									aria-label="close"
									color="inherit"
									size="small"
									onClick={ this.closeReminder }
								>
									<CloseIcon/>
								</IconButton>
							}
						</span>
					}
				>
					{message}
				</Alert>
			</Fade>
		);
	}
}

export default withStyles(styles)(StickyReminder);