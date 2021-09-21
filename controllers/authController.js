const axios = require("axios");
const utils = require("../utils");
const querystring = require("querystring");

exports.login = (req, res) => {
  let consumer_key = process.env["MEETUP_CONSUMER_KEY"];
  let redirect_uri = process.env.DOMAIN + "/request_access";

  res.redirect(
    `https://secure.meetup.com/oauth2/authorize?client_id=${consumer_key}&response_type=code&redirect_uri=${redirect_uri}`
  );
};

exports.request_access = async (req, res) => {
  try {
    let code = req.query.code;
    let consumer_key = process.env.MEETUP_CONSUMER_KEY;
    let consumer_secret = process.env.MEETUP_CONSUMER_SECRET;
    let redirect_uri = process.env.DOMAIN + "/request_access";

    let response = await axios.post(
      "https://secure.meetup.com/oauth2/access",
      querystring.stringify({
        client_id: consumer_key,
        client_secret: consumer_secret,
        grant_type: "authorization_code",
        redirect_uri: redirect_uri,
        code: code,
      })
    );

    utils.login(req, response.data);

    return res.redirect("/dashboard");
  } catch (error) {
    console.log(error);

    return res.redirect("/login");
  }
};

exports.refresh_token = async (req, res) => {
  try {
    let refresh_token = req.session.refresh_token;
    let consumer_key = process.env.MEETUP_CONSUMER_KEY;
    let consumer_secret = process.env.MEETUP_CONSUMER_SECRET;

    let response = await axios.post(
      "https://secure.meetup.com/oauth2/access",
      querystring.stringify({
        client_id: consumer_key,
        client_secret: consumer_secret,
        grant_type: "refresh_token",
        refresh_token: refresh_token,
      })
    );

    utils.login(req, response.data);

    return res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
    utils.logout(req);

    return res.redirect("/login");
  }
};
