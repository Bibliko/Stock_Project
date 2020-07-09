import _ from 'lodash';

export const shouldRedirectToLogin = (props) => {
    return _.isEmpty(props.userSession);
}

export const shouldRedirectToLandingPage = (props) => {
    return !_.isEmpty(props.userSession);
}

export const redirectToPage = (link, props) => {
    const { history } = props;
    history.push(link);
} 

/**
 *  shouldRedirectToLogin,
 *  shouldRedirectToLandingPag     
 *  redirectToPage
 */ 