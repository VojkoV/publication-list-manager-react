import React, {Component} from "react";
import { Dialog, Backdrop, Collapse, Button, Container, Typography, Paper } from "@material-ui/core";
import axios from "axios";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';
import LogInProviders from './LogInProviders'
import Toggle2FA from './Toggle2FA'
import Disable2FA from './Disable2FA'
import CancelIcon from '@material-ui/icons/Cancel';

const styles = theme => ({
    formCard: {
        backgroundColor: "#b2dfdb",
        // color: "primary",
        color: theme.palette.primary.main,
        padding: "30px 20px",
        margin: "0 auto",
        maxWidth: "650px",
    },
    formField: {
        margin: "7px 15px",
        width: "500px",
        // minWidth: "235px",
        [theme.breakpoints.down('xs')]: {
            width: "235px",
        },
    },
    textContainer: {
        maxWidth: "550px",
        margin: "auto",
        marginTop:"40px",
        marginBottom: "20px",
    },
    providerCard:{
        display: "flex",
        flexDirection: "row",
        // alignContent: "center",
        alignItems: 'center',
    },
    linkText: {
        textDecoration: `none`,
        textTransform: `uppercase`,
        color: `white`
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },   
})

class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            providers: {},
            loadingProviders: true,
            errors: {},
            twoFAenabled: null,
            openBackdrop: false,
        };   
        this.handleToggle = this.handleToggle.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }

    change2faEnabled = (boolean) => {
        this.setState({
            twoFAenabled: boolean
        });
    }

    handleChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value,
            errors: {
                ...this.state.errors,
                [event.target.name]: null,
            },
        });
    };
    setErrorMsg = (fieldName, message) =>{   
        this.setState((prevState) => ({
            errors: {
                ...prevState.errors,
                [fieldName]: message,
            },
        }))
        return false;
    }
    componentDidMount(){
        axios
            .get("http://localhost:8080/account/providers")
            .then((res) => {
                let providers = []
                console.log(res.data)
                if (!res.data.Providers){
                    console.log("there are providers")
                    for (const [providerName, providerURL] of Object.entries(res.data)) {
                        console.log(`${providerName}:  ${providerURL}`);
                        providers.push({
                            providerName: providerName,
                            providerURL: providerURL
                        })
                    }
                    console.log(providers)
                    this.setState({
                        providers: providers,
                        // providers: [],
                        loadingProviders: false
                    });
                    // console.log("loadingProvidres: "+this.state.loadingProviders )
                }
            })
            .catch((err) => {
                console.log(err)
                console.log(err.response)
            })

        axios
            .get("http://localhost:8080/account/is2FAenabled")
            .then((res) => {
                console.log(res.data.enabled)
                this.setState({twoFAenabled: res.data.enabled})
            })
            .catch((err) => {
                console.log(err)
                console.log(err.response)
            })
    }

    handleClose(){
        this.setState({openBackdrop: false})
        // setOpen(false);
    };
    handleToggle(){
        this.setState((prevState)=>({
            openBackdrop: !prevState.openBackdrop,
        }))
        // setOpen(!open);
    };

    render(){
        let tokenData = JSON.parse(atob(axios.defaults.headers.common["Authorization"].split('.')[1]));
        console.log(tokenData)
        const { classes } = this.props;
        return (
        <div>
            <Container color="primary" className={classes.textContainer}>
                <Typography variant="h4">Profile:</Typography>
            </Container>
            {console.log(this.state.providers)}
            <Paper elevation={7} className={classes.formCard}>
                <div className={classes.fieldsContainer}>
                    
                    {tokenData.firstName}<br/>
                    {tokenData.lastName}<br/>
                    {tokenData.sub}<br/>
                    <Collapse in={this.state.twoFAenabled !== null}>
                        <div style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: 'center',}}>
                                <Typography variant="body1">Two-Factor Authentication is {this.state.twoFAenabled ? "enabled" : "disabled"}</Typography>
                                <Button onClick={this.handleToggle} variant="contained" color="primary" style={{marginLeft: "5%",}}>
                                    {this.state.twoFAenabled ? "Disable" : "Enable"} it
                                </Button>

                                <Dialog className={classes.backdrop} open={this.state.openBackdrop}>
                                    {this.state.twoFAenabled ?
                                        <Disable2FA handleClose={this.handleClose} change2faEnabled={this.change2faEnabled}/> :
                                        <Toggle2FA change2faEnabled={this.change2faEnabled} twoFAenabled={this.state.twoFAenabled} handleClose={this.handleClose}/> 
                                    }
                                </Dialog>

                        </div>
                    </Collapse>

                    {this.state.loadingProviders ?
                        <h1>Loading providers...</h1> :
                        <LogInProviders providers={this.state.providers}/>
                    }
                    <br/>
                </div>
            </Paper>
        </div>
    )}

}

Profile.propTypes = {
    classes: PropTypes.object.isRequired,
};
    
export default withStyles(styles)(Profile);
