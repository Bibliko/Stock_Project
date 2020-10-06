import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { redirectToPage } from '../../utils/low-dependency/PageRedirectUtil';
import { getOverallRanking } from "../../../utils/UserUtil";
import { getRegionalRanking } from "../../../utils/UserUtil";
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
        marginBottom: "40px"
        color="#9ED2EF"
        fontWeight: "bold",
      },
})


class RankingPaper extends React.Component { 
    constructor(props) {
        super(props) 

        this.state = {
            overall: [],
            region: [],
            top5Overall: [],
            top5Region: [],
        }
    }

    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };           

    componentDidMount() {
        getOverallRanking(1).then((res) => {
            this.setState({
                overall: res.data
            })           
        });
            
        getRegionalRanking(1, region).then((res) => {
            this.setState({
                region: res.data
            })
        });
        

        getOverallRanking(1).then((res) => {
            this.setState({
                overall: res.data
                top5Overall: this.state.region.slice(0, 5)
            })         
        });

        getRegionalRanking(1, region).then((res) => {
            this.setState({
                region: res.data
                top5Region: this.state.region.slice(0, 5)
            })
        });        

    }

    render () {
        const { overall, region, top5Overall, top5Region } = this.state;
        const { classes } = this.props;
        return (
            <Container className={classes.root} disableGutters>
                <AppBar className={classes.appBar} position="static">
                    <Tabs 
                        value={value}
                        onChange={handleChange}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="scrollable"
                        scrollButtons="auto" 
                        className={classes.tab} >
                        <Tab label="Overall Ranking" {...a11yProps(0)} />
                        <Tab label="Region Ranking" {...a11yProps(1)} />
                        <Tab label="Top 5 User" {...a11yProps(2)} />
                    </Tabs>
                </AppBar>
                <TabPannel value={value} index={0}>
                    <OverallRanking>
                        {this.showRanking(overall)}
                    </OverallRanking>              
                    <Button 
                        variant="text" 
                        size="small" 
                        onClick={() => {redirectToPage("/ranking", this.props)}}
                        className={classes.button}> See more</Button>                    
                </TabPannel>
                <TabPannel value={value} index={1}>
                    <RegionalRanking>
                        {this.showRanking(region)}
                    </RegionalRanking>            
                    <Button 
                        variant="text" 
                        size="small" 
                        onClick={() => {redirectToPage("/ranking", this.props)}}
                        className={classes.button}> See more</Button>                    
                </TabPannel>
                <TabPannel value={value} index={2}>
                    <Top5Overall>
                        {this.showRanking(top5Overall)}
                    </Top5Overall>        
                    <Top5Region>
                        {this.showRanking(top5Region)}
                    </Top5Region>
                    <Button 
                        variant="text" 
                        size="small" 
                        onClick={() => {redirectToPage("/ranking", this.props)}}
                        className={classes.button}> See more</Button>                
                </TabPannel>            
            </Container>            
        )
    }
}