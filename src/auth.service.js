import axios from "axios";

const API_URL = window.location.hostname === 'localhost' ? "http://localhost:8080/v1" : "https://test-api.raskrask.dk/v1";

const fetch = (url, options) => {
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };

    // if (loggedIn()) {
    //     headers['Authorization'] = 'Bearer ' + getToken()
    // }

    return axios({
        headers,
        url: url,
        ...options
    })
    .then(res => res);
}

const AuthService = {
    fetch,
    API_URL
};

export default AuthService;