import { isEmpty } from "lodash";

export const shouldRedirectToLogin = (props) => {
  return isEmpty(props.userSession);
};

export const shouldRedirectToLandingPage = (props) => {
  return !isEmpty(props.userSession);
};

export const redirectToPage = (link, props) => {
  const { history } = props;
  history.push(link);
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth",
  });
};

export default {
  shouldRedirectToLogin,
  shouldRedirectToLandingPage,
  redirectToPage,
};
