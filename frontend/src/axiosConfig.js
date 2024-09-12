import axios from 'axios';


axios.defaults.withCredentials = true;



axios.defaults.baseURL = 'http://localhost:8000/api/v1/users';


export default axios;
