import { isEmpty } from "lodash";

export const shouldRedirectToLogin = (props) => {
  return isEmpty(props.userSession);
};

export const shouldRedirectToHomePage = (props) => {
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

export const openInNewTab = (url) => {
  const newWindow = window.open(url, "_blank", "noopener,noreferrer");
  if (newWindow) newWindow.opener = null;
};

export default {
  shouldRedirectToLogin,
  shouldRedirectToHomePage,
  redirectToPage,
  openInNewTab,
};
