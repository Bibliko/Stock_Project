import React from 'react';
import {
    AppBar,
    Tabs,
    Tab
    } from "@material-ui/core"
import { redirectToPage } from '../../../utils/low-dependency/PageRedirectUtil';
import { 
    getOverallRanking, 
    getRegionalRanking 
    } from "../../../utils/UserUtil";
import { withStyles } from "@material-ui/core/styles";

const styles = (theme) => ({
    root: {
        width: theme.customWidth.redirectingPaper,
        height: theme.customHeight.redirectingPaper,
        backgroundColor: theme.palette.paperBackground.main,
        alignItems: "center",
        justifyContent: "center",
    },
    appBar: {
        flexGrow: 1,
        width: "100%",
        backgroundColor: "white"
    },
    tab: {
        color: '#9ED2EF'
    },
    button: {
        marginRight: "30px",
        marginBottom: "40px",
        color='#9ED2EF',
        fontWeight: "bold",
      },
})

function TabPannel(props) {
    const { children, selectedTab , index} = props;
    return (
        <div>
            {
                selectedTab === index && (
                    <Box>
                        <Typography>{children}</Typography>
                    </Box>
                )
            }
        </div>
    )
}

class RankingPaper extends React.Component { 
    state = {
        overall: [],
        region: [],
    }

    const [selectedTab, setSelectedTab] = React.useState(0);

    const handleChange = (event, newSelectedTab) => {
        setSelectedTab(newSelectedTab);
    };           

    componentDidMount() {
        getOverallRanking(1).then((top8UsersOnPage1) => {
            this.setState({
                overall: top8UsersOnPage1.data
            })           
        });
            
        getRegionalRanking(1, region).then((top8UsersOnPage1) => {
            this.setState({
                region: top8UsersOnPage1.data
            })
        });

    }

    render () {
        const { overall, region } = this.state;
        const { classes } = this.props;
        return (
            <div className={classes.root}>
                <AppBar className={classes.appBar} position="static">
                    <Tabs 
                        value={selectedTab}
                        onChange={handleChange}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="scrollable"
                        scrollButtons="auto" 
                        className={classes.tab} >
                        <Tab label="Overall Ranking" />
                        <Tab label="Region Ranking" />
                        <Tab label="Top 5 User" />
                    </Tabs>
                </AppBar>
                <TabPannel value={selectedTab} index={0}>
                    {this.state.overall}              
                    <Button 
                        variant="text" 
                        size="small" 
                        onClick={() => {redirectToPage("/ranking", this.props)}}
                        className={classes.button}> See more</Button>                    
                </TabPannel>
                <TabPannel value={selectedTab} index={1}>
                    {this.state.region}           
                    <Button 
                        variant="text" 
                        size="small" 
                        onClick={() => {redirectToPage("/ranking", this.props)}}
                        className={classes.button}> See more</Button>                    
                </TabPannel>
                <TabPannel value={selectedTab} index={2}>
                    {this.state.overall.slice(0, 5)}    
                    {this.state.region.slice(0, 5)}
                    <Button 
                        variant="text" 
                        size="small" 
                        color="primary"
                        onClick={() => {redirectToPage("/ranking", this.props)}}
                        className={classes.button}> See more</Button>                
                </TabPannel>            
            </div>            
        )
    }
}

export default withStyles(styles)(RankingPaper);