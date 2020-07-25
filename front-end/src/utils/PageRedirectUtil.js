import { isEmpty } from 'lodash';

export const shouldRedirectToLogin = (props) => {
    return isEmpty(props.userSession);
}

export const shouldRedirectToLandingPage = (props) => {
    return !isEmpty(props.userSession);
}

export const redirectToPage = (link, props) => {
    const { history } = props;
    history.push(link);
} 

export default {
    shouldRedirectToLogin,
    shouldRedirectToLandingPage,
    redirectToPage
}